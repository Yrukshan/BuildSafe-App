// models/Bridge.js
const mongoose = require('mongoose');
const Infrastructure = require('./Infrastructure');

const BridgeSafetySchema = new mongoose.Schema({
  spanLength: Number
}, { _id: false });

const BridgeStructureSchema = new mongoose.Schema({
  designSpeed: Number,
  trafficLanes: Number,
  designLoad: Number
}, { _id: false });

const BridgeSchema = new mongoose.Schema({
  safety: BridgeSafetySchema,
  structure: BridgeStructureSchema
});

module.exports = Infrastructure.discriminator('BRIDGE', BridgeSchema);