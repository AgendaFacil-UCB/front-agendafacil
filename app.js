const express = require('express');
const session = require('express-session');
const path = require('path');
const mustacheExpress = require('mustache-express');
const fs = require('fs');

const authRoutes = require('./routers/authRoutes');
const serviceRoutes = require('./routers/serviceRoutes');
const appointmentRoutes = require('./routers/appointmentRoutes');
const dashboardRoutes = require('./routers/dashboardRoutes');
const errorHandler = require('./middleware/errorHandler');

function createApp() {
  const app = express();

  // Ler layout Mustache uma única vez
  const layoutTemplate = fs.readFileSync(
    path.join(__dirname, './views/layout.mustache'),
    'utf8'
  );

  // View engine
  app.engine('mustache', mustacheExpress());
  app.set('view engine', 'mustache');
  app.set('views', path.join(__dirname, './views'));

  // Envolver views com layout
  const originalRender = app.render.bind(app);
  app.render = function (view, options, callback) {
    originalRender(view, options, (err, html) => {
      if (err) return callback(err);
      const Mustache = require('mustache');
      const output = Mustache.render(layoutTemplate, { ...options, body: html });
      callback(null, output);
    });
  };

  // Middlewares globais
  app.use(express.static(path.join(__dirname, './public')));
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  // Sessão
  app.use(session({
    secret: process.env.SESSION_SECRET || 'troque-esta-chave-em-producao',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 24h
    },
  }));

  // Expor dados de sessão para as views
  app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    if (req.session.user) {
      res.locals.isCliente = req.session.user.type === 'cliente';
      res.locals.isPrestador = req.session.user.type === 'prestador';
    }
    next();
  });

  // Rotas
  app.use('/auth', authRoutes);
  app.use('/services', serviceRoutes);
  app.use('/appointments', appointmentRoutes);
  app.use('/dashboard', dashboardRoutes);

  app.get('/', (req, res) => {
    res.render('index', { title: 'AgendaFácil - Sistema de Agendamento' });
  });

  // 404
  app.use((req, res) => {
    res.status(404).render('404', { title: 'Página não encontrada' });
  });

  // Tratamento centralizado de erros
  app.use(errorHandler);

  return app;
}

module.exports = createApp;

