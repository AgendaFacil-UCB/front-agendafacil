const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { requireAuth, requireClientType } = require('../middleware/authMiddleware');
const AppointmentController = require('../controllers/appointmentController');

router.get('/new/:serviceId', requireAuth, requireClientType, (req, res) => {
  AppointmentController.getNew(req, res);
});

router.post('/', requireAuth, requireClientType, [
  body('service_id').isInt().withMessage('Serviço inválido'),
  body('appointment_date').isISO8601().withMessage('Data/hora inválida')
], AppointmentController.postCreate);

router.get('/my-appointments', requireAuth, requireClientType, (req, res) => {
  AppointmentController.getMyAppointments(req, res);
});

router.get('/prestador-appointments', requireAuth, (req, res) => {
  if (req.session.user.type !== 'prestador') {
    return res.redirect('/');
  }
  AppointmentController.getPrestadorAppointments(req, res);
});

router.post('/:id/cancel', requireAuth, AppointmentController.postCancel);

module.exports = router;

