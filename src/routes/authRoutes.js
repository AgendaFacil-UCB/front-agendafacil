const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const AuthController = require('../controllers/authController');

router.get('/register', AuthController.getRegister);

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
  body('type').isIn(['prestador', 'cliente']).withMessage('Tipo de usuário inválido'),
  body('phone').optional().trim()
], AuthController.postRegister);

router.get('/login', AuthController.getLogin);

router.post('/login', [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Senha é obrigatória')
], AuthController.postLogin);

router.get('/logout', AuthController.getLogout);

module.exports = router;

