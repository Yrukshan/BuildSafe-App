// services/riskService.js
const RiskScore = require('../models/RiskScore');
const Assessment = require('../models/Assessment');
const ComplianceResult = require('../models/ComplianceResult');
const weatherService = require('./weatherService');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');

// Calculate weather risk (0–100)
const calculateWeatherRisk = (weather) => {
  let score = 0;
  if (!weather) return score;

  if (weather.windSpeed > 14) score += 30; // >50 km/h
  if (weather.precipitation > 20) score += 25;
  if (weather.temperature < 0 || weather.temperature > 40) score += 15;
  if (['Thunderstorm', 'Tornado'].includes(weather.conditions)) score += 30;

  return Math.min(100, score);
};

// Generate PDF
const generateRiskPdf = async (risk, assessment, compliance, weather) => {
  const doc = new PDFDocument();
  const filename = `risk_report_${assessment._id}.pdf`;
  const filePath = path.join(__dirname, '../public/reports', filename);

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  doc.fontSize(20).text('BuildSafe Risk Assessment Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Infrastructure: ${assessment.infrastructureName ?? 'N/A'} (${assessment.type ?? 'N/A'})`);
  doc.text(`Location: ${assessment.gpsCoordinates?.latitude ?? 'N/A'}, ${assessment.gpsCoordinates?.longitude ?? 'N/A'}`);
  doc.moveDown();

  doc.fontSize(16).text(`Final Risk Score: ${risk.finalRiskScore ?? 'N/A'}%`, { underline: true });
  doc.moveDown();

  const compPct = (risk.weights?.complianceRisk * 100).toFixed(0) || '0';
  const weatherPct = (risk.weights?.weather * 100).toFixed(0) || '0';
  doc.text(`Compliance Contribution (${compPct}%): ${risk.complianceScore ?? 'N/A'}%`);
  doc.text(`Weather Impact (${weatherPct}%): ${risk.weatherRiskScore ?? 'N/A'}%`);
  doc.moveDown();

  doc.text('Weather Conditions:', { underline: true });
  doc.text(`- Temperature: ${weather?.temperature ?? 'N/A'} °C`);
  doc.text(`- Wind Speed: ${weather?.windSpeed ?? 'N/A'} m/s`);
  doc.text(`- Precipitation: ${weather?.precipitation ?? 'N/A'} mm/h`);
  doc.text(`- Conditions: ${weather?.conditions ?? 'N/A'}`);
  doc.moveDown();

  if (compliance && compliance.violations?.length > 0) {
    doc.text('Compliance Violations:', { underline: true });
    compliance.violations.forEach(v => {
      doc.text(`• ${v.expectedValue} [${v.severity?.toUpperCase() ?? ''}]`);
    });
  } else {
    doc.text('No compliance violations.');
  }

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(`/reports/${filename}`));
    stream.on('error', reject);
  });
};

// =====================
// Main functions
// =====================

// Calculate and save risk
const calculateRiskScore = async (assessmentId) => {
  const assessment = await Assessment.findById(assessmentId);
  if (!assessment) throw new Error('Assessment not found');

  const compliance = await ComplianceResult.findOne({ assessmentId });
  if (!compliance) throw new Error('Compliance result not found');

  let weather = null;
  try {
    weather = await weatherService.getWeatherByCoordinates(
      assessment.gpsCoordinates.latitude,
      assessment.gpsCoordinates.longitude
    );
  } catch (err) {
    console.warn('⚠️ Weather fetch failed:', err.message);
  }

  const weatherRiskScore = calculateWeatherRisk(weather);
  const complianceRiskScore = 100 - compliance.complianceScore;

  const baseRisk = (complianceRiskScore * 0.8) + (weatherRiskScore * 0.2);
  const finalRiskScore = Math.min(100, Math.round(baseRisk + 30));

  const risk = new RiskScore({
    assessmentId,
    finalRiskScore,
    complianceScore: compliance.complianceScore,
    weatherRiskScore,
    weights: { complianceRisk: 0.8, weather: 0.2 },
    calculatedAt: new Date()
  });

  await risk.save();

  // ✅ Include weather in the response for frontend
  return {
    ...risk.toObject(),
    weatherData: weather
  };
};

// Get risk by ID
const getRiskById = async (id) => {
  const risk = await RiskScore.findById(id).populate('assessmentId');
  if (!risk) throw new Error('Risk score not found');
  return risk;
};

// Get all risks (with pagination)
const getAllRisks = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const risks = await RiskScore.find()
    .populate('assessmentId', 'type infrastructureName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await RiskScore.countDocuments();
  return { risks, total, page, pages: Math.ceil(total / limit) };
};

// Delete risk
const deleteRisk = async (id) => {
  const risk = await RiskScore.findByIdAndDelete(id);
  if (!risk) throw new Error('Risk score not found');
  return { message: 'Risk score deleted' };
};

// Get PDF file
const getRiskPdfData = async (id) => {
  const risk = await RiskScore.findById(id).populate('assessmentId');
  if (!risk) throw new Error('Risk not found');

  const assessment = await Assessment.findById(risk.assessmentId);
  if (!assessment) throw new Error('Assessment not found');

  const compliance = await ComplianceResult.findOne({ assessmentId: assessment._id });

  let weather = null;
  try {
    weather = await weatherService.getWeatherByCoordinates(
      assessment.gpsCoordinates.latitude,
      assessment.gpsCoordinates.longitude
    );
  } catch (err) {
    console.warn('⚠️ Weather fetch failed:', err.message);
  }

  const pdfPath = await generateRiskPdf(risk, assessment, compliance, weather);
  return { filePath: path.join(__dirname, '../public', pdfPath) };
};

// =====================
// Export functions
// =====================
module.exports = {
  calculateRiskScore,
  getRiskById,
  getAllRisks,
  deleteRisk,
  getRiskPdfData
};
