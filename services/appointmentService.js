const Appointment = require('../models/appointment');
const Service = require('../models/service');
const User = require('../models/user');
const { Op } = require('sequelize');

const processAppointments = (appointments) =>
  appointments.map(apt => ({
    ...apt.toJSON ? apt.toJSON() : apt,
    isPendente: apt.status === 'pendente',
    isConfirmado: apt.status === 'confirmado',
    isCancelado: apt.status === 'cancelado',
    isConcluido: apt.status === 'concluído',
  }));

const create = async ({ serviceId, appointmentDate, clienteId }) => {
  const service = await Service.findByPk(serviceId);
  if (!service) {
    const err = new Error('Serviço não encontrado');
    err.code = 'SERVICE_NOT_FOUND';
    throw err;
  }

  const existing = await Appointment.findOne({
    where: {
      serviceId,
      appointmentDate,
      status: { [Op.ne]: 'cancelado' }
    }
  });

  if (existing) {
    const err = new Error('Horário já está ocupado');
    err.code = 'CONFLICT';
    throw err;
  }

  const appointment = await Appointment.create({
    clienteId,
    serviceId,
    prestadorId: service.prestadorId,
    appointmentDate,
    status: 'pendente'
  });

  return {
    id: appointment.id,
    serviceId,
    appointmentDate,
    clienteId
  };
};

const cancel = async (appointmentId, userId) => {
  const apt = await Appointment.findByPk(appointmentId);
  if (!apt) {
    const err = new Error('Agendamento não encontrado');
    err.code = 'NOT_FOUND';
    throw err;
  }

  const isOwner = apt.clienteId === userId || apt.prestadorId === userId;
  if (!isOwner) {
    const err = new Error('Sem permissão');
    err.code = 'FORBIDDEN';
    throw err;
  }

  if (apt.status === 'cancelado') {
    const err = new Error('Agendamento já cancelado');
    err.code = 'ALREADY_CANCELLED';
    throw err;
  }

  await apt.update({ status: 'cancelado' });
};

const getByClient = async (clienteId) => {
  const appointments = await Appointment.findAll({
    where: { clienteId },
    include: [
      { model: Service, as: 'service' },
      { model: User, as: 'prestador', attributes: ['id', 'name', 'phone'] }
    ],
    order: [['appointmentDate', 'DESC']]
  });

  return processAppointments(appointments);
};

const getByPrestador = async (prestadorId) => {
  const appointments = await Appointment.findAll({
    where: { prestadorId },
    include: [
      { model: Service, as: 'service' },
      { model: User, as: 'cliente', attributes: ['id', 'name', 'phone'] }
    ],
    order: [['appointmentDate', 'DESC']]
  });

  return processAppointments(appointments);
};

module.exports = {
  create,
  cancel,
  getByClient,
  getByPrestador,
  processAppointments
};

