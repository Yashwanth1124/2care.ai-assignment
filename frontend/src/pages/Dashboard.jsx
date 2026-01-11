import React, { useState, useEffect } from 'react';
import VitalsChart from '../components/Dashboard/VitalsChart';
import UploadReport from '../components/Dashboard/UploadReport';
import AddVital from '../components/Dashboard/AddVital';
import RecentReports from '../components/Dashboard/RecentReports';
import api from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentReports();
  }, []);

  const fetchRecentReports = async () => {
    try {
      const response = await api.get('/reports?limit=5');
      setReports(response.data.reports || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReportUploaded = () => {
    fetchRecentReports();
  };

  return (
    <div className="container">
      <h1>Health Dashboard</h1>
      
      <div className="dashboard-grid">
        <div className="dashboard-section">
          <AddVital />
        </div>
        
        <div className="dashboard-section">
          <UploadReport onUpload={handleReportUploaded} />
        </div>
      </div>

      <div className="dashboard-section full-width">
        <VitalsChart />
      </div>

      <div className="dashboard-section full-width">
        <RecentReports reports={reports} loading={loading} />
      </div>
    </div>
  );
};

export default Dashboard;