// services/infrastructureService.js
const Infrastructure = require('../models/Infrastructure');

exports.createInfrastructure = async (data) => {
  const infra = new Infrastructure(data);
  await infra.save();
  return infra;
};

exports.getInfrastructures = async (filters = {}) => {
  return await Infrastructure.find(filters);
};

exports.getInfrastructureById = async (id) => {
  const infra = await Infrastructure.findById(id);
  if (!infra) throw new Error('Infrastructure not found');
  return infra;
};