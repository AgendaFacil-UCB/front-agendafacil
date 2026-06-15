const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const controladorAutenticacao = require('../controllers/controladorAutenticacao');

router.get('/cadastro', controladorAutenticacao.getCadastro);

router.post('/cadastro', [
  body('nome').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('Email inválido'),
  body('senha').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
  body('telefone').optional().trim(),
  body('tipo').isIn(['cliente', 'prestador']).withMessage('Tipo inválido'),
  body('cnpj')
      .if(body('tipo').equals('prestador'))
      .notEmpty()
      .withMessage('CNPJ é obrigatório para prestadores')
], controladorAutenticacao.postCadastro);

router.get('/entrar', controladorAutenticacao.getEntrar);

router.post('/entrar', [
  body('email').isEmail().withMessage('Email inválido'),
  body('senha').notEmpty().withMessage('Senha é obrigatória')
], controladorAutenticacao.postEntrar);

router.get('/sair', controladorAutenticacao.getSair);

module.exports = router;
