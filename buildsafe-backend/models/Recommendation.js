// models/Recommendation.js
const mongoose = require('mongoose');

const ViolationSchema = new mongoose.Schema({
  parameterName: String,
  expectedValue: String,
  actualValue: String,
  severity: String,
  ruleId: String
}, { _id: false });

const RecommendationSchema = new mongoose.Schema({
  assessmentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Assessment',
    required: true 
  },
  riskLevel: { 
    type: String, 
    enum: ['low', 'normal', 'high'],
    required: true
  },
  violations: [ViolationSchema],
  suggestions: [String],
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'] },
  generatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Recommendation', RecommendationSchema);