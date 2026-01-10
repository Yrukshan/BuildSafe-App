// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const path = require('path'); // ✅ ADDED: required for static files


require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
 // Support large payloads
app.use(express.urlencoded({ extended: true }));

// Serve static files (for PDFs)
app.use('/reports', express.static(path.join(__dirname, 'public/reports')));


app.use('/recommendations', express.static(path.join(__dirname, 'public/recommendations')));


// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
const routes = require('./routes/index');
app.use(routes);

// Basic health check
app.get('/', (req, res) => {
  res.json({ message: 'BuildSafe Backend is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});


 