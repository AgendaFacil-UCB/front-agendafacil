const { validationResult } = require('express-validator');
const ServicoAutenticacao = require('../services/servicoAutenticacao');

const getCadastro = (req, res) => {
  const tipoQuery = (req.query && req.query.tipo) || '';
  const tipo = ['cliente', 'prestador'].includes(tipoQuery) ? tipoQuery : 'cliente';

  const configuracoes = {
    cliente: {
      botaoLabel: 'Cadastrar como Cliente',
      descricao: 'Você está se cadastrando como <strong>Cliente</strong> — busque e agende serviços.',
      showCnpj: false,
    },
    prestador: {
      botaoLabel: 'Cadastrar como Prestador',
      descricao: 'Você está se cadastrando como <strong>Prestador</strong> — ofereça seus serviços.',
      showCnpj: true,
    }
  };

  const cfg = configuracoes[tipo];

  res.render('autenticacao/cadastro', {
    title: 'Cadastro - AgendaFácil',
    tipo,
    botaoLabel: cfg.botaoLabel,
    descricao: cfg.descricao,
    showCnpj: cfg.showCnpj,
    isCliente: tipo === 'cliente',
    isPrestador: tipo === 'prestador'
  });
};

const postCadastro = async (req, res, next) => {
  const erros = validationResult(req);

  console.log(req.body);
  if (!erros.isEmpty()) {
    const tipoBody = (req.body && req.body.tipo) || 'cliente';
    const cfg = tipoBody === 'prestador' ? {
      botaoLabel: 'Cadastrar como Prestador',
      descricao: 'Você está se cadastrando como <strong>Prestador</strong> — ofereça seus serviços.',
      showCnpj: true,
    } : {
      botaoLabel: 'Cadastrar como Cliente',
      descricao: 'Você está se cadastrando como <strong>Cliente</strong> — busque e agende serviços.',
      showCnpj: false,
    };

    return res.status(400).render('autenticacao/cadastro', {
      title: 'Cadastro - AgendaFácil',
      errors: erros.array(),
      tipo: tipoBody,
      botaoLabel: cfg.botaoLabel,
      descricao: cfg.descricao,
      showCnpj: cfg.showCnpj,
      isCliente: tipoBody === 'cliente',
      isPrestador: tipoBody === 'prestador'
    });
  }

  try {
    const { nome, email, senha, tipo, telefone, cnpj } = req.body;
    const usuario = await ServicoAutenticacao.cadastrar({ nome, email, senha, tipo, telefone, cnpj });
    req.session.usuario = usuario;
    res.redirect(usuario.tipo === 'prestador' ? '/painel/prestador' : '/painel/cliente');
  } catch (err) {
    if (err.code === 'EMAIL_EM_USO') {
      const tipoBody = (req.body && req.body.tipo) || 'cliente';
      const cfg = tipoBody === 'prestador' ? {
        botaoLabel: 'Cadastrar como Prestador',
        descricao: 'Você está se cadastrando como <strong>Prestador</strong> — ofereça seus serviços.',
        showCnpj: true,
      } : {
        botaoLabel: 'Cadastrar como Cliente',
        descricao: 'Você está se cadastrando como <strong>Cliente</strong> — busque e agende serviços.',
        showCnpj: false,
      };

      return res.status(400).render('autenticacao/cadastro', {
        title: 'Cadastro - AgendaFácil',
        errors: [{ msg: err.message }],
        tipo: tipoBody,
        botaoLabel: cfg.botaoLabel,
        descricao: cfg.descricao,
        showCnpj: cfg.showCnpj,
        isCliente: tipoBody === 'cliente',
        isPrestador: tipoBody === 'prestador'
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
