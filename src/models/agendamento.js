const Sequelize = require('sequelize');
const db = require('../bancoDados');

const Agendamento = db.define('agendamento', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  clienteId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    field: 'cliente_id'
  },
  servicoId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    field: 'servico_id'
  },
  prestadorId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    field: 'prestador_id'
  },
  inicioAgendamento: {
    type: Sequelize.DATE,
    allowNull: false,
    field: 'inicio_agendamento'
  },
  fimAgendamento: {
    type: Sequelize.DATE,
    allowNull: false,
    field: 'fim_agendamento'
  },
  status: {
    type: Sequelize.ENUM('pendente', 'confirmado', 'cancelado'),
    defaultValue: 'pendente'
  },
  criadoEm: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    field: 'criado_em'
  }
}, {
  timestamps: false,
  tableName: 'agendamentos'
});

module.exports = Agendamento;
