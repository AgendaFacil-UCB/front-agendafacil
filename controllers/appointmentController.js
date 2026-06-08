const { validationResult } = require('express-validator');
const AppointmentService = require('../services/appointmentService');
const Service = require('../models/service');

const getNew = async (req, res, next) => {
  try {
    const service = await Service.findByPk(req.params.serviceId);
    if (!service) return res.status(404).render('404');

    res.render('appointments/new', { title: 'Agendar Serviço', service });
  } catch (err) {
    next(err);
  }
};

const postCreate = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { service_id, appointment_date } = req.body;
    await AppointmentService.create({
      serviceId: service_id,
      appointmentDate: appointment_date,
      clienteId: req.session.user.id,
    });
    res.redirect('/appointments/my-appointments');
  } catch (err) {
    if (['SERVICE_NOT_FOUND', 'CONFLICT'].includes(err.code)) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
};

const getMyAppointments = async (req, res, next) => {
  try {
    const appointments = await AppointmentService.getByClient(req.session.user.id);
    res.render('appointments/my-appointments', {
      title: 'Meus Agendamentos',
      appointments,
    });
  } catch (err) {
    next(err);
  }
};

const getPrestadorAppointments = async (req, res, next) => {
  try {
    const appointments = await AppointmentService.getByPrestador(req.session.user.id);
    res.render('appointments/prestador-appointments', {
      title: 'Agendamentos',
      appointments,
    });
  } catch (err) {
    next(err);
  }
};

const postCancel = async (req, res, next) => {
  try {
    await AppointmentService.cancel(req.params.id, req.session.user.id);
    res.redirect('back');
  } catch (err) {
    if (err.code === 'FORBIDDEN') return res.status(403).send(err.message);
    if (err.code === 'NOT_FOUND') return res.status(404).render('404');
    next(err);
  }
};

module.exports = {
  getNew,
  postCreate,
  getMyAppointments,
  getPrestadorAppointments,
  postCancel
};

