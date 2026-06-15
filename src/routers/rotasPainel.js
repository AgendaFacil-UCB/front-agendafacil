const express = require('express');
const router = express.Router();
const { exigirAutenticacao } = require('../middleware/middlewareAutenticacao');
const controladorPainel = require('../controllers/controladorPainel');

router.get('/cliente', exigirAutenticacao, controladorPainel.getPainelCliente);

router.get('/prestador', exigirAutenticacao, controladorPainel.getPainelPrestador);

module.exports = router;
