import React from 'react';
import './ReportList.css';

const ReportList = ({ reports, loading, onDelete, onShare }) => {
  if (loading) {
    return (
      <div className="report-list-container">
        <div className="loading-message">Loading reports...</div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="report-list-container">
        <div className="no-reports-message">No reports found.</div>
      </div>
    );
  }

  return (
    <div className="report-list-container">
      <div className="reports-grid">
        {reports.map(report => (
          <div key={report.id} className="report-card">
            <div className="report-card-header">
              <h3>{report.file_name}</h3>
              <span className="report-badge">{report.report_type}</span>
            </div>
            <div className="report-card-body">
              <p className="report-date">
                Date: {new Date(report.report_date).toLocaleDateString()}
              </p>
              {report.associated_vitals && (
                <p className="report-vitals">
                  Vitals: {report.associated_vitals}
                </p>
              )}
            </div>
            <div className="report-card-actions">
              <a
                href={report.file_url.startsWith('http') ? report.file_url : `http://localhost:5000${report.file_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
              >
                View
              </a>
              <a
                href={report.file_url.startsWith('http') ? report.file_url : `http://localhost:5000${report.file_url}`}
                download
                className="btn btn-primary btn-sm"
              >
                Download
              </a>
              <button
                onClick={() => onShare(report)}
                className="btn btn-secondary btn-sm"
              >
                Share
              </button>
              <button
                onClick={() => onDelete(report.id)}
                className="btn btn-danger btn-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportList;