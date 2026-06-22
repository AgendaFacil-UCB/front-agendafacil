const Agendamento = require('../models/agendamento');
const Servico = require('../models/servico');
const Usuario = require('../models/usuario');
const ServicoDisponibilidades = require('../models/servico_disponibilidades');
const { Op } = require('sequelize');

const TIMEZONE_AGENDAMENTO = 'America/Sao_Paulo';
const OFFSET_AGENDAMENTO = '-03:00';

const parseDataISO = (dataStr) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dataStr || '');
  if (!match) return null;

  const [, anoStr, mesStr, diaStr] = match;
  const ano = Number(anoStr);
  const mes = Number(mesStr);
  const dia = Number(diaStr);
  const dataReferencia = new Date(`${dataStr}T12:00:00${OFFSET_AGENDAMENTO}`);

  if (
    Number.isNaN(dataReferencia.getTime()) ||
    dataReferencia.getUTCFullYear() !== ano ||
    dataReferencia.getUTCMonth() + 1 !== mes ||
    dataReferencia.getUTCDate() !== dia
  ) {
    return null;
  }

  return { dataReferencia };
};

const criarDataAgendamento = (dataStr, horaStr, segundos = 0, milissegundos = 0) => {
  const dataISO = parseDataISO(dataStr);
  const horaMatch = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(horaStr || '');

  if (!dataISO || !horaMatch) return null;

  const [, hora, minuto] = horaMatch;
  const data = new Date(
    `${dataStr}T${hora}:${minuto}:${String(segundos).padStart(2, '0')}.${String(milissegundos).padStart(3, '0')}${OFFSET_AGENDAMENTO}`
  );

  return Number.isNaN(data.getTime()) ? null : data;
};

const formatarDataHora = (data) =>
  new Intl.DateTimeFormat('pt-BR', {
    timeZone: TIMEZONE_AGENDAMENTO,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(data));

const formatarHora = (data) =>
  new Intl.DateTimeFormat('pt-BR', {
    timeZone: TIMEZONE_AGENDAMENTO,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date(data));

const processarAgendamentos = (agendamentos) =>
  agendamentos.map(agendamento => {
    const json = agendamento.toJSON ? agendamento.toJSON() : agendamento;
    return {
      ...json,
      data_agendamento: json.inicioAgendamento ? formatarDataHora(json.inicioAgendamento) : '',
      fim_agendamento: json.fimAgendamento ? formatarHora(json.fimAgendamento) : '',

      nome_servico: json.servico ? json.servico.nome : '',
      nome_prestador: json.prestador ? json.prestador.nome : '',
      telefone_prestador: json.prestador ? json.prestador.telefone : '',
      nome_cliente: json.cliente ? json.cliente.nome : '',
      telefone_cliente: json.cliente ? json.cliente.telefone : '',
      ehPendente: json.status === 'pendente',
      ehConfirmado: json.status === 'confirmado',
      ehCancelado: json.status === 'cancelado',
    };
  });

const horaParaMinutos = (hora) => {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
};

const minutosParaHora = (minutos) => {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const getHorariosDisponiveis = async (servicoId, dataStr) => {
  const servico = await Servico.findByPk(servicoId);
  if (!servico) {
    const err = new Error('Servi\u00e7o n\u00e3o encontrado');
    err.code = 'SERVICO_NAO_ENCONTRADO';
    throw err;
  }

  const dataISO = parseDataISO(dataStr);
  if (!dataISO) {
    const err = new Error('Data inv\u00e1lida');
    err.code = 'DATA_INVALIDA';
    throw err;
  }

  const diaDaSemana = dataISO.dataReferencia.getUTCDay();

  const disponibilidades = await ServicoDisponibilidades.findAll({
    where: { servicoId, diaDaSemana }
  });

  if (!disponibilidades.length) {
    return [];
  }

  const inicioDia = criarDataAgendamento(dataStr, '00:00');
  const fimDia = criarDataAgendamento(dataStr, '23:59', 59, 999);

  const agendamentosDoDia = await Agendamento.findAll({
    where: {
      servicoId,
      status: { [Op.ne]: 'cancelado' },
      inicioAgendamento: { [Op.between]: [inicioDia, fimDia] }
    }
  });

  const ocupados = agendamentosDoDia.map(a => ({
    inicio: horaParaMinutos(formatarHora(a.inicioAgendamento)),
    fim: horaParaMinutos(formatarHora(a.fimAgendamento))
  }));

  const duracao = servico.duracao;
  const horarios = [];

  for (const disp of disponibilidades) {
    const inicioJanela = horaParaMinutos(disp.horaInicio);
    const fimJanela = horaParaMinutos(disp.horaFim);

    for (let slotInicio = inicioJanela; slotInicio + duracao <= fimJanela; slotInicio += duracao) {
      const slotFim = slotInicio + duracao;

      const conflita = ocupados.some(o => slotInicio < o.fim && slotFim > o.inicio);

      if (!conflita) {
        horarios.push({
          inicio: minutosParaHora(slotInicio),
          fim: minutosParaHora(slotFim)
        });
      }
    }
  }

  return horarios;
};

const criar = async ({ servicoId, data, horaInicio, clienteId }) => {
  const servico = await Servico.findByPk(servicoId);
  if (!servico) {
    const err = new Error('Servi\u00e7o n\u00e3o encontrado');
    err.code = 'SERVICO_NAO_ENCONTRADO';
    throw err;
  }

  const dataInicio = criarDataAgendamento(data, horaInicio);
  if (!dataInicio) {
    const err = new Error('Data/hora inv\u00e1lida');
    err.code = 'DATA_INVALIDA';
    throw err;
  }

  const dataFim = new Date(dataInicio.getTime() + servico.duracao * 60 * 1000);

  const horariosDisponiveis = await getHorariosDisponiveis(servicoId, data);
  const horarioValido = horariosDisponiveis.some(h => h.inicio === horaInicio);

  if (!horarioValido) {
    const err = new Error('Hor\u00e1rio n\u00e3o est\u00e1 dispon\u00edvel');
    err.code = 'CONFLITO';
    throw err;
  }

  const agendamento = await Agendamento.create({
    clienteId,
    servicoId,
    prestadorId: servico.prestadorId,
    inicioAgendamento: dataInicio,
    fimAgendamento: dataFim,
    status: 'pendente'
  });

  return {
    id: agendamento.id,
    servicoId,
    inicioAgendamento: dataInicio,
    fimAgendamento: dataFim,
    clienteId
  };
};

const cancelar = async (agendamentoId, usuarioId) => {
  const agendamento = await Agendamento.findByPk(agendamentoId);
  if (!agendamento) {
    const err = new Error('Agendamento n\u00e3o encontrado');
    err.code = 'NAO_ENCONTRADO';
    throw err;
  }

  const ehProprietario = agendamento.clienteId === usuarioId || agendamento.prestadorId === usuarioId;
  if (!ehProprietario) {
    const err = new Error('Sem permiss\u00e3o');
    err.code = 'PROIBIDO';
    throw err;
  }

  if (agendamento.status === 'cancelado') {
    const err = new Error('Agendamento j\u00e1 cancelado');
    err.code = 'JA_CANCELADO';
    throw err;
  }

  await agendamento.update({ status: 'cancelado' });
};

const confirmar = async (agendamentoId, prestadorId) => {
  const agendamento = await Agendamento.findByPk(agendamentoId);
  if (!agendamento) {
    const err = new Error('Agendamento n\u00e3o encontrado');
    err.code = 'NAO_ENCONTRADO';
    throw err;
  }

  if (agendamento.prestadorId !== prestadorId) {
    const err = new Error('Sem permiss\u00e3o');
    err.code = 'PROIBIDO';
    throw err;
  }

  if (agendamento.status !== 'pendente') {
    const err = new Error('Apenas agendamentos pendentes podem ser confirmados');
    err.code = 'STATUS_INVALIDO';
    throw err;
  }

  await agendamento.update({ status: 'confirmado' });
};

const buscarPorCliente = async (clienteId) => {
  const agendamentos = await Agendamento.findAll({
    where: { clienteId },
    include: [
      { model: Servico, as: 'servico' },
      { model: Usuario, as: 'prestador', attributes: ['id', 'nome', 'telefone'] }
    ],
    order: [['inicioAgendamento', 'DESC']]
  });

  return processarAgendamentos(agendamentos);
};

const buscarPorPrestador = async (prestadorId) => {
  const agendamentos = await Agendamento.findAll({
    where: { prestadorId },
    include: [
      { model: Servico, as: 'servico' },
      { model: Usuario, as: 'cliente', attributes: ['id', 'nome', 'telefone'] }
    ],
    order: [['inicioAgendamento', 'DESC']]
  });

  return processarAgendamentos(agendamentos);
};

const deletar = async (agendamentoId, usuarioId) => {
  const agendamento = await Agendamento.findByPk(agendamentoId);
  if (!agendamento) {
    const err = new Error('Agendamento n\u00e3o encontrado');
    err.code = 'NAO_ENCONTRADO';
    throw err;
  }

  const ehProprietario = agendamento.clienteId === usuarioId || agendamento.prestadorId === usuarioId;
  if (!ehProprietario) {
    const err = new Error('Sem permiss\u00e3o');
    err.code = 'PROIBIDO';
    throw err;
  }

  await agendamento.destroy();
}

const getDataHojeInput = () => {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE_AGENDAMENTO,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());

  const valores = Object.fromEntries(partes.map(parte => [parte.type, parte.value]));
  return `${valores.year}-${valores.month}-${valores.day}`;
};

module.exports = {
  criar,
  cancelar,
  confirmar,
  buscarPorCliente,
  buscarPorPrestador,
  processarAgendamentos,
  getHorariosDisponiveis,
  getDataHojeInput,
  deletar
};
