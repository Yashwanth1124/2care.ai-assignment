import React from 'react';
import { Link } from 'react-router-dom';
import './RecentReports.css';

const RecentReports = ({ reports, loading }) => {
  if (loading) {
    return (
      <div className="recent-reports-container">
        <h2>Recent Reports</h2>
        <div className="loading-message">Loading reports...</div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="recent-reports-container">
        <h2>Recent Reports</h2>
        <div className="no-reports-message">No reports uploaded yet.</div>
      </div>
    );
  }

  return (
    <div className="recent-reports-container">
      <div className="recent-reports-header">
        <h2>Recent Reports</h2>
        <Link to="/reports" className="btn btn-secondary">
          View All Reports
        </Link>
      </div>
      <div className="reports-list">
        {reports.slice(0, 5).map(report => (
          <div key={report.id} className="report-item">
            <div className="report-info">
              <h3>{report.file_name}</h3>
              <p className="report-type">{report.report_type}</p>
              <p className="report-date">
                Date: {new Date(report.report_date).toLocaleDateString()}
              </p>
            </div>
            <div className="report-actions">
              <a
                href={report.file_url.startsWith('http') ? report.file_url : `http://localhost:5000${report.file_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                View
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentReports;