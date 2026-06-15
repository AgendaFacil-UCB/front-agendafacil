const express = require('express');
const session = require('express-session');
const path = require('path');
const mustacheExpress = require('mustache-express');
const fs = require('fs');
const Mustache = require('mustache');

const rotasAutenticacao = require('./routers/rotasAutenticacao');
const rotasServicos = require('./routers/rotasServicos');
const rotasAgendamentos = require('./routers/rotasAgendamentos');
const rotasPainel = require('./routers/rotasPainel');
const tratadorDeErros = require('./middleware/tratadorDeErros');

function criarApp() {
  const app = express();

  // Ler layout Mustache uma única vez
  const caminhoLayout = path.join(__dirname, 'views', 'layout.mustache');
  const modeloLayout = fs.readFileSync(caminhoLayout, 'utf8');

  // View engine
  app.engine('mustache', mustacheExpress());
  app.set('view engine', 'mustache');
  app.set('views', path.join(__dirname, 'views'));

  // Wrapper de layout: intercepta res.render para envolver com layout
  app.use((req, res, next) => {
    const renderOriginal = res.render.bind(res);

    res.render = function (view, opcoes, callback) {
      // Normalizar argumentos
      if (typeof opcoes === 'function') {
        callback = opcoes;
        opcoes = {};
      }
      opcoes = opcoes || {};

      // Mesclar res.locals
      const opcoesMescladas = Object.assign({}, res.locals, opcoes);

      // Renderizar a view parcial primeiro
      renderOriginal(view, opcoesMescladas, (err, htmlParcial) => {
        if (err) {
          if (callback) return callback(err);
          return next(err);
        }

        // Envolver no layout
        const dadosLayout = Object.assign({}, opcoesMescladas, { body: htmlParcial });
        const htmlCompleto = Mustache.render(modeloLayout, dadosLayout);

        if (callback) {
          callback(null, htmlCompleto);
        } else {
          res.send(htmlCompleto);
        }
      });
    };

    next();
  });

  // Middlewares globais
  app.use(express.static(path.join(__dirname, '../public')));
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
      maxAge: 1000 * 60 * 60 * 24,
    },
  }));

  // Expor dados de sessão para as views
  app.use((req, res, next) => {
    res.locals.usuario = req.session.usuario || null;
    if (req.session.usuario) {
      res.locals.isCliente = req.session.usuario.tipo === 'cliente';
      res.locals.isPrestador = req.session.usuario.tipo === 'prestador';
    }
    next();
  });

  // Rotas
  app.use('/autenticacao', rotasAutenticacao);
  app.use('/servicos', rotasServicos);
  app.use('/agendamentos', rotasAgendamentos);
  app.use('/painel', rotasPainel);

  app.get('/', (req, res) => {
    res.render('index', { title: 'AgendaFácil - Sistema de Agendamento' });
  });

  // 404
  app.use((req, res) => {
    res.status(404).render('404', { title: 'Página não encontrada' });
  });

  // Tratamento centralizado de erros
  app.use(tratadorDeErros);

  return app;
}

module.exports = criarApp;
