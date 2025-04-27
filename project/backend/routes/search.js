const express = require('express');
const router = express.Router();
const { fetchArxivPapers } = require('../api/arxiv');

// Route to handle global search
router.get('/search', async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  try {
    const papers = await fetchArxivPapers(query);
    return res.json(papers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data from arXiv' });
  }
});

module.exports = router;
