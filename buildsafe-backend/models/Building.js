// models/Building.js
const mongoose = require('mongoose');
const Infrastructure = require('./Infrastructure');

const BuildingSafetySchema = new mongoose.Schema({
  fireRating: Number
}, { _id: false });

const BuildingStructureSchema = new mongoose.Schema({
  foundationType: String,
  buildingHeight: Number,
  exitCount: Number
}, { _id: false });

const BuildingSchema = new mongoose.Schema({
  safety: BuildingSafetySchema,
  structure: BuildingStructureSchema
});

module.exports = Infrastructure.discriminator('BUILDING', BuildingSchema);