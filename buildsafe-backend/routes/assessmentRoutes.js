// routes/assessmentRoutes.js
const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', assessmentController.createAssessment);
router.get('/', assessmentController.getAssessments);
router.get('/:id', assessmentController.getAssessment);
router.patch('/:id', assessmentController.updateAssessment);
router.delete('/:id', assessmentController.deleteAssessment);

module.exports = router;