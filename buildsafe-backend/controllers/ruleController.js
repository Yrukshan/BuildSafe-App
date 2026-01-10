// controllers/ruleController.js
const OllamaRuleGenerator = require('../lib/ollamaIntegration');

exports.addCustomRule = async (req, res) => {
  try {
    const { naturalLanguageRule } = req.body;
    if (!naturalLanguageRule) {
      return res.status(400).json({ error: 'naturalLanguageRule is required' });
    }

    const generator = new OllamaRuleGenerator();
    const rule = await generator.addCustomRuleFromText(naturalLanguageRule);

    res.status(201).json({ message: 'Custom rule added', rule });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};