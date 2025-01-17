// utils/auth.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (brotherId) => {
  return jwt.sign({ brotherId }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

module.exports = { generateToken };
