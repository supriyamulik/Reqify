require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth.routes');
const organizationRoutes = require('./routes/organization.routes');
const invitationRoutes = require('./routes/invitation.routes');
// Import requirement routes when ready
// const requirementRoutes = require('./routes/requirement.routes');

// Initialize express
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(compression()); // Compress responses
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('dev')); // Logging

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Reqify Multi-Tenant API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        mode: 'Multi-Tenant SaaS'
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/invitations', invitationRoutes);
// app.use('/api/requirements', requirementRoutes); // Add when ready

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════╗
║   🚀 Reqify Multi-Tenant Backend Server          ║
╠═══════════════════════════════════════════════════╣
║   Port: ${PORT}                                    
║   Environment: ${process.env.NODE_ENV || 'development'}               
║   Database: MongoDB                               
║   Mode: Multi-Tenant SaaS                         
╚═══════════════════════════════════════════════════╝
  `);
});