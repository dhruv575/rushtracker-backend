// middleware/auth.js
const jwt = require('jsonwebtoken');
const Brother = require('../models/brother');
const { BROTHER_POSITIONS } = require('../models/types');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const brother = await Brother.findById(decoded.brotherId);

    if (!brother) {
      throw new Error();
    }

    req.brother = brother;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate.' });
  }
};

const isPresident = async (req, res, next) => {
  if (req.brother.position !== BROTHER_POSITIONS.PRESIDENT) {
    return res.status(403).json({ error: 'Only presidents can perform this action.' });
  }
  next();
};

module.exports = { auth, isPresident };