const Agendamento = require('../models/agendamento');
const Servico = require('../models/servico');
const Usuario = require('../models/usuario');
const ServicoAgendamentos = require('../services/servicoAgendamentos');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const getPainelCliente = async (req, res, next) => {
  try {
    const total = await Agendamento.count({
      where: { clienteId: req.session.usuario.id }
    });

    const proximos = await Agendamento.findAll({
      where: {
        clienteId: req.session.usuario.id,
        status: { [Op.in]: ['pendente', 'confirmado'] },
        inicioAgendamento: { [Op.gt]: new Date() }
      },
      include: [
        { model: Servico, as: 'servico' },
        { model: Usuario, as: 'prestador', attributes: ['id', 'nome'] }
      ],
      order: [['inicioAgendamento', 'ASC']],
      limit: 5
    });

    res.render('painel/cliente', {
      title: 'Meu Dashboard',
      usuario: req.session.usuario,
      totalAgendamentos: total,
      proximosAgendamentos: ServicoAgendamentos.processarAgendamentos(proximos || []),
    });
  } catch (err) {
    next(err);
  }
};

const getPainelPrestador = async (req, res, next) => {
  try {
    const servicos = await Servico.findAll({
      where: { prestadorId: req.session.usuario.id }
    });

    const total = await Agendamento.count({
      where: { prestadorId: req.session.usuario.id }
    });

    const proximos = await Agendamento.findAll({
      where: {
        prestadorId: req.session.usuario.id,
        status: { [Op.in]: ['pendente', 'confirmado'] },
        inicioAgendamento: { [Op.gt]: new Date() }
      },
      include: [
        { model: Servico, as: 'servico' },
        { model: Usuario, as: 'cliente', attributes: ['id', 'nome'] }
      ],
      order: [['inicioAgendamento', 'ASC']],
      limit: 5
    });

    res.render('painel/prestador', {
      title: 'Meu Dashboard',
      usuario: req.session.usuario,
      totalServicos: servicos ? servicos.length : 0,
      totalAgendamentos: total,
      proximosAgendamentos: ServicoAgendamentos.processarAgendamentos(proximos || []),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPainelCliente,
  getPainelPrestador
};
