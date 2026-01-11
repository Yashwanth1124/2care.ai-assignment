import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import api from '../../services/api';
import './VitalsChart.css';

const VitalsChart = () => {
  const [trends, setTrends] = useState({});
  const [selectedType, setSelectedType] = useState('BP');
  const [dateRange, setDateRange] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(true);

  const vitalTypes = ['BP', 'Sugar', 'Heart Rate', 'Oxygen', 'Temperature', 'Weight'];

  useEffect(() => {
    fetchVitalsTrends();
  }, [dateRange]);

  const fetchVitalsTrends = async () => {
    setLoading(true);
    try {
      const response = await api.get('/vitals/trends', {
        params: dateRange
      });
      setTrends(response.data.trends || {});
    } catch (error) {
      console.error('Error fetching vitals trends:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatChartData = (type) => {
    if (!trends[type] || trends[type].length === 0) {
      return [];
    }

    return trends[type].map(item => ({
      date: new Date(item.date).toLocaleDateString(),
      value: parseFloat(item.value)
    }));
  };

  const chartData = formatChartData(selectedType);

  return (
    <div className="vitals-chart-container">
      <h2>Vitals Trends</h2>
      
      <div className="chart-controls">
        <div className="form-group" style={{ marginBottom: '10px' }}>
          <label>Select Vital Type</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="form-control"
          >
            {vitalTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        
        <div className="date-range-controls">
          <div className="form-group" style={{ marginBottom: '10px' }}>
            <label>Start Date</label>
            <input
              type="date"
              value={dateRange.start_date}
              onChange={(e) => setDateRange({...dateRange, start_date: e.target.value})}
            />
          </div>
          <div className="form-group" style={{ marginBottom: '10px' }}>
            <label>End Date</label>
            <input
              type="date"
              value={dateRange.end_date}
              onChange={(e) => setDateRange({...dateRange, end_date: e.target.value})}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-message">Loading chart data...</div>
      ) : chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#4CAF50"
              strokeWidth={2}
              name={selectedType}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="no-data-message">
          No data available for {selectedType} in the selected date range.
        </div>
      )}

      {/* Show all vital types */}
      <div className="all-vitals-summary">
        <h3>Summary</h3>
        <div className="vitals-summary-grid">
          {vitalTypes.map(type => {
            const typeData = trends[type] || [];
            const latest = typeData.length > 0 ? typeData[typeData.length - 1] : null;
            return (
              <div key={type} className="vital-summary-card">
                <div className="vital-type">{type}</div>
                <div className="vital-value">
                  {latest ? latest.value : 'N/A'}
                </div>
                <div className="vital-count">{typeData.length} records</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VitalsChart;