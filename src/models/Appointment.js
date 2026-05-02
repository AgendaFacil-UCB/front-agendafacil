const db = require('../config/database');

class Appointment {
  static findById(id, callback) {
    db.get('SELECT * FROM appointments WHERE id = ?', [id], callback);
  }

  static findByClient(clientId, callback) {
    const query = `
      SELECT a.*, s.name as service_name, u.name as prestador_name, u.phone as prestador_phone
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      JOIN users u ON a.prestador_id = u.id
      WHERE a.cliente_id = ?
      ORDER BY a.appointment_date DESC
    `;
    db.all(query, [clientId], callback);
  }

  static findByPrestador(prestadorId, callback) {
    const query = `
      SELECT a.*, s.name as service_name, u.name as cliente_name, u.phone as cliente_phone
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      JOIN users u ON a.cliente_id = u.id
      WHERE a.prestador_id = ?
      ORDER BY a.appointment_date DESC
    `;
    db.all(query, [prestadorId], callback);
  }

  static findUpcoming(userId, type, callback) {
    const column = type === 'cliente' ? 'cliente_id' : 'prestador_id';
    const nameField = type === 'cliente' ? 'u.name as prestador_name' : 'u.name as cliente_name';

    const query = `
      SELECT a.*, s.name as service_name, ${nameField}
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      JOIN users u ON ${type === 'cliente' ? 'a.prestador_id' : 'a.cliente_id'} = u.id
      WHERE a.${column} = ? AND a.status IN ('pendente', 'confirmado') AND a.appointment_date > datetime('now')
      ORDER BY a.appointment_date ASC
      LIMIT 5
    `;
    db.all(query, [userId], callback);
  }

  static create(clienteId, serviceId, prestadorId, appointmentDate, callback) {
    db.run(
      'INSERT INTO appointments (cliente_id, service_id, prestador_id, appointment_date, status) VALUES (?, ?, ?, ?, "pendente")',
      [clienteId, serviceId, prestadorId, appointmentDate],
      function(err) {
        callback(err, this.lastID);
      }
    );
  }

  static checkConflict(serviceId, appointmentDate, callback) {
    db.get(
      'SELECT * FROM appointments WHERE service_id = ? AND appointment_date = ? AND status != "cancelado"',
      [serviceId, appointmentDate],
      callback
    );
  }

  static updateStatus(id, status, callback) {
    db.run('UPDATE appointments SET status = ? WHERE id = ?', [status, id], callback);
  }

  static countByClient(clienteId, callback) {
    db.get('SELECT COUNT(*) as total FROM appointments WHERE cliente_id = ?', [clienteId], callback);
  }

  static countByPrestador(prestadorId, callback) {
    db.get('SELECT COUNT(*) as total FROM appointments WHERE prestador_id = ?', [prestadorId], callback);
  }
}

module.exports = Appointment;

