const express = require('express');
const db = require('../database/init');
const { authenticateToken } = require('../middleware/authMiddleware');
const upload = require('../config/upload');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Upload report
router.post('/upload', authenticateToken, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { report_type, report_date } = req.body;

    if (!report_type || !report_date) {
      // Delete uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Report type and date are required' });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;

    db.run(
      'INSERT INTO reports (user_id, file_path, file_name, report_type, report_date) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, filePath, fileName, report_type, report_date],
      function(err) {
        if (err) {
          // Delete uploaded file if database insert fails
          fs.unlinkSync(filePath);
          return res.status(500).json({ error: 'Failed to save report' });
        }

        res.status(201).json({
          message: 'Report uploaded successfully',
          report: {
            id: this.lastID,
            file_name: fileName,
            report_type: report_type,
            report_date: report_date
          }
        });
      }
    );
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all reports for user (with optional filters)
router.get('/', authenticateToken, (req, res) => {
  try {
    const { start_date, end_date, report_type, vital_type } = req.query;
    let query = `
      SELECT r.*, 
             GROUP_CONCAT(DISTINCT rv.vital_type) as associated_vitals
      FROM reports r
      LEFT JOIN report_vitals rv ON r.id = rv.report_id
      WHERE r.user_id = ?
    `;
    const params = [req.user.id];

    if (start_date) {
      query += ' AND r.report_date >= ?';
      params.push(start_date);
    }

    if (end_date) {
      query += ' AND r.report_date <= ?';
      params.push(end_date);
    }

    if (report_type) {
      query += ' AND r.report_type = ?';
      params.push(report_type);
    }

    query += ' GROUP BY r.id ORDER BY r.report_date DESC';

    db.all(query, params, (err, reports) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      // If vital_type filter is provided, filter in memory
      let filteredReports = reports;
      if (vital_type) {
        filteredReports = reports.filter(report => {
          const vitals = report.associated_vitals ? report.associated_vitals.split(',') : [];
          return vitals.includes(vital_type);
        });
      }

      // Convert file paths to URLs
      const reportsWithUrls = filteredReports.map(report => ({
        ...report,
        file_url: `/uploads/${report.user_id}/${path.basename(report.file_path)}`
      }));

      res.json({ reports: reportsWithUrls });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get shared reports (reports shared with current user)
router.get('/shared', authenticateToken, (req, res) => {
  try {
    const query = `
      SELECT r.*, u.name as owner_name, u.email as owner_email
      FROM reports r
      INNER JOIN shared_access sa ON r.id = sa.report_id
      INNER JOIN users u ON r.user_id = u.id
      WHERE sa.shared_with_email = ?
      ORDER BY r.report_date DESC
    `;

    db.all(query, [req.user.email], (err, reports) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const reportsWithUrls = reports.map(report => ({
        ...report,
        file_url: `/uploads/${report.user_id}/${path.basename(report.file_path)}`
      }));

      res.json({ reports: reportsWithUrls });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single report
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const reportId = req.params.id;

    // Check if user owns the report or has shared access
    const query = `
      SELECT r.*, 
             GROUP_CONCAT(DISTINCT rv.vital_type) as associated_vitals
      FROM reports r
      LEFT JOIN report_vitals rv ON r.id = rv.report_id
      WHERE r.id = ? AND (r.user_id = ? OR EXISTS (
        SELECT 1 FROM shared_access sa 
        WHERE sa.report_id = r.id AND sa.shared_with_email = ?
      ))
      GROUP BY r.id
    `;

    db.get(query, [reportId, req.user.id, req.user.email], (err, report) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }

      report.file_url = `/uploads/${report.user_id}/${path.basename(report.file_path)}`;
      
      res.json({ report });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete report
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const reportId = req.params.id;

    // Verify ownership
    db.get('SELECT file_path, user_id FROM reports WHERE id = ? AND user_id = ?', 
      [reportId, req.user.id], (err, report) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (!report) {
          return res.status(404).json({ error: 'Report not found or access denied' });
        }

        // Delete file
        if (fs.existsSync(report.file_path)) {
          fs.unlinkSync(report.file_path);
        }

        // Delete from database (cascade will handle related records)
        db.run('DELETE FROM reports WHERE id = ?', [reportId], (err) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to delete report' });
          }

          res.json({ message: 'Report deleted successfully' });
        });
      });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;