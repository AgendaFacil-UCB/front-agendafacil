const Sequelize = require('sequelize');
const db = require('../bancoDados');

const Usuario = db.define('usuario', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  nome: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  senha: {
    type: Sequelize.STRING,
    allowNull: false
  },
  tipo: {
    type: Sequelize.ENUM('prestador', 'cliente'),
    allowNull: false
  },
  telefone: {
    type: Sequelize.STRING,
    allowNull: true
  },
  cnpj: {
    type: Sequelize.STRING,
    allowNull: true,
    unique: true
  },
  criadoEm: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    field: 'criado_em'
  }
}, {
  timestamps: false,
  tableName: 'usuarios'
});

module.exports = Usuario;
