const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access Denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1]; // Extract token
  try {
    const verified = jwt.verify(token, config.get('JWT_SECRET'));
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid Token' });
  }
};

