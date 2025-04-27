const axios = require('axios');
const xml2js = require('xml2js');

// Function to fetch arXiv papers
const fetchArxivPapers = async (query) => {
  try {
    // Construct the arXiv API URL
    const url = `http://export.arxiv.org/api/query?search_query=all:${query}&start=0&max_results=10`;

    // Make the API request to arXiv
    const response = await axios.get(url);
    
    // Parse the XML response to JSON format
    const parsedData = await parseXml(response.data);

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
    console.error('Error fetching papers from arXiv:', error);
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

module.exports = { fetchArxivPapers };
