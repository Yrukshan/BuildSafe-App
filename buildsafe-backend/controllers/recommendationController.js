// controllers/recommendationController.js
const recommendationService = require('../services/recommendationService');
const path = require('path');

exports.generateRecommendation = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const rec = await recommendationService.generateRecommendation(assessmentId);
    res.status(201).json(rec);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getRecommendation = async (req, res) => {
  try {
    const rec = await recommendationService.getRecommendationById(req.params.id);
    res.json(rec);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

exports.getAllRecommendations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await recommendationService.getAllRecommendations(page, limit);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteRecommendation = async (req, res) => {
  try {
    const result = await recommendationService.deleteRecommendation(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

exports.getRecommendationPdf = async (req, res) => {
  try {
    const { filePath } = await recommendationService.getRecommendationPdf(req.params.id);
    res.download(filePath);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};