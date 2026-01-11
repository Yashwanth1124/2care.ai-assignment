const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Initialize database
require('./database/init');

const authRoutes = require('./routes/auth.routes');
const reportsRoutes = require('./routes/reports.routes');
const vitalsRoutes = require('./routes/vitals.routes');
const shareRoutes = require('./routes/share.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/vitals', vitalsRoutes);
app.use('/api/share', shareRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Health Wallet API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});