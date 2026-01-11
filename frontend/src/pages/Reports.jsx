import React, { useState, useEffect } from 'react';
import ReportList from '../components/Reports/ReportList';
import ShareReportModal from '../components/Reports/ShareReportModal';
import api from '../services/api';
import './Reports.css';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    report_type: '',
    vital_type: ''
  });
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, reports]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      if (filters.report_type) params.report_type = filters.report_type;
      if (filters.vital_type) params.vital_type = filters.vital_type;

      const response = await api.get('/reports', { params });
      setReports(response.data.reports || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...reports];

    // Client-side filtering for additional filters if needed
    setFilteredReports(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchReports();
  };

  const handleClearFilters = () => {
    setFilters({
      start_date: '',
      end_date: '',
      report_type: '',
      vital_type: ''
    });
    fetchReports();
  };

  const handleDelete = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await api.delete(`/reports/${reportId}`);
        fetchReports();
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to delete report');
      }
    }
  };

  const handleShare = (report) => {
    setSelectedReport(report);
    setShowShareModal(true);
  };

  const handleShareSuccess = () => {
    setShowShareModal(false);
    setSelectedReport(null);
  };

  return (
    <div className="container">
      <h1>Medical Reports</h1>

      <div className="reports-filters card">
        <h2>Filter Reports</h2>
        <form onSubmit={handleFilterSubmit}>
          <div className="filters-grid">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                name="start_date"
                value={filters.start_date}
                onChange={handleFilterChange}
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                name="end_date"
                value={filters.end_date}
                onChange={handleFilterChange}
              />
            </div>
            <div className="form-group">
              <label>Report Type</label>
              <select
                name="report_type"
                value={filters.report_type}
                onChange={handleFilterChange}
              >
                <option value="">All Types</option>
                <option value="Blood Test">Blood Test</option>
                <option value="X-Ray">X-Ray</option>
                <option value="CT Scan">CT Scan</option>
                <option value="MRI">MRI</option>
                <option value="Ultrasound">Ultrasound</option>
                <option value="ECG">ECG</option>
                <option value="Urine Test">Urine Test</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Vital Type</label>
              <select
                name="vital_type"
                value={filters.vital_type}
                onChange={handleFilterChange}
              >
                <option value="">All Vitals</option>
                <option value="BP">BP</option>
                <option value="Sugar">Sugar</option>
                <option value="Heart Rate">Heart Rate</option>
                <option value="Oxygen">Oxygen</option>
                <option value="Temperature">Temperature</option>
                <option value="Weight">Weight</option>
              </select>
            </div>
          </div>
          <div className="filter-actions">
            <button type="submit" className="btn btn-primary">
              Apply Filters
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              className="btn btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        </form>
      </div>

      <ReportList
        reports={filteredReports}
        loading={loading}
        onDelete={handleDelete}
        onShare={handleShare}
      />

      {showShareModal && selectedReport && (
        <ShareReportModal
          report={selectedReport}
          onClose={() => setShowShareModal(false)}
          onSuccess={handleShareSuccess}
        />
      )}
    </div>
  );
};

export default Reports;