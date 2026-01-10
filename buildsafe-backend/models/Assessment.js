// models/Assessment.js
const mongoose = require('mongoose');
  
const LocationSchema = new mongoose.Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  address: String
}, { _id: false });

const AssessmentSchema = new mongoose.Schema({
  draftId: { type: String, unique: true },
  infrastructureId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Infrastructure',
    required: true 
  },
  infrastructureName: { type: String, required: true },
  contractorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  type: { 
    type: String, 
    enum: ['BUILDING', 'BRIDGE'], 
    required: true,
    index: true
  },
  status: { 
    type: String, 
    enum: ['pending', 'compliant', 'review', 'non-compliant'],
    default: 'pending' 
  },
  gpsCoordinates: { 
    type: LocationSchema, 
    required: true 
  },
  offlineMode: { type: Boolean, default: false },
  isSynced: { type: Boolean, default: false },
  safety: mongoose.Schema.Types.Mixed,
  structure: mongoose.Schema.Types.Mixed
}, { timestamps: true });

AssessmentSchema.index({ draftId: 1 });

module.exports = mongoose.model('Assessment', AssessmentSchema);