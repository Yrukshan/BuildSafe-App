// routes/riskRoutes.js
const express = require('express');
const router = express.Router();
const riskController = require('../controllers/riskController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/:assessmentId', riskController.calculateRisk);
router.get('/', riskController.getAllRisks);
router.get('/:id', riskController.getRisk);
router.get('/:id/pdf', riskController.getRiskPdf);
router.delete('/:id', riskController.deleteRisk);

module.exports = router;