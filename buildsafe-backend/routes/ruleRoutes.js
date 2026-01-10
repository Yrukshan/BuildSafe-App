// routes/ruleRoutes.js
const express = require('express');
const router = express.Router();
const ruleController = require('../controllers/ruleController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);
router.post('/custom', restrictTo('admin'), ruleController.addCustomRule); // Only admins

module.exports = router;