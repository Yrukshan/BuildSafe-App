// controllers/authController.js
const authService = require('../services/authService');

exports.register = async (req, res) => {
  try {
    const userData = req.body;
    const result = await authService.registerUser(userData);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};