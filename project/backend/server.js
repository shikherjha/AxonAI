const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const axios = require('axios');

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

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: 'Full Name, Email, and Password are required' });
  }

  const userExists = users.find(user => user.email === email);
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ fullName, email, password: hashedPassword });

  res.status(201).json({ message: 'User registered successfully', fullName, email });
});

// Login user
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = users.find(user => user.email === email);
  if (!user) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

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

// Route to handle global search using DuckDuckGo API
app.get('/api/search', async (req, res) => {
  const { query, category } = req.query;

  if (!query) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  // Adding "educational content" to the query to filter for educational results
  const searchQuery = `${query} educational content`;

  const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(searchQuery)}&format=json`;

  try {
    const response = await axios.get(ddgUrl);
    const filteredResults = response.data.RelatedTopics.filter(result => {
      if (category) {
        return result.Result && result.Result.toLowerCase().includes(category.toLowerCase());
      }
      return true; // If no category is selected, return all results
    });

    res.json({ results: filteredResults });
  } catch (error) {
    console.error('Error fetching data from DuckDuckGo API:', error);
    res.status(500).json({ message: 'Error fetching data from DuckDuckGo API' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
