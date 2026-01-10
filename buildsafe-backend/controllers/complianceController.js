// controllers/complianceController.js
const complianceService = require('../services/complianceService');

exports.createCompliance = async (req, res) => {
  try {
    const { assessmentId, type, safety = {}, structure = {} } = req.body;
    const inputs = { ...safety, ...structure };
    const compliance = await complianceService.createCompliance(assessmentId, type, inputs);
    res.status(201).json(compliance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCompliance = async (req, res) => {
  try {
    const compliance = await complianceService.getCompliance(req.params.id);
    res.status(200).json(compliance);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

exports.getComplianceById = async (req, res) => {
  try {
    const compliance = await complianceService.getComplianceById(req.params.id);
    res.status(200).json(compliance);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

exports.getComplianceResults = async (req, res) => {
  try {
    const filters = {
      type: req.query.type,         // from Assessment
      source: req.query.source,     // standard/custom
      category: req.query.category, // safety/structural
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10
    };
    const result = await complianceService.getComplianceResults(filters);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
