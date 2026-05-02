const db = require('../config/database');

class Category {
  static findAll(callback) {
    db.all('SELECT * FROM categories ORDER BY name', [], callback);
  }

  static findById(id, callback) {
    db.get('SELECT * FROM categories WHERE id = ?', [id], callback);
  }

  static create(name, description, callback) {
    db.run(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description],
      function(err) {
        callback(err, this.lastID);
      }
    );
  }
}

module.exports = Category;

