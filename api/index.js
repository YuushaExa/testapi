const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

const BASE_URL = 'https://api.vndb.org/kana/vn';
const RESULTS_PER_PAGE = 100; // Max allowed by the API
const DELAY_BETWEEN_REQUESTS = 0; // 1.5 seconds delay between requests

// Function to fetch data for a single page
async function fetchVnDataPage(page) {
    try {
        const response = await axios.post(
            BASE_URL,
            {
                filters: [],
                fields: 'title, description, image.url, developers.name, aliases',
                results: RESULTS_PER_PAGE,
                page: page, // Fetch the specified page
                sort: 'id', // Sort by ID
                reverse: false // Ascending order
            },
            {
                headers: { 'Content-Type': 'application/json' },
            }
        );
        return response.data; // Return the entire response
    } catch (error) {
        console.error(`Error fetching data for page ${page}:`, error.message);
        return { results: [], more: false }; // Return empty data if there's an error
    }
}

//  tags.name
// screenshots.url

// Function to fetch all pages dynamically within a range
async function fetchPageRange(startPage, endPage) {
    let allResults = [];
    let page = startPage;
    let hasMorePages = true;

    while (hasMorePages && page <= endPage) {
        console.log(`Fetching page ${page}...`);
        const response = await fetchVnDataPage(page);
        allResults = allResults.concat(response.results);

        // Check if there are more pages to fetch
        hasMorePages = response.more;
        page++;

        // Add a delay between requests to avoid hitting the rate limit
        if (hasMorePages && page <= endPage) {
            await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
        }
    }

    console.log(`Fetched ${allResults.length} results from pages ${startPage} to ${page - 1}.`);
    return allResults;
}

// Route to fetch and return VN data for a specific page range
app.get('/vn', async (req, res) => {
    try {
        const startPage = parseInt(req.query.startPage) || 356; // Default to page 1 if not provided
        const endPage = parseInt(req.query.endPage) || 500; // Default to page 10 if not provided

        if (isNaN(startPage) || isNaN(endPage) || startPage > endPage) {
            return res.status(400).json({ error: 'Invalid startPage or endPage' });
        }

        const data = await fetchPageRange(startPage, endPage);
        res.json(data); // Send the data as a JSON response
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
