import React, { useState } from 'react';
import api from '../../services/api';
import './ShareReportModal.css';

const ShareReportModal = ({ report, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage('Please enter an email address');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await api.post('/share', {
        report_id: report.id,
        shared_with_email: email
      });

      setMessage('Report shared successfully!');
      setEmail('');
      
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to share report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Share Report</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p className="report-info">
            Sharing: <strong>{report.file_name}</strong>
          </p>
          {message && (
            <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                required
              />
              <small className="form-help">
                Enter the email address of the person you want to share with
              </small>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Sharing...' : 'Share Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShareReportModal;