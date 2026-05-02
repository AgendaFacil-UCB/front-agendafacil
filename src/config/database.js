const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  } else {
    console.log('Conectado ao SQLite');
  }
});

// Habilitar foreign keys
db.run('PRAGMA foreign_keys = ON');

// Inicializar tabelas
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('prestador', 'cliente')),
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prestador_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      duration INTEGER NOT NULL,
      price REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (prestador_id) REFERENCES users(id),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER NOT NULL,
      service_id INTEGER NOT NULL,
      prestador_id INTEGER NOT NULL,
      appointment_date DATETIME NOT NULL,
      status TEXT DEFAULT 'pendente' CHECK(status IN ('pendente', 'confirmado', 'cancelado', 'concluído')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cliente_id) REFERENCES users(id),
      FOREIGN KEY (service_id) REFERENCES services(id),
      FOREIGN KEY (prestador_id) REFERENCES users(id)
    )
  `);

  db.run(`
    INSERT OR IGNORE INTO categories (name, description) VALUES
    ('Barbearia', 'Serviços de barbearia'),
    ('Manicure', 'Serviços de unhas'),
    ('Beleza', 'Serviços gerais de beleza'),
    ('Saúde', 'Serviços de saúde'),
    ('Educação', 'Aulas e cursos')
  `, function(err) {
    if (!err) {
      console.log('Banco de dados foi inicializado com sucesso');
    }
  });
});

module.exports = db;

