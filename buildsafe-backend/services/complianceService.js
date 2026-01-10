// services/complianceService.js
const ComplianceResult = require('../models/ComplianceResult');
const ComplianceEngine = require('../lib/complianceEngine');
const Assessment = require('../models/Assessment');

exports.createCompliance = async (assessmentId, type, inputs) => {
  const engine = new ComplianceEngine();
  const assetType = type.toLowerCase(); // 'BUILDING' → 'building'

  const result = await engine.assess(assetType, { ...inputs, assessmentId });

  const complianceData = {
  assessmentId,
  complianceScore: result.complianceScore,
  violations: result.violations.map(v => ({
    parameterName: v.code,
    expectedValue: v.message,
    actualValue: inputs[v.fact] || 'N/A',
    severity: v.severity,
    ruleId: v.code,
    source: v.source || 'standard',      // ← from rule
    category: v.category || 'structural' // ← from rule
  }))
};

  const compliance = new ComplianceResult(complianceData);
  await compliance.save();
  return compliance;
};

exports.getCompliance = async (assessmentId) => {
  const compliance = await ComplianceResult.findOne({ assessmentId });
  if (!compliance) throw new Error('Compliance result not found');
  return compliance;
};
exports.getComplianceById = async (id) => {
  const compliance = await ComplianceResult.findById(id)
    .populate('assessmentId', 'type infrastructureName');
  if (!compliance) throw new Error('Compliance result not found');
  return compliance;
};

// services/complianceService.js
// services/complianceService.js
exports.getComplianceResults = async (filters = {}) => {
  const { type, source, category, page = 1, limit = 10 } = filters;

  let complianceQuery = {};

  // Only filter by assessment type if `type` is provided
  // if (type) {
  //   const assessmentQuery = { type: { $regex: `^${type}$`, $options: 'i' } };
  //   const assessments = await Assessment.find(assessmentQuery).select('_id');
  //   const assessmentIds = assessments.map(a => a._id);
    
  //   if (assessmentIds.length === 0) {
  //     return { results: [], total: 0, page, pages: 0 };
  //   }
  //   complianceQuery.assessmentId = { $in: assessmentIds };
  // }

  // Apply violation filters
  if (source || category) {
    complianceQuery.violations = { $elemMatch: {} };
    if (source) complianceQuery.violations.$elemMatch.source = source;
    if (category) complianceQuery.violations.$elemMatch.category = category;
  }

  const skip = (page - 1) * limit;
  const results = await ComplianceResult.find(complianceQuery)
    .populate('assessmentId', 'type infrastructureName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await ComplianceResult.countDocuments(complianceQuery);

  return {
    results,
    total,
    page,
    pages: Math.ceil(total / limit)
  };
};