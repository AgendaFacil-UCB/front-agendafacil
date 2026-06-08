const { validationResult } = require('express-validator');
const AuthService = require('../services/authService');

const getRegister = (req, res) => {
  res.render('auth/register', { title: 'Cadastro - AgendaFácil' });
};

const postRegister = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('auth/register', {
      title: 'Cadastro - AgendaFácil',
      errors: errors.array(),
    });
  }

  try {
    const user = await AuthService.register(req.body);
    req.session.user = user;
    res.redirect(user.type === 'prestador' ? '/dashboard/prestador' : '/dashboard/cliente');
  } catch (err) {
    if (err.code === 'EMAIL_TAKEN') {
      return res.status(400).render('auth/register', {
        title: 'Cadastro - AgendaFácil',
        errors: [{ msg: err.message }],
      });
    }
    next(err);
  }
};

const getLogin = (req, res) => {
  res.render('auth/login', { title: 'Login - AgendaFácil' });
};

const postLogin = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('auth/login', {
      title: 'Login - AgendaFácil',
      errors: errors.array(),
    });
  }

  try {
    const user = await AuthService.login(req.body);
    req.session.user = user;
    res.redirect(user.type === 'prestador' ? '/dashboard/prestador' : '/dashboard/cliente');
  } catch (err) {
    if (err.code === 'INVALID_CREDENTIALS') {
      return res.status(401).render('auth/login', {
        title: 'Login - AgendaFácil',
        errors: [{ msg: err.message }],
      });
    }
    next(err);
  }
};

const getLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.redirect('/');
  });
};

module.exports = {
  getRegister,
  postRegister,
  getLogin,
  postLogin,
  getLogout
};


