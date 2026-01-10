// services/aiService.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.generateAISuggestions = async (
  infrastructureType,
  complianceScore,
  riskScore,
  violations
) => {
  let riskLevel = 'low';
  if (riskScore >= 75) riskLevel = 'high';
  else if (riskScore >= 36) riskLevel = 'normal';

  const violationText = violations.length > 0
    ? violations.map(v => `- ${v.expectedValue} [${v.severity.toUpperCase()}]`).join('\n')
    : 'None';

  const prompt = `
You are an expert infrastructure safety advisor for disaster resilience.

Generate 3-5 actionable, practical recommendations for a ${infrastructureType.toLowerCase()} with:
- Compliance Score: ${complianceScore}%
- Final Risk Score: ${riskScore}% (${riskLevel.toUpperCase()} risk)
- Risk Levels:
  • 0–35%: LOW → maintenance focus
  • 36–74%: NORMAL → fix in 30–60 days
  • 75–100%: HIGH → immediate action

Violations:
${violationText}

Provide ONLY a numbered list. No intro, no markdown.
`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const suggestions = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => /^\d+\./.test(line))
      .map(line => line.replace(/^\d+\.\s*/, ''));

    return { suggestions: suggestions.slice(0, 5), riskLevel };
  } catch (error) {
    console.error('Gemini error:', error.message);
    return this.generateFallbackSuggestions(riskLevel, infrastructureType, violations);
  }
};

exports.generateFallbackSuggestions = function(riskLevel, type, violations) {
  const suggestions = [];
  const isBuilding = type === 'BUILDING';

  if (riskLevel === 'high') {
    suggestions.push('Immediate structural inspection by certified engineer');
    suggestions.push('Restrict public access until safety verified');
  } else if (riskLevel === 'normal') {
    suggestions.push('Schedule professional assessment within 30 days');
  } else {
    suggestions.push('Continue routine maintenance and annual inspections');
  }

  if (violations.some(v => v.severity === 'high' || v.severity === 'critical')) {
    suggestions.push('Address high-severity violations as top priority');
  }

  if (isBuilding) {
    suggestions.push('Ensure fire exits are unobstructed and clearly marked');
    suggestions.push('Maintain fire suppression systems per code');
  } else {
    suggestions.push('Monitor traffic load limits');
    suggestions.push('Conduct quarterly structural inspections');
  }

  return { suggestions: suggestions.slice(0, 5), riskLevel };
};