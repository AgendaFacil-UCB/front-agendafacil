const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { exigirAutenticacao, exigirTipoPrestador } = require('../middleware/middlewareAutenticacao');
const controladorServicos = require('../controllers/controladorServicos');

router.get('/criar', exigirAutenticacao, exigirTipoPrestador, controladorServicos.getCriar);

router.post('/', exigirAutenticacao, exigirTipoPrestador, [
  body('nome').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('categoria_id').isInt().withMessage('Categoria inválida'),
  body('descricao').trim().notEmpty().withMessage('Descrição é obrigatória'),
  body('duracao').isInt({ min: 15 }).withMessage('Duração deve ser no mínimo 15 minutos'),
  body('preco').isFloat({ min: 0 }).withMessage('Preço deve ser um valor válido'),
  body('dias').isArray({ min: 1 }).withMessage('Selecione pelo menos um dia'),
  body('hora_inicio').notEmpty().withMessage('Horário inicial obrigatório'),
  body('hora_fim').notEmpty().withMessage('Horário final obrigatório')
], controladorServicos.postCriar);

router.get('/', controladorServicos.getLista);

router.get('/:id', controladorServicos.getDetalhe);

module.exports = router;
