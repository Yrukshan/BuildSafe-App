// routes/index.js
const express = require('express');
const router = express.Router();

// Public
const authRoutes = require('./authRoutes');
router.use('/api/auth', authRoutes);

// Protected
const infrastructureRoutes = require('./infrastructureRoutes');
const assessmentRoutes = require('./assessmentRoutes');

const complianceRoutes = require('./complianceRoutes');

const ruleRoutes = require('./ruleRoutes');

const riskRoutes = require('./riskRoutes');

const recommendationRoutes = require('./recommendationRoutes');




router.use('/api/infrastructure', infrastructureRoutes);
router.use('/api/assessments', assessmentRoutes);

router.use('/api/compliance', complianceRoutes);

router.use('/api/rules', ruleRoutes);

router.use('/api/risk', riskRoutes);

router.use('/api/recommendations', recommendationRoutes);

// Health check
router.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'BuildSafe backend is running!' });
});
 


module.exports = router;