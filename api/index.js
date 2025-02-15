const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

const BASE_URL = 'https://api.vndb.org/kana/vn';
const RESULTS_PER_PAGE = 100; // Max allowed by the API

async function fetchVnDataOnce() {
    try {
        const response = await axios.post(
            BASE_URL,
            {
                filters: [],
                fields: 'title, description, image.url',
                results: RESULTS_PER_PAGE,
                page: 1, // Fetch only the first page
            },
            {
                headers: { 'Content-Type': 'application/json' },
            }
        );

        const result = response.data;

        // Return the fetched data
        return result.results;
    } catch (error) {
        console.error('Error fetching data:', error.message);
        return [];
    }
}

// Route to fetch and return VN data
app.get('/vn', async (req, res) => {
    try {
        const data = await fetchVnDataOnce();
        res.json(data); // Send the data as a JSON response
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
