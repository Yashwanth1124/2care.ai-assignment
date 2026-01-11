import React, { useState } from 'react';
import api from '../../services/api';
import './UploadReport.css';

const UploadReport = ({ onUpload }) => {
  const [formData, setFormData] = useState({
    file: null,
    report_type: 'Blood Test',
    report_date: new Date().toISOString().split('T')[0]
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const reportTypes = [
    'Blood Test',
    'X-Ray',
    'CT Scan',
    'MRI',
    'Ultrasound',
    'ECG',
    'Urine Test',
    'Other'
  ];

  const handleChange = (e) => {
    if (e.target.name === 'file') {
      setFormData({
        ...formData,
        file: e.target.files[0]
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.file) {
      setMessage('Please select a file');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const uploadData = new FormData();
      uploadData.append('file', formData.file);
      uploadData.append('report_type', formData.report_type);
      uploadData.append('report_date', formData.report_date);

      await api.post('/reports/upload', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage('Report uploaded successfully!');
      setFormData({
        file: null,
        report_type: 'Blood Test',
        report_date: new Date().toISOString().split('T')[0]
      });
      
      // Reset file input
      document.getElementById('file-input').value = '';
      
      if (onUpload) {
        onUpload();
      }
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to upload report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-report-container">
      <h2>Upload Medical Report</h2>
      {message && (
        <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Report File (PDF/Image)</label>
          <input
            id="file-input"
            type="file"
            name="file"
            onChange={handleChange}
            accept=".pdf,.jpg,.jpeg,.png,.gif"
            required
          />
        </div>
        <div className="form-group">
          <label>Report Type</label>
          <select
            name="report_type"
            value={formData.report_type}
            onChange={handleChange}
            required
          >
            {reportTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Report Date</label>
          <input
            type="date"
            name="report_date"
            value={formData.report_date}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload Report'}
        </button>
      </form>
    </div>
  );
};

export default UploadReport;