// services/pdfService.js
const pdf = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.generateRiskPdf = async (riskScore, compliance, assessment, weather) => {
  const doc = new pdf();
  const filename = `risk_report_${assessment._id}.pdf`;
  const filePath = path.join(__dirname, '../public/reports', filename);

  // Ensure reports directory exists
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  doc.fontSize(20).text('BuildSafe Risk Assessment Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Infrastructure: ${assessment.infrastructureName} (${assessment.type})`);
  doc.text(`Location: ${assessment.gpsCoordinates.latitude}, ${assessment.gpsCoordinates.longitude}`);
  doc.moveDown();

  // Final Risk Score
  doc.fontSize(16).text(`Final Risk Score: ${riskScore.finalRiskScore}%`, { underline: true });
  doc.moveDown();

  // Contribution Breakdown
  const compliancePct = (riskScore.weights.compliance * 100).toFixed(0);
  //const weatherPct = (riskScore.weights.weather * 100).toFixed(0);

  doc.fontSize(12).text(`Compliance Contribution & Weather Impact (99.9%): ${riskScore.complianceScore}%`);
  //doc.text(`Weather Impact (${weatherPct}%): ${riskScore.weatherRiskScore}%`);
  doc.moveDown();

  // Weather Details
  doc.text('Weather Conditions:', { underline: true });
  doc.text(`- Temperature: ${weather.temperature}°C`);
  doc.text(`- Wind Speed: ${weather.windSpeed} m/s`);
  doc.text(`- Precipitation: ${weather.precipitation} mm/h`);
  doc.text(`- Conditions: ${weather.conditions}`);
  doc.moveDown();

  // Violations Summary
  if (compliance.violations.length > 0) {
    doc.text('Compliance Violations:', { underline: true });
    compliance.violations.forEach(v => {
      doc.text(`• ${v.message} [${v.severity.toUpperCase()}]`);
    });
  } else {
    doc.text('No compliance violations found.');
  }

  doc.end();

  // Save to file
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(`/reports/${filename}`));
    stream.on('error', reject);
  });
};