const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://www.rushtracker.com',
  'https://rushtracker.com'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
const fratRoutes = require('./routes/fratRoutes');
const brotherRoutes = require('./routes/brotherRoutes');
const eventRoutes = require('./routes/eventRoutes');
const rusheeRoutes = require('./routes/rusheeRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

app.use('/api/upload', uploadRoutes);
app.use('/api/frats', fratRoutes);
app.use('/api/brothers', brotherRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/rushees', rusheeRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB.');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  });

// Monitor MongoDB connection
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Basic route
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to Rushtracker API' });
});

// Health check route
app.get('/api/health', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const dbStatus = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    res.json({
      status: 'success',
      message: 'API is healthy',
      database: {
        state: dbStatus[dbState],
        connected: dbState === 1
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message
    });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle process termination
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error during app termination:', err);
    process.exit(1);
  }
});