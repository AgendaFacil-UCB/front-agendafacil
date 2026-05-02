const db = require('../config/database');

class Service {
  static findAll(callback) {
    const query = `
      SELECT s.*, u.name as prestador_name, c.name as category_name
      FROM services s
      JOIN users u ON s.prestador_id = u.id
      JOIN categories c ON s.category_id = c.id
      ORDER BY s.created_at DESC
    `;
    db.all(query, [], callback);
  }

  static findById(id, callback) {
    const query = `
      SELECT s.*, u.name as prestador_name, u.phone as prestador_phone, c.name as category_name
      FROM services s
      JOIN users u ON s.prestador_id = u.id
      JOIN categories c ON s.category_id = c.id
      WHERE s.id = ?
    `;
    db.get(query, [id], callback);
  }

  static findByPrestador(prestadorId, callback) {
    const query = `
      SELECT s.*, u.name as prestador_name, c.name as category_name
      FROM services s
      JOIN users u ON s.prestador_id = u.id
      JOIN categories c ON s.category_id = c.id
      WHERE s.prestador_id = ?
      ORDER BY s.created_at DESC
    `;
    db.all(query, [prestadorId], callback);
  }

  static create(prestadorId, categoryId, name, description, duration, price, callback) {
    db.run(
      'INSERT INTO services (prestador_id, category_id, name, description, duration, price) VALUES (?, ?, ?, ?, ?, ?)',
      [prestadorId, categoryId, name, description, duration, price],
      function(err) {
        callback(err, this.lastID);
      }
    );
  }

  static update(id, categoryId, name, description, duration, price, callback) {
    db.run(
      'UPDATE services SET category_id = ?, name = ?, description = ?, duration = ?, price = ? WHERE id = ?',
      [categoryId, name, description, duration, price, id],
      callback
    );
  }

  static delete(id, callback) {
    db.run('DELETE FROM services WHERE id = ?', [id], callback);
  }
}

module.exports = Service;

