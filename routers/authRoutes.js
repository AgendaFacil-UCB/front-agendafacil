const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');

router.get('/register', authController.getRegister);

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
  body('type').isIn(['prestador', 'cliente']).withMessage('Tipo de usuário inválido'),
  body('phone').optional().trim()
], authController.postRegister);

router.get('/login', authController.getLogin);

router.post('/login', [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Senha é obrigatória')
], authController.postLogin);

router.get('/logout', authController.getLogout);

module.exports = router;

