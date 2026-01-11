const express = require('express');
const db = require('../database/init');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Add vitals
router.post('/', authenticateToken, (req, res) => {
  try {
    const { vital_type, value, recorded_at } = req.body;

    if (!vital_type || value === undefined || value === null) {
      return res.status(400).json({ error: 'Vital type and value are required' });
    }

    const validVitalTypes = ['BP', 'Sugar', 'Heart Rate', 'Oxygen', 'Temperature', 'Weight'];
    if (!validVitalTypes.includes(vital_type)) {
      return res.status(400).json({ error: 'Invalid vital type' });
    }

    const recordTime = recorded_at || new Date().toISOString();

    db.run(
      'INSERT INTO vitals (user_id, vital_type, value, recorded_at) VALUES (?, ?, ?, ?)',
      [req.user.id, vital_type, value, recordTime],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to save vital' });
        }

        res.status(201).json({
          message: 'Vital recorded successfully',
          vital: {
            id: this.lastID,
            vital_type: vital_type,
            value: value,
            recorded_at: recordTime
          }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get vitals (with optional filters)
router.get('/', authenticateToken, (req, res) => {
  try {
    const { vital_type, start_date, end_date } = req.query;
    
    let query = 'SELECT * FROM vitals WHERE user_id = ?';
    const params = [req.user.id];

    if (vital_type) {
      query += ' AND vital_type = ?';
      params.push(vital_type);
    }

    if (start_date) {
      query += ' AND DATE(recorded_at) >= ?';
      params.push(start_date);
    }

    if (end_date) {
      query += ' AND DATE(recorded_at) <= ?';
      params.push(end_date);
    }

    query += ' ORDER BY recorded_at DESC';

    db.all(query, params, (err, vitals) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({ vitals });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get vitals trends (grouped by type for charts)
router.get('/trends', authenticateToken, (req, res) => {
  try {
    const { vital_type, start_date, end_date } = req.query;
    
    let query = `
      SELECT vital_type, value, recorded_at 
      FROM vitals 
      WHERE user_id = ?
    `;
    const params = [req.user.id];

    if (vital_type) {
      query += ' AND vital_type = ?';
      params.push(vital_type);
    }

    if (start_date) {
      query += ' AND DATE(recorded_at) >= ?';
      params.push(start_date);
    }

    if (end_date) {
      query += ' AND DATE(recorded_at) <= ?';
      params.push(end_date);
    }

    query += ' ORDER BY recorded_at ASC';

    db.all(query, params, (err, vitals) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      // Group by vital type for easier chart rendering
      const trends = {};
      vitals.forEach(vital => {
        if (!trends[vital.vital_type]) {
          trends[vital.vital_type] = [];
        }
        trends[vital.vital_type].push({
          value: vital.value,
          date: vital.recorded_at
        });
      });

      res.json({ trends });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete vital
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const vitalId = req.params.id;

    db.run('DELETE FROM vitals WHERE id = ? AND user_id = ?', 
      [vitalId, req.user.id], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'Vital not found or access denied' });
        }

        res.json({ message: 'Vital deleted successfully' });
      });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;