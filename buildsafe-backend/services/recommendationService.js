// services/recommendationService.js
const Recommendation = require('../models/Recommendation');
const Assessment = require('../models/Assessment');
const ComplianceResult = require('../models/ComplianceResult');
const aiService = require('./aiService');
const pdfService = require('./pdfRecommendationService');

const path = require('path');

// Helper: Get risk score by assessmentId (from riskService)
const getRiskByAssessment = async (assessmentId) => {
  const RiskScore = require('../models/RiskScore');
  const risk = await RiskScore.findOne({ assessmentId });
  if (!risk) throw new Error('Risk score not found');
  return risk;
};

exports.generateRecommendation = async (assessmentId) => {
  const assessment = await Assessment.findById(assessmentId);
  if (!assessment) throw new Error('Assessment not found');

  const compliance = await ComplianceResult.findOne({ assessmentId });
  if (!compliance) throw new Error('Compliance result not found');

  const riskDoc = await getRiskByAssessment(assessmentId);
  const riskScore = riskDoc.finalRiskScore;

  const { suggestions, riskLevel } = await aiService.generateAISuggestions(
    assessment.type,
    compliance.complianceScore,
    riskScore,
    compliance.violations
  );

  let priority = 'LOW';
  if (riskLevel === 'high') priority = 'HIGH';
  else if (riskLevel === 'normal') priority = 'MEDIUM';

  const recommendation = new Recommendation({
    assessmentId,
    riskLevel,
    violations: compliance.violations,
    suggestions,
    priority,
    generatedAt: new Date()
  });

  await recommendation.save();
  return recommendation;
};

exports.getRecommendationPdf = async (id) => {
  const recommendation = await Recommendation.findById(id).populate('assessmentId');
  if (!recommendation) throw new Error('Recommendation not found');

  const assessment = await Assessment.findById(recommendation.assessmentId);
  const compliance = await ComplianceResult.findOne({ assessmentId: assessment._id });
  const riskDoc = await getRiskByAssessment(assessment._id);

  const pdfPath = await pdfService.generateRecommendationPdf(
    recommendation,
    assessment,
    compliance,
    riskDoc.finalRiskScore
  );

  return { filePath: path.join(__dirname, '../public', pdfPath) };
};

// CRUD
exports.getRecommendationById = async (id) => {
  const rec = await Recommendation.findById(id).populate('assessmentId');
  if (!rec) throw new Error('Recommendation not found');
  return rec;
};

exports.getAllRecommendations = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const recs = await Recommendation.find()
    .populate('assessmentId', 'type infrastructureName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const total = await Recommendation.countDocuments();
  return { recommendations: recs, total, page, pages: Math.ceil(total / limit) };
};

exports.deleteRecommendation = async (id) => {
  const rec = await Recommendation.findByIdAndDelete(id);
  if (!rec) throw new Error('Recommendation not found');
  return { message: 'Recommendation deleted' };
};