require('dotenv').config();
const syncDatabase = require('./sync');
const createApp = require('./app');

const app = createApp();
const PORT = process.env.PORT || 3000;

// Sincronizar banco de dados antes de iniciar o servidor
syncDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Erro ao iniciar servidor:', err);
  process.exit(1);
});

