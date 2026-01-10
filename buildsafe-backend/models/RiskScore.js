// models/RiskScore.js
const mongoose = require('mongoose');

const RiskScoreSchema = new mongoose.Schema({
  assessmentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Assessment',
    required: true 
  },
  finalRiskScore: Number,
  complianceScore: Number,
  weatherRiskScore: Number,

  // ✅ Store reference to 
  weatherDataId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WeatherData'
  },

  weights: mongoose.Schema.Types.Mixed,
  calculatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('RiskScore', RiskScoreSchema);
