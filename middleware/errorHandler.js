/**
 * Middleware de tratamento centralizado de erros.
 * Captura erros lançados com next(err) em qualquer rota.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  const message = err.message || 'Erro interno do servidor';

  console.error(`[${new Date().toISOString()}] ${status} — ${message}`, err.stack || '');

  // Resposta JSON para requests de API
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    return res.status(status).json({ error: message });
  }

  // Resposta HTML para navegador
  res.status(status).render('error', { title: 'Erro', message, status });
}

module.exports = errorHandler;

