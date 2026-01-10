// models/WeatherData.js
const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  latitude: Number,
  longitude: Number,
  address: String
}, { _id: false });

const WeatherDataSchema = new mongoose.Schema({
  location: LocationSchema,
  temperature: Number,
  humidity: Number,
  windSpeed: Number,
  precipitation: Number,
  conditions: String,
  retrievedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('WeatherData', WeatherDataSchema);
