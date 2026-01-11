const jwt = require('jsonwebtoken');
const db = require('../database/init');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // Verify user still exists in database
    db.get('SELECT id, email, name, role FROM users WHERE id = ?', [user.id], (err, row) => {
      if (err || !row) {
        return res.status(403).json({ error: 'User not found' });
      }

      req.user = row;
      next();
    });
  });
};

module.exports = { authenticateToken, JWT_SECRET };