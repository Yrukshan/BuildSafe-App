// models/ComplianceResult.js
const mongoose = require('mongoose'); // ← THIS WAS MISSING

const ViolationSchema = new mongoose.Schema({
  parameterName: String,
  expectedValue: String,
  actualValue: String,
  severity: String,
  ruleId: String,
  source: { 
    type: String, 
    enum: ['standard', 'custom'],
    default: 'standard'
  },
  category: { 
    type: String, 
    enum: ['safety', 'structural']
  }
}, { _id: false });

const ComplianceResultSchema = new mongoose.Schema({
  assessmentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Assessment',
    required: true 
  },
  complianceScore: Number,
  violations: [ViolationSchema]
}, { timestamps: true });

module.exports = mongoose.model('ComplianceResult', ComplianceResultSchema);