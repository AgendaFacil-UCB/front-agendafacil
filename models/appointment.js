const Sequelize = require('sequelize');
const db = require('../db');

const Appointment = db.define('appointment', {
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
  serviceId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    field: 'service_id'
  },
  prestadorId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    field: 'prestador_id'
  },
  appointmentDate: {
    type: Sequelize.DATE,
    allowNull: false,
    field: 'appointment_date'
  },
  status: {
    type: Sequelize.ENUM('pendente', 'confirmado', 'cancelado', 'concluído'),
    defaultValue: 'pendente'
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    field: 'created_at'
  }
}, {
  timestamps: false,
  tableName: 'appointments'
});

module.exports = Appointment;

