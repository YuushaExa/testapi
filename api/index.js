const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

const BASE_URL = 'https://api.vndb.org/kana/vn';
const RESULTS_PER_PAGE = 100; // Max allowed by the API
const TOTAL_PAGES = 200; // Adjust this based on how many pages you want to fetch
const DELAY_BETWEEN_REQUESTS = 1500; // 1.5 seconds delay between requests

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
            },
            {
                headers: { 'Content-Type': 'application/json' },
            }
        );
        return response.data.results;
    } catch (error) {
        console.error(`Error fetching data for page ${page}:`, error.message);
        return []; // Return an empty array if there's an error
    }
}
// Function to fetch all pages with a delay between requests
async function fetchAllPages() {
    let allResults = [];
    for (let page = 1; page <= TOTAL_PAGES; page++) {
        console.log(`Fetching page ${page}...`);
        const pageData = await fetchVnDataPage(page);
        allResults = allResults.concat(pageData);

        // Add a delay between requests to avoid hitting the rate limit
        if (page < TOTAL_PAGES) {
            await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
        }
    }
    return allResults;
}

// Route to fetch and return all VN data
app.get('/vn', async (req, res) => {
    try {
        const data = await fetchAllPages();
        res.json(data); // Send the data as a JSON response
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
