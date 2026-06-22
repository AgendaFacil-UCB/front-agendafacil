const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { exigirAutenticacao, exigirTipoCliente } = require('../middleware/middlewareAutenticacao');
const controladorAgendamentos = require('../controllers/controladorAgendamentos');

router.get('/horarios/:servicoId', exigirAutenticacao, exigirTipoCliente, controladorAgendamentos.getHorarios);

router.post('/', exigirAutenticacao, exigirTipoCliente, [
  body('servico_id').isInt().withMessage('Serviço inválido'),
  body('data').isISO8601().withMessage('Data inválida'),
  body('hora_inicio').matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('Horário inválido')
], controladorAgendamentos.postCriar);

router.get('/meus-agendamentos', exigirAutenticacao, exigirTipoCliente, controladorAgendamentos.getMeusAgendamentos);

router.get('/agendamentos-prestador', exigirAutenticacao, (req, res, next) => {
  if (req.session.usuario.tipo !== 'prestador') {
    return res.redirect('/');
  }
  controladorAgendamentos.getAgendamentosPrestador(req, res, next);
});

router.post('/:id/confirmar', exigirAutenticacao, controladorAgendamentos.postConfirmar);

router.post('/:id/cancelar', exigirAutenticacao, controladorAgendamentos.postCancelar);

router.post('/:id/deletar', exigirAutenticacao, controladorAgendamentos.excluirAgendamento);

module.exports = router;
