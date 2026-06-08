const bcrypt = require('bcryptjs');
const User = require('../models/user');

const register = async ({ name, email, password, type, phone }) => {
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    const err = new Error('Email já cadastrado');
    err.code = 'EMAIL_TAKEN';
    throw err;
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    type,
    phone: phone || null
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    type: user.type
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    const err = new Error('Email ou senha incorretos');
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }

  if (!bcrypt.compareSync(password, user.password)) {
    const err = new Error('Email ou senha incorretos');
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    type: user.type
  };
};

module.exports = {
  register,
  login
};

