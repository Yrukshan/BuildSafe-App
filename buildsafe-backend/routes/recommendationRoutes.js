// routes/recommendationRoutes.js
const express = require('express');
const router = express.Router();
const recController = require('../controllers/recommendationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/:assessmentId', recController.generateRecommendation);
router.get('/', recController.getAllRecommendations);
router.get('/:id', recController.getRecommendation);
router.get('/:id/pdf', recController.getRecommendationPdf); // ✅ PDF endpoint
router.delete('/:id', recController.deleteRecommendation);

module.exports = router;