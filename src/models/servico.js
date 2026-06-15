const Sequelize = require('sequelize');
const db = require('../bancoDados');

const Servico = db.define('servico', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  prestadorId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    field: 'prestador_id'
  },
  categoriaId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    field: 'categoria_id'
  },
  nome: {
    type: Sequelize.STRING,
    allowNull: false
  },
  descricao: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  duracao: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  preco: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  criadoEm: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    field: 'criado_em'
  }
}, {
  timestamps: false,
  tableName: 'servicos'
});

module.exports = Servico;
