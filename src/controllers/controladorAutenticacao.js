const { validationResult } = require('express-validator');
const ServicoAutenticacao = require('../services/servicoAutenticacao');

const getCadastro = (req, res) => {
  res.render('autenticacao/cadastro', { title: 'Cadastro - AgendaFácil' });
};

const postCadastro = async (req, res, next) => {
  const erros = validationResult(req);

  console.log(req.body);
  if (!erros.isEmpty()) {
    return res.status(400).render('autenticacao/cadastro', {
      title: 'Cadastro - AgendaFácil',
      errors: erros.array(),
    });
  }

  try {
    const { nome, email, senha, tipo, telefone, cnpj } = req.body;
    const usuario = await ServicoAutenticacao.cadastrar({ nome, email, senha, tipo, telefone, cnpj });
    req.session.usuario = usuario;
    res.redirect(usuario.tipo === 'prestador' ? '/painel/prestador' : '/painel/cliente');
  } catch (err) {
    if (err.code === 'EMAIL_EM_USO') {
      return res.status(400).render('autenticacao/cadastro', {
        title: 'Cadastro - AgendaFácil',
        errors: [{ msg: err.message }],
      });
    }
    next(err);
  }
};

const getEntrar = (req, res) => {
  res.render('autenticacao/entrar', { title: 'Login - AgendaFácil' });
};

const postEntrar = async (req, res, next) => {
  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    return res.status(400).render('autenticacao/entrar', {
      title: 'Login - AgendaFácil',
      errors: erros.array(),
    });
  }

  try {
    const { email, senha } = req.body;
    const usuario = await ServicoAutenticacao.entrar({ email, senha });
    req.session.usuario = usuario;
    res.redirect(usuario.tipo === 'prestador' ? '/painel/prestador' : '/painel/cliente');
  } catch (err) {
    if (err.code === 'CREDENCIAIS_INVALIDAS') {
      return res.status(401).render('autenticacao/entrar', {
        title: 'Login - AgendaFácil',
        errors: [{ msg: err.message }],
      });
    }
    next(err);
  }
};

const getSair = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.redirect('/');
  });
};

module.exports = {
  getCadastro,
  postCadastro,
  getEntrar,
  postEntrar,
  getSair,
};
