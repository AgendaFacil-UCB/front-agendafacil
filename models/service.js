const Sequelize = require('sequelize');
const db = require('../db');

const Service = db.define('service', {
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
  categoryId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    field: 'category_id'
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  description: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  duration: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  price: {
    type: Sequelize.FLOAT,
    allowNull: false
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    field: 'created_at'
  }
}, {
  timestamps: false,
  tableName: 'services'
});

module.exports = Service;

