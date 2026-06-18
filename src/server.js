require('dotenv').config();
const sincronizarBancoDados = require('./sincronizar');
const criarApp = require('./app');

const app = criarApp();
const PORTA = process.env.PORT || 3000;

sincronizarBancoDados().then(() => {
  app.listen(PORTA, () => {
    console.log(`Servidor rodando em http://localhost:${PORTA}`);
  });
}).catch(err => {
  console.error('Erro ao iniciar servidor:', err);
  process.exit(1);
});
