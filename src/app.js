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
  const caminhoLayout = path.join(__dirname, 'views', 'layout.html');
  const modeloLayout = fs.readFileSync(caminhoLayout, 'utf8');

  // View engine: usar extensão .html (os templates foram renomeados para .html)
  // Registrar ambos .html e .mustache para compatibilidade
  app.engine('html', mustacheExpress());
  app.engine('mustache', mustacheExpress());
  // Usar .html como extensão padrão de renderização
  app.set('view engine', 'html');
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

      // Renderizar a view parcial primeiro. Se não for encontrada com a extensão
      // configurada, tentar extensões alternativas (.html e .mustache) para
      // compatibilidade com arquivos renomeados.
      renderOriginal(view, opcoesMescladas, (err, htmlParcial) => {
        function sendWrapped(html) {
          const dadosLayout = Object.assign({}, opcoesMescladas, { body: html });
          const htmlCompleto = Mustache.render(modeloLayout, dadosLayout);
          if (callback) return callback(null, htmlCompleto);
          return res.send(htmlCompleto);
        }

        if (err && /Failed to lookup view/.test(String(err.message))) {
          // tentar alternativas
          const tries = [];
          if (!view.endsWith('.html')) tries.push(view + '.html');
          if (!view.endsWith('.mustache')) tries.push(view + '.mustache');

          let i = 0;
          const tryNext = () => {
            if (i >= tries.length) {
              if (callback) return callback(err);
              return next(err);
            }
            const name = tries[i++];
            renderOriginal(name, opcoesMescladas, (err2, html2) => {
              if (!err2) return sendWrapped(html2);
              if (err2 && /Failed to lookup view/.test(String(err2.message))) {
                return tryNext();
              }
              // erro diferente
              if (callback) return callback(err2);
              return next(err2);
            });
          };
          return tryNext();
        }

        if (err) {
          if (callback) return callback(err);
          return next(err);
        }

        // Envolver no layout
        sendWrapped(htmlParcial);
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
