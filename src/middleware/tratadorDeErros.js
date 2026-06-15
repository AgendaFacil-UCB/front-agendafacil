function tratadorDeErros(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  const mensagem = err.message || 'Erro interno do servidor';

  console.error(`[${new Date().toISOString()}] ${status} — ${mensagem}`, err.stack || '');

  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    return res.status(status).json({ erro: mensagem });
  }

  res.status(status).render('erro', { title: 'Erro', mensagem, status }, (erroRender, html) => {
    if (erroRender) {
      return res.status(status).send(`
        <!DOCTYPE html><html><body>
        <h1>${status} - Erro</h1><p>${mensagem}</p>
        <a href="/">Voltar ao início</a>
        </body></html>
      `);
    }
    res.send(html);
  });
}

module.exports = tratadorDeErros;
