// services/assessmentService.js
const Assessment = require('../models/Assessment');

exports.createAssessment = async (assessmentData) => {
  const { draftId } = assessmentData;
  if (draftId) {
    const existing = await Assessment.findOne({ draftId });
    if (existing) return existing;
  }
  const assessment = new Assessment(assessmentData);
  await assessment.save();
  return assessment;
};

exports.getAssessmentById = async (id) => {
  const assessment = await Assessment.findById(id)
    .populate('infrastructureId')
    .populate('contractorId', 'name email role');
  if (!assessment) throw new Error('Assessment not found');
  return assessment;
};

exports.getAssessments = async (filters = {}) => {
  const { type, contractorId, status, page = 1, limit = 10 } = filters;
  const query = {};
  if (type) query.type = type;
  if (contractorId) query.contractorId = contractorId;
  if (status) query.status = status;

  const skip = (page - 1) * limit;
  const assessments = await Assessment.find(query)
    .populate('infrastructureId')
    .populate('contractorId', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Assessment.countDocuments(query);
  return {
    assessments,
    total,
    page,
    pages: Math.ceil(total / limit)
  };
};

exports.updateAssessment = async (id, updateData) => {
  const assessment = await Assessment.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  )
    .populate('infrastructureId')
    .populate('contractorId', 'name email');
  if (!assessment) throw new Error('Assessment not found');
  return assessment;
};

exports.deleteAssessment = async (id) => {
  const assessment = await Assessment.findByIdAndDelete(id);
  if (!assessment) throw new Error('Assessment not found');
  return assessment;
};