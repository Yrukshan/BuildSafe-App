// controllers/assessmentController.js
const assessmentService = require('../services/assessmentService');

 exports.createAssessment = async (req, res) => {
  try {
    const assessmentData = { ...req.body, contractorId: req.user._id};
    const assessment = await assessmentService.createAssessment(assessmentData);
    res.status(201).json(assessment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAssessment = async (req, res) => {
  try {
    const assessment = await assessmentService.getAssessmentById(req.params.id);
    res.status(200).json(assessment);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

exports.getAssessments = async (req, res) => {
  try {
    const filters = {
      type: req.query.type,
      contractorId: req.query.contractorId,
      status: req.query.status,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10
    };
    const result = await assessmentService.getAssessments(filters);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateAssessment = async (req, res) => {
  try {
    const assessment = await assessmentService.updateAssessment(req.params.id, req.body);
    res.status(200).json(assessment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteAssessment = async (req, res) => {
  try {
    await assessmentService.deleteAssessment(req.params.id);
    res.status(200).json({ message: 'Assessment deleted successfully' });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

exports.getUserAssessments = async (req, res) => {
  try {
    const userId = req.user._id;
    const filters = {
      contractorId: userId,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10
    };

    const result = await assessmentService.getAssessments(filters);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
