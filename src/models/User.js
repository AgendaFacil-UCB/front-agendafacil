const db = require('../config/database');

class User {
  static findByEmail(email, callback) {
    db.get('SELECT * FROM users WHERE email = ?', [email], callback);
  }

  static findById(id, callback) {
    db.get('SELECT * FROM users WHERE id = ?', [id], callback);
  }

  static create(name, email, password, type, phone, callback) {
    db.run(
      'INSERT INTO users (name, email, password, type, phone) VALUES (?, ?, ?, ?, ?)',
      [name, email, password, type, phone],
      function(err) {
        callback(err, this.lastID);
      }
    );
  }

  static findAll(callback) {
    db.all('SELECT id, name, email, type, phone, created_at FROM users', [], callback);
  }

  static update(id, name, phone, callback) {
    db.run(
      'UPDATE users SET name = ?, phone = ? WHERE id = ?',
      [name, phone, id],
      callback
    );
  }
}

module.exports = User;

