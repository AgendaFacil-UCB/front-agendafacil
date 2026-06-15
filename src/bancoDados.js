const Sequelize = require('sequelize');
const path = require('path');

const caminhoBanco = path.join(__dirname, './banco.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: caminhoBanco,
  logging: false
});

module.exports = sequelize;
