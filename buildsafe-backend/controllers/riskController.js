// controllers/riskController.js
const riskService = require('../services/riskService');
const path = require('path');
 
exports.calculateRisk = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const risk = await riskService.calculateRiskScore(assessmentId);
    res.status(201).json(risk);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getRisk = async (req, res) => {
  try {
    const risk = await riskService.getRiskById(req.params.id);
    res.json(risk);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

exports.getAllRisks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await riskService.getAllRisks(page, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteRisk = async (req, res) => {
  try {
    const result = await riskService.deleteRisk(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

exports.getRiskPdf = async (req, res) => {
  try {
    const { filePath } = await riskService.getRiskPdfData(req.params.id);
    res.download(filePath);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};