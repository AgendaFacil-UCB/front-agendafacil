const { validationResult } = require('express-validator');
const ServicoAgendamentos = require('../services/servicoAgendamentos');

// Retorna os horários disponíveis para um serviço em uma data (usado via AJAX)
const getHorarios = async (req, res, next) => {
  try {
    const { servicoId } = req.params;
    const { data } = req.query;

    if (!data) {
      return res.status(400).json({ error: 'Informe a data' });
    }

    const horarios = await ServicoAgendamentos.getHorariosDisponiveis(servicoId, data);
    return res.json({ horarios });
  } catch (err) {
    if (['SERVICO_NAO_ENCONTRADO', 'DATA_INVALIDA'].includes(err.code)) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
};

const postCriar = async (req, res, next) => {
  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    return res.status(400).json({ errors: erros.array() });
  }

  try {
    const { servico_id, data, hora_inicio } = req.body;
    const agendamento = await ServicoAgendamentos.criar({
      servicoId: servico_id,
      data,
      horaInicio: hora_inicio,
      clienteId: req.session.usuario.id,
    });
    // Retorna JSON para o fetch do frontend tratar e redirecionar
    return res.status(201).json({ message: 'Agendamento realizado com sucesso!', agendamento });
  } catch (err) {
    if (['SERVICO_NAO_ENCONTRADO', 'CONFLITO', 'DATA_INVALIDA'].includes(err.code)) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
};

const getMeusAgendamentos = async (req, res, next) => {
  try {
    const agendamentos = await ServicoAgendamentos.buscarPorCliente(req.session.usuario.id);
    res.render('agendamentos/meus-agendamentos', {
      title: 'Meus Agendamentos',
      agendamentos,
    });
  } catch (err) {
    next(err);
  }
};

const getAgendamentosPrestador = async (req, res, next) => {
  try {
    const agendamentos = await ServicoAgendamentos.buscarPorPrestador(req.session.usuario.id);
    res.render('agendamentos/agendamentos-prestador', {
      title: 'Agendamentos',
      agendamentos,
    });
  } catch (err) {
    next(err);
  }
};

const postConfirmar = async (req, res, next) => {
  try {
    await ServicoAgendamentos.confirmar(req.params.id, req.session.usuario.id);
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.json({ message: 'Agendamento confirmado com sucesso!' });
    }
    res.redirect('back');
  } catch (err) {
    if (err.code === 'PROIBIDO') return res.status(403).json({ error: err.message });
    if (err.code === 'NAO_ENCONTRADO') return res.status(404).json({ error: 'Agendamento não encontrado' });
    if (err.code === 'STATUS_INVALIDO') return res.status(400).json({ error: err.message });
    next(err);
  }
};

const postCancelar = async (req, res, next) => {
  try {
    await ServicoAgendamentos.cancelar(req.params.id, req.session.usuario.id);
    // Verifica se é chamada AJAX ou form normal
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.json({ message: 'Agendamento cancelado com sucesso!' });
    }
    res.redirect('back');
  } catch (err) {
    if (err.code === 'PROIBIDO') return res.status(403).json({ error: err.message });
    if (err.code === 'NAO_ENCONTRADO') return res.status(404).json({ error: 'Agendamento não encontrado' });
    next(err);
  }
};

module.exports = {
  getHorarios,
  postCriar,
  getMeusAgendamentos,
  getAgendamentosPrestador,
  postConfirmar,
  postCancelar
};
