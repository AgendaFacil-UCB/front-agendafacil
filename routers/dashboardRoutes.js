const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const dashboardController = require('../controllers/dashboardController');

router.get('/cliente', requireAuth, dashboardController.getClientDashboard);

router.get('/prestador', requireAuth, dashboardController.getPrestadorDashboard);

module.exports = router;

