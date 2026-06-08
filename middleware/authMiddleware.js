const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  next();
};

const requireClientType = (req, res, next) => {
  if (!req.session.user || req.session.user.type !== 'cliente') {
    return res.status(403).send('Acesso restrito');
  }
  next();
};

const requirePrestadorType = (req, res, next) => {
  if (!req.session.user || req.session.user.type !== 'prestador') {
    return res.status(403).send('Acesso restrito');
  }
  next();
};

module.exports = {
  requireAuth,
  requireClientType,
  requirePrestadorType
};

