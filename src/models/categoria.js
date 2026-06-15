const Sequelize = require('sequelize');
const db = require('../bancoDados');

const Categoria = db.define('categoria', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  nome: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  descricao: {
    type: Sequelize.STRING,
    allowNull: true
  }
}, {
  timestamps: false,
  tableName: 'categorias'
});

module.exports = Categoria;
