const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { requireAuth, requirePrestadorType } = require('../middleware/authMiddleware');
const serviceController = require('../controllers/serviceController');

router.get('/', serviceController.getList);

router.get('/:id', serviceController.getDetail);

router.get('/create', requireAuth, requirePrestadorType, serviceController.getCreate);

router.post('/', requireAuth, requirePrestadorType, [
  body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('category_id').isInt().withMessage('Categoria inválida'),
  body('description').trim().notEmpty().withMessage('Descrição é obrigatória'),
  body('duration').isInt({ min: 15 }).withMessage('Duração deve ser no mínimo 15 minutos'),
  body('price').isFloat({ min: 0 }).withMessage('Preço deve ser um valor válido')
], serviceController.postCreate);

module.exports = router;

