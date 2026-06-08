const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { requireAuth, requireClientType } = require('../middleware/authMiddleware');
const appointmentController = require('../controllers/appointmentController');

router.get('/new/:serviceId', requireAuth, requireClientType, appointmentController.getNew);

router.post('/', requireAuth, requireClientType, [
  body('service_id').isInt().withMessage('Serviço inválido'),
  body('appointment_date').isISO8601().withMessage('Data/hora inválida')
], appointmentController.postCreate);

router.get('/my-appointments', requireAuth, requireClientType, appointmentController.getMyAppointments);

router.get('/prestador-appointments', requireAuth, (req, res, next) => {
  if (req.session.user.type !== 'prestador') {
    return res.redirect('/');
  }
  appointmentController.getPrestadorAppointments(req, res, next);
});

router.post('/:id/cancel', requireAuth, appointmentController.postCancel);

module.exports = router;

