const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const DashboardController = require('../controllers/dashboardController');

router.get('/cliente', requireAuth, (req, res) => {
  DashboardController.getClientDashboard(req, res);
});

router.get('/prestador', requireAuth, (req, res) => {
  DashboardController.getPrestadorDashboard(req, res);
});

module.exports = router;

