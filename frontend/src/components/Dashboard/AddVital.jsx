import React, { useState } from 'react';
import api from '../../services/api';
import './AddVital.css';

const AddVital = () => {
  const [formData, setFormData] = useState({
    vital_type: 'BP',
    value: '',
    recorded_at: new Date().toISOString().slice(0, 16)
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const vitalTypes = ['BP', 'Sugar', 'Heart Rate', 'Oxygen', 'Temperature', 'Weight'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await api.post('/vitals', {
        vital_type: formData.vital_type,
        value: parseFloat(formData.value),
        recorded_at: formData.recorded_at
      });
      setMessage('Vital recorded successfully!');
      setFormData({
        vital_type: 'BP',
        value: '',
        recorded_at: new Date().toISOString().slice(0, 16)
      });
      
      // Reload page to update charts
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to record vital');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-vital-container">
      <h2>Record Vital</h2>
      {message && (
        <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Vital Type</label>
          <select
            name="vital_type"
            value={formData.vital_type}
            onChange={handleChange}
            required
          >
            {vitalTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Value</label>
          <input
            type="number"
            step="0.01"
            name="value"
            value={formData.value}
            onChange={handleChange}
            required
            placeholder="Enter value"
          />
        </div>
        <div className="form-group">
          <label>Date & Time</label>
          <input
            type="datetime-local"
            name="recorded_at"
            value={formData.recorded_at}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Recording...' : 'Record Vital'}
        </button>
      </form>
    </div>
  );
};

export default AddVital;