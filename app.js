const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const transactionRoutes = require('./routes/transactions');
const damageRoutes = require('./routes/damages');
const notificationRoutes = require('./routes/notifications');
const deliveryRoutes = require('./routes/deliveries');

// Import middleware
const { auditMiddleware } = require('./middleware/auditMiddleware');
const { applyAuditToModels } = require('./middleware/auditMiddleware');

// Import models to apply audit hooks
const models = require('./models');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply audit middleware to all routes
app.use(auditMiddleware);

// Apply audit hooks to models
applyAuditToModels(models);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'IEventory API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/damages', damageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/deliveries', deliveryRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

module.exports = app;
