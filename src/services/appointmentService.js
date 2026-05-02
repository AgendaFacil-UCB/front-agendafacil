const Appointment = require('../models/Appointment');
const Service = require('../models/Service');

const processAppointments = (appointments) =>
  appointments.map(apt => ({
    ...apt,
    isPendente: apt.status === 'pendente',
    isConfirmado: apt.status === 'confirmado',
    isCancelado: apt.status === 'cancelado',
    isConcluido: apt.status === 'concluído',
  }));

class AppointmentService {
  static async create({ serviceId, appointmentDate, clienteId }) {
    return new Promise((resolve, reject) => {
      Service.findById(serviceId, (err, service) => {
        if (err || !service) return reject(Object.assign(new Error('Serviço não encontrado'), { code: 'SERVICE_NOT_FOUND' }));

        Appointment.checkConflict(serviceId, appointmentDate, (err, existing) => {
          if (err) return reject(new Error('Erro ao verificar disponibilidade'));
          if (existing) return reject(Object.assign(new Error('Horário já está ocupado'), { code: 'CONFLICT' }));

          Appointment.create(clienteId, serviceId, service.prestador_id, appointmentDate, (err, id) => {
            if (err) return reject(new Error('Erro ao criar agendamento'));
            resolve({ id, serviceId, appointmentDate, clienteId });
          });
        });
      });
    });
  }

  static async cancel(appointmentId, userId) {
    return new Promise((resolve, reject) => {
      Appointment.findById(appointmentId, (err, apt) => {
        if (err || !apt) return reject(Object.assign(new Error('Agendamento não encontrado'), { code: 'NOT_FOUND' }));

        const isOwner = apt.cliente_id === userId || apt.prestador_id === userId;
        if (!isOwner) return reject(Object.assign(new Error('Sem permissão'), { code: 'FORBIDDEN' }));
        if (apt.status === 'cancelado') return reject(Object.assign(new Error('Agendamento já cancelado'), { code: 'ALREADY_CANCELLED' }));

        Appointment.updateStatus(appointmentId, 'cancelado', (err) => {
          if (err) return reject(new Error('Erro ao cancelar agendamento'));
          resolve();
        });
      });
    });
  }

  static async getByClient(clienteId) {
    return new Promise((resolve, reject) => {
      Appointment.findByClient(clienteId, (err, apts) => {
        if (err) return reject(new Error('Erro ao buscar agendamentos'));
        resolve(processAppointments(apts || []));
      });
    });
  }

  static async getByPrestador(prestadorId) {
    return new Promise((resolve, reject) => {
      Appointment.findByPrestador(prestadorId, (err, apts) => {
        if (err) return reject(new Error('Erro ao buscar agendamentos'));
        resolve(processAppointments(apts || []));
      });
    });
  }

  static processAppointments = processAppointments;
}

module.exports = AppointmentService;
