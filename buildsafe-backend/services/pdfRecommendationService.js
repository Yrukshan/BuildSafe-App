// services/pdfRecommendationService.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.generateRecommendationPdf = async (recommendation, assessment, compliance, riskScore) => {
  const doc = new PDFDocument();
  const filename = `recommendation_${assessment._id}.pdf`;
  const filePath = path.join(__dirname, '../public/recommendations', filename);

  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  // Header
  doc.fontSize(20).text('BuildSafe AI Recommendations', { align: 'center' });
  doc.moveDown();

  // Infrastructure Info
  doc.fontSize(12)
     .text(`Infrastructure: ${assessment.infrastructureName} (${assessment.type})`)
     .text(`Location: ${assessment.gpsCoordinates.latitude}, ${assessment.gpsCoordinates.longitude}`)
     .text(`Risk Level: ${recommendation.riskLevel.toUpperCase()} (${riskScore}%)`)
     .text(`Priority: ${recommendation.priority}`);
  doc.moveDown();

  // Recommendations
  doc.fontSize(14).text('Recommended Actions:', { underline: true });
  doc.moveDown();
  recommendation.suggestions.forEach((suggestion, i) => {
    doc.fontSize(12).text(`${i + 1}. ${suggestion}`);
  });
  doc.moveDown();

  // Violations
  if (compliance.violations.length > 0) {
    doc.text('Compliance Violations:', { underline: true });
    compliance.violations.forEach(v => {
      doc.text(`• ${v.expectedValue} [${v.severity.toUpperCase()}]`);
    });
  }

  doc.end();

  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);
    stream.on('finish', () => resolve(`/recommendations/${filename}`));
    stream.on('error', reject);
  });
};