// routes/complianceRoutes.js
const express = require('express');
const router = express.Router();
const complianceController = require('../controllers/complianceController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', complianceController.createCompliance);
router.get('/', complianceController.getComplianceResults); // ← new

router.get('/result/:id', complianceController.getComplianceById); // ← NEW


router.get('/:id', complianceController.getCompliance);

module.exports = router;