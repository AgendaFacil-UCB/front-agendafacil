const exigirAutenticacao = (req, res, next) => {
  if (!req.session.usuario) {
    return res.redirect('/autenticacao/entrar');
  }
  next();
};

const exigirTipoCliente = (req, res, next) => {
  if (!req.session.usuario || req.session.usuario.tipo !== 'cliente') {
    return res.status(403).send('Acesso restrito');
  }
  next();
};

const exigirTipoPrestador = (req, res, next) => {
  if (!req.session.usuario || req.session.usuario.tipo !== 'prestador') {
    return res.status(403).send('Acesso restrito');
  }
  next();
};

module.exports = {
  exigirAutenticacao,
  exigirTipoCliente,
  exigirTipoPrestador
};
