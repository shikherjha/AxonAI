const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const axios = require('axios');
const xml2js = require('xml2js');

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

// Function to fetch papers from arXiv
// Function to fetch papers from arXiv
const fetchArxivPapers = async (query) => {
    try {
      // Construct the arXiv API URL
      const url = `http://export.arxiv.org/api/query?search_query=all:${query}&start=0&max_results=10`;
      console.log(`Fetching from arXiv with URL: ${url}`);
  
      // Make the API request to arXiv
      const response = await axios.get(url);
      console.log('arXiv response:', response.data);  // Log the raw response data
  
      // Parse the XML response to JSON format
      const parsedData = await parseXml(response.data);
      console.log('Parsed arXiv data:', parsedData);  // Log the parsed data
  
      // Extract relevant data from the parsed JSON
      const papers = parsedData.feed.entry.map((entry) => ({
        title: entry.title[0],
        authors: entry.author.map(author => author.name[0]),
        summary: entry.summary[0],
        published: entry.published[0],
        link: entry.link[0].$.href,  // Link to the full paper
      }));
  
      return papers;
    } catch (error) {
      console.error('Error fetching papers from arXiv:', error.message);  // Log the specific error
      throw error;
    }
  };
  
// Helper function to parse the XML data to JSON
const parseXml = (xmlData) => {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xmlData, { explicitArray: false }, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

// Route to handle global search (search arXiv and other resources)
app.get('/api/search', async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  try {
    // Fetch results from arXiv
    const arxivResults = await fetchArxivPapers(query);

    // You can add more API calls here for other sources like Open Library, LibriVox, etc.
    
    // Combine the results (if needed)
    const results = {
      arxiv: arxivResults,
      // Add other sources here
    };

    // Return the search results
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data from external sources' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
