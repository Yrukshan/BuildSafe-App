// controllers/infrastructureController.js
const infraService = require('../services/infrastructureService');

exports.createInfrastructure = async (req, res) => {
  try {
    const infra = await infraService.createInfrastructure(req.body);
    res.status(201).json(infra);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getInfrastructures = async (req, res) => {
  try {
    const type = req.query.type;
    const infraList = await infraService.getInfrastructures(type ? { type } : {});
    res.json(infraList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getInfrastructure = async (req, res) => {
  try {
    const infra = await infraService.getInfrastructureById(req.params.id);
    res.json(infra);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};