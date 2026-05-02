require('dotenv').config();
require('./config/database'); // inicializa o banco antes de tudo
const createApp = require('./app');

const app = createApp();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
