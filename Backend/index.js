const dotenv = require('dotenv');
require('dotenv').config();


const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173', // frontend origin
  credentials: true,
}));

// Serve static image folders
app.use('/userpic', express.static('userpic'));
app.use('/reported', express.static('reported'));
app.use('/missing', express.static('missing'));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/children', require('./routes/children'));
app.use('/api/events', require('./routes/events'));
app.use('/api/otp', require('./routes/otp'));
app.use('/api/adoption', require('./routes/adoption'));
app.use('/api/payment', require('./routes/payment'));

// Default Route
app.get('/', (req, res) => {
  res.send('🚀 Missing & Lost Child API is running...');
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
