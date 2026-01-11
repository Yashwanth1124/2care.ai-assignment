const express = require('express');
const db = require('../database/init');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Share report with another user
router.post('/', authenticateToken, (req, res) => {
  try {
    const { report_id, shared_with_email } = req.body;

    if (!report_id || !shared_with_email) {
      return res.status(400).json({ error: 'Report ID and email are required' });
    }

    // Verify report ownership
    db.get('SELECT id FROM reports WHERE id = ? AND user_id = ?', 
      [report_id, req.user.id], (err, report) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (!report) {
          return res.status(404).json({ error: 'Report not found or access denied' });
        }

        // Check if already shared
        db.get('SELECT id FROM shared_access WHERE report_id = ? AND shared_with_email = ?',
          [report_id, shared_with_email], (err, existing) => {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }

            if (existing) {
              return res.status(400).json({ error: 'Report already shared with this user' });
            }

            // Create shared access
            db.run(
              'INSERT INTO shared_access (report_id, shared_with_email, access_type) VALUES (?, ?, ?)',
              [report_id, shared_with_email, 'read'],
              function(err) {
                if (err) {
                  return res.status(500).json({ error: 'Failed to share report' });
                }

                res.status(201).json({
                  message: 'Report shared successfully',
                  share: {
                    id: this.lastID,
                    report_id: report_id,
                    shared_with_email: shared_with_email,
                    access_type: 'read'
                  }
                });
              }
            );
          });
      });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get shared reports (reports I've shared)
router.get('/sent', authenticateToken, (req, res) => {
  try {
    const query = `
      SELECT sa.*, r.file_name, r.report_type, r.report_date, u.name as shared_with_name
      FROM shared_access sa
      INNER JOIN reports r ON sa.report_id = r.id
      LEFT JOIN users u ON sa.shared_with_email = u.email
      WHERE r.user_id = ?
      ORDER BY sa.shared_at DESC
    `;

    db.all(query, [req.user.id], (err, shares) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({ shares });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Revoke shared access
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const shareId = req.params.id;

    // Verify ownership of the report
    db.get(
      `SELECT sa.id FROM shared_access sa
       INNER JOIN reports r ON sa.report_id = r.id
       WHERE sa.id = ? AND r.user_id = ?`,
      [shareId, req.user.id],
      (err, share) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (!share) {
          return res.status(404).json({ error: 'Share not found or access denied' });
        }

        db.run('DELETE FROM shared_access WHERE id = ?', [shareId], (err) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to revoke access' });
          }

          res.json({ message: 'Access revoked successfully' });
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;