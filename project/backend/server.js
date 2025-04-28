const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const axios = require('axios');
const corsAnywhere = require('cors-anywhere'); // Importing the CORS Anywhere package

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// In-memory database (temporary)
const users = [];

// Routes

// Basic check route
app.get('/', (req, res) => {
  res.send('Backend is running 🔥');
});

// Register new user
app.post('/api/register', async (req, res) => {
  const { fullName, email, password } = req.body;

  // Check if any field is missing
  if (!fullName || !email || !password) {
    return res.status(400).json({ message: 'Full Name, Email, and Password are required' });
  }

  // Check if user already exists
  const userExists = users.find(user => user.email === email);
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Save user (including full name)
  users.push({ fullName, email, password: hashedPassword });

  res.status(201).json({ message: 'User registered successfully', fullName, email });
});

// Login user
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  // Check if email or password is missing
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // Find user by email
  const user = users.find(user => user.email === email);
  if (!user) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  // Validate password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  // Create token
  const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.json({ message: 'Login successful', token });
});

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401); // Unauthorized

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden
    req.user = user;
    next();
  });
};

// Protected route (bonus)
app.get('/api/me', authenticateToken, (req, res) => {
  const user = users.find(user => user.email === req.user.email);
  if (user) {
    res.json({ message: `Welcome ${user.fullName}!`, user });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// CORS proxy setup
const corsProxy = corsAnywhere.createServer({
  originWhitelist: [], // Allows all origins
  requireHeaders: [], // Allows all headers
  removeHeaders: ['cookie', 'authorization'], // Prevents sensitive headers from being forwarded
});

// Route to handle global search using SearxNG
app.get('/api/search', async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  const searxUrl = `https://searx.be/search?q=${encodeURIComponent(query)}&format=json`;

  try {
    // Proxy the request to the external SearxNG instance
    corsProxy.emit('request', req, res, {
      target: searxUrl,
    });
  } catch (error) {
    console.error('Error with CORS proxy:', error);
    res.status(500).json({ message: 'Error fetching data from SearxNG' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
