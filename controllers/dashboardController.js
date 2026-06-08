const Appointment = require('../models/appointment');
const Service = require('../models/service');
const AppointmentService = require('../services/appointmentService');
const { Op } = require('sequelize');

const getClientDashboard = async (req, res, next) => {
  try {
    const count = await Appointment.count({
      where: { clienteId: req.session.user.id }
    });

    const upcoming = await Appointment.findAll({
      where: {
        clienteId: req.session.user.id,
        status: { [Op.in]: ['pendente', 'confirmado'] },
        appointmentDate: { [Op.gt]: new Date() }
      },
      include: [
        { model: Service, as: 'service' },
        { model: require('../models/user'), as: 'prestador', attributes: ['id', 'name'] }
      ],
      order: [['appointmentDate', 'ASC']],
      limit: 5
    });

    res.render('dashboard/cliente', {
      title: 'Meu Dashboard',
      user: req.session.user,
      totalAppointments: count,
      upcomingAppointments: AppointmentService.processAppointments(upcoming || []),
    });
  } catch (err) {
    next(err);
  }
};

const getPrestadorDashboard = async (req, res, next) => {
  try {
    const services = await Service.findAll({
      where: { prestadorId: req.session.user.id }
    });

    const count = await Appointment.count({
      where: { prestadorId: req.session.user.id }
    });

    const upcoming = await Appointment.findAll({
      where: {
        prestadorId: req.session.user.id,
        status: { [Op.in]: ['pendente', 'confirmado'] },
        appointmentDate: { [Op.gt]: new Date() }
      },
      include: [
        { model: Service, as: 'service' },
        { model: require('../models/user'), as: 'cliente', attributes: ['id', 'name'] }
      ],
      order: [['appointmentDate', 'ASC']],
      limit: 5
    });

    res.render('dashboard/prestador', {
      title: 'Meu Dashboard',
      user: req.session.user,
      totalServices: services ? services.length : 0,
      totalAppointments: count,
      upcomingAppointments: AppointmentService.processAppointments(upcoming || []),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getClientDashboard,
  getPrestadorDashboard
};

