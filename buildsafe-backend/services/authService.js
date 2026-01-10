// services/authService.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'buildsafe-secret', {
    expiresIn: '7d'
  });
};

exports.registerUser = async (userData) => {
  const { name, email, password, role = 'user' } = userData;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error('User already exists');

  // Create user
  const user = new User({ name, email, password, role });
  await user.save();

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id, user.role)
  };
};

exports.loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('Invalid credentials');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new Error('Invalid credentials');

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id, user.role)
  };
};