const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { requireAuth, requirePrestadorType } = require('../middleware/authMiddleware');
const ServiceController = require('../controllers/serviceController');

router.get('/create', requireAuth, requirePrestadorType, (req, res) => {
  ServiceController.getCreate(req, res);
});

router.get('/', ServiceController.getList);

router.get('/:id', ServiceController.getDetail);

router.post('/', requireAuth, requirePrestadorType, [
  body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('category_id').isInt().withMessage('Categoria inválida'),
  body('description').trim().notEmpty().withMessage('Descrição é obrigatória'),
  body('duration').isInt({ min: 15 }).withMessage('Duração deve ser no mínimo 15 minutos'),
  body('price').isFloat({ min: 0 }).withMessage('Preço deve ser um valor válido')
], ServiceController.postCreate);

module.exports = router;