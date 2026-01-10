// models/Infrastructure.js
const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  address: String
}, { _id: false });

const InfrastructureSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['BUILDING', 'BRIDGE'], 
    required: true 
  },
  name: { type: String, required: true },
  location: LocationSchema
}, { 
  timestamps: true,
  discriminatorKey: 'type'
});

module.exports = mongoose.model('Infrastructure', InfrastructureSchema);