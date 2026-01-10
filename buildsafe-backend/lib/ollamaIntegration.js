// lib/ollamaIntegration.js
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class OllamaRuleGenerator {
  constructor(ollamaUrl = 'http://localhost:11434') {
    this.ollamaUrl = ollamaUrl;
    this.customRulesPath = path.join(__dirname, '../rules/custom-rules.json');
  }

  async generateRule(naturalLanguageInput) {
  const prompt = `
    Convert this natural language rule into a valid json-rules-engine rule.
    MUST include: "name", "conditions" (with "all" array), "event" with type="violation" and params.
    Params must include: code, message, severity ("low"/"medium"/"high"/"critical"), penalty (negative number).
    Output ONLY valid JSON. No markdown.

    Rule: "${naturalLanguageInput}"
  `;

  const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
    model: 'llama3',
    prompt: prompt.trim(),
    stream: false,
    options: { temperature: 0.2 } // more deterministic
  });

  const text = response.data.response;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON found');

  const rule = JSON.parse(jsonMatch[0]);

  // 🔹 Validate rule structure
  if (!rule.name || !rule.conditions || !rule.event) {
    throw new Error('Generated rule is missing required fields');
  }
  if (rule.event.type !== 'violation') {
    throw new Error('Rule event must be "violation"');
  }

  return rule;
}

  async saveRule(rule) {
      console.log('Saving custom rule:', JSON.stringify(rule, null, 2));

    let existingRules = [];
    try {
      const data = await fs.readFile(this.customRulesPath, 'utf8');
      existingRules = JSON.parse(data);
    } catch (err) {
      console.log('custom-rules.json not found or empty. Starting fresh.');
    }

    existingRules.push(rule);
    await fs.writeFile(this.customRulesPath, JSON.stringify(existingRules, null, 2));
    console.log('✅ Custom rule saved to custom-rules.json');
  }

  async addCustomRuleFromText(naturalLanguageInput) {
    const rule = await this.generateRule(naturalLanguageInput);
    await this.saveRule(rule);
    return rule;
  }
}

module.exports = OllamaRuleGenerator;