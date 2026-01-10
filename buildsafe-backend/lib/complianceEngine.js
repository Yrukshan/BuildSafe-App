// lib/complianceEngine.js
const { Engine } = require('json-rules-engine');
const fs = require('fs').promises;
const path = require('path');

class ComplianceEngine {
  constructor() {
    this.engine = new Engine();
  }

  async loadRules(assetType) {
    this.engine = new Engine();
    const ruleFiles = assetType === 'building'
      ? ['building-structural.json', 'building-safety.json']
      : ['bridge-structural.json', 'bridge-safety.json'];
    ruleFiles.push('custom-rules.json');
    await this.loadRuleFiles(ruleFiles);
  }

  async loadRuleFiles(files) {
    for (const file of files) {
      const filePath = path.join(__dirname, '../rules', file);
      try {
        const data = await fs.readFile(filePath, 'utf8');
        const rules = JSON.parse(data);
        rules.forEach(rule => this.engine.addRule(rule));
      } catch (err) {
        console.log(`File ${file} not found, skipping...`);
      }
    }
  }

  async assess(assetType, inputs) {
    await this.loadRules(assetType);
    const results = await this.engine.run(inputs);

    let score = 100;
    const violations = [];

    results.events.forEach(event => {
      if (event.type === 'violation') {
        score += event.params.penalty;
        violations.push(event.params);
      }
    });

    score = Math.max(0, Math.min(100, score));

    return {
      assessmentId: inputs.assessmentId,
      assetType,
      complianceScore: score,
      status: score >= 80 ? 'COMPLIANT' : score >= 60 ? 'REVIEW' : 'NON-COMPLIANT',
      violations,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = ComplianceEngine;