const Agendamento = require('../models/agendamento');
const Servico = require('../models/servico');
const Usuario = require('../models/usuario');
const ServicoDisponibilidades = require('../models/servico_disponibilidades');
const { Op } = require('sequelize');

const processarAgendamentos = (agendamentos) =>
  agendamentos.map(agendamento => {
    const json = agendamento.toJSON ? agendamento.toJSON() : agendamento;
    return {
      ...json,
      data_agendamento: json.inicioAgendamento
        ? new Date(json.inicioAgendamento).toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          })
        : '',
      fim_agendamento: json.fimAgendamento
        ? new Date(json.fimAgendamento).toLocaleString('pt-BR', {
            hour: '2-digit', minute: '2-digit'
          })
        : '',

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
    const err = new Error('Serviço não encontrado');
    err.code = 'SERVICO_NAO_ENCONTRADO';
    throw err;
  }

  const data = new Date(`${dataStr}T12:00:00`);
  if (isNaN(data.getTime())) {
    const err = new Error('Data inválida');
    err.code = 'DATA_INVALIDA';
    throw err;
  }

  const diaDaSemana = data.getDay();

  const disponibilidades = await ServicoDisponibilidades.findAll({
    where: { servicoId, diaDaSemana }
  });

  if (!disponibilidades.length) {
    return [];
  }

  const inicioDia = new Date(`${dataStr}T00:00:00`);
  const fimDia = new Date(`${dataStr}T23:59:59`);

  const agendamentosDoDia = await Agendamento.findAll({
    where: {
      servicoId,
      status: { [Op.ne]: 'cancelado' },
      inicioAgendamento: { [Op.between]: [inicioDia, fimDia] }
    }
  });

  const ocupados = agendamentosDoDia.map(a => ({
    inicio: horaParaMinutos(new Date(a.inicioAgendamento).toTimeString().slice(0, 5)),
    fim: horaParaMinutos(new Date(a.fimAgendamento).toTimeString().slice(0, 5))
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
    const err = new Error('Serviço não encontrado');
    err.code = 'SERVICO_NAO_ENCONTRADO';
    throw err;
  }

  const dataInicio = new Date(`${data}T${horaInicio}:00`);
  if (isNaN(dataInicio.getTime())) {
    const err = new Error('Data/hora inválida');
    err.code = 'DATA_INVALIDA';
    throw err;
  }
  const dataFim = new Date(dataInicio.getTime() + servico.duracao * 60 * 1000);

  const horariosDisponiveis = await getHorariosDisponiveis(servicoId, data);
  const horarioValido = horariosDisponiveis.some(h => h.inicio === horaInicio);

  if (!horarioValido) {
    const err = new Error('Horário não está disponível');
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
    const err = new Error('Agendamento não encontrado');
    err.code = 'NAO_ENCONTRADO';
    throw err;
  }

  const ehProprietario = agendamento.clienteId === usuarioId || agendamento.prestadorId === usuarioId;
  if (!ehProprietario) {
    const err = new Error('Sem permissão');
    err.code = 'PROIBIDO';
    throw err;
  }

  if (agendamento.status === 'cancelado') {
    const err = new Error('Agendamento já cancelado');
    err.code = 'JA_CANCELADO';
    throw err;
  }

  await agendamento.update({ status: 'cancelado' });
};

const confirmar = async (agendamentoId, prestadorId) => {
  const agendamento = await Agendamento.findByPk(agendamentoId);
  if (!agendamento) {
    const err = new Error('Agendamento não encontrado');
    err.code = 'NAO_ENCONTRADO';
    throw err;
  }

  if (agendamento.prestadorId !== prestadorId) {
    const err = new Error('Sem permissão');
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

module.exports = {
  criar,
  cancelar,
  confirmar,
  buscarPorCliente,
  buscarPorPrestador,
  processarAgendamentos,
  getHorariosDisponiveis
};
