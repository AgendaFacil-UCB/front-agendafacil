const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const AppointmentService = require('../services/appointmentService');

class DashboardController {
  static getClientDashboard(req, res, next) {
    Appointment.countByClient(req.session.user.id, (err, count) => {
      if (err) return next(err);

      Appointment.findUpcoming(req.session.user.id, 'cliente', (err, upcoming) => {
        if (err) return next(err);

        res.render('dashboard/cliente', {
          title: 'Meu Dashboard',
          user: req.session.user,
          totalAppointments: count ? count.total : 0,
          upcomingAppointments: AppointmentService.processAppointments(upcoming || []),
        });
      });
    });
  }

  static getPrestadorDashboard(req, res, next) {
    Service.findByPrestador(req.session.user.id, (err, services) => {
      if (err) return next(err);

      Appointment.countByPrestador(req.session.user.id, (err, count) => {
        if (err) return next(err);

        Appointment.findUpcoming(req.session.user.id, 'prestador', (err, upcoming) => {
          if (err) return next(err);

          res.render('dashboard/prestador', {
            title: 'Meu Dashboard',
            user: req.session.user,
            totalServices: services ? services.length : 0,
            totalAppointments: count ? count.total : 0,
            upcomingAppointments: AppointmentService.processAppointments(upcoming || []),
          });
        });
      });
    });
  }
}

module.exports = DashboardController;
