const bcrypt = require('bcryptjs');
const User = require('../models/User');

class AuthService {
  static async register({ name, email, password, type, phone }) {
    return new Promise((resolve, reject) => {
      User.findByEmail(email, (err, existing) => {
        if (err) return reject(new Error('Erro ao verificar email'));
        if (existing) return reject(Object.assign(new Error('Email já cadastrado'), { code: 'EMAIL_TAKEN' }));

        const hashedPassword = bcrypt.hashSync(password, 10);

        User.create(name, email, hashedPassword, type, phone || null, (err, userId) => {
          if (err) return reject(new Error('Erro ao criar usuário'));
          resolve({ id: userId, name, email, type });
        });
      });
    });
  }

  static async login({ email, password }) {
    return new Promise((resolve, reject) => {
      User.findByEmail(email, (err, user) => {
        if (err) return reject(new Error('Erro ao processar login'));
        if (!user) return reject(Object.assign(new Error('Email ou senha incorretos'), { code: 'INVALID_CREDENTIALS' }));

        if (!bcrypt.compareSync(password, user.password)) {
          return reject(Object.assign(new Error('Email ou senha incorretos'), { code: 'INVALID_CREDENTIALS' }));
        }

        resolve({ id: user.id, name: user.name, email: user.email, type: user.type });
      });
    });
  }
}

module.exports = AuthService;
