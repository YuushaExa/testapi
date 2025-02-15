const axios = require('axios');
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

// Fetch and display VN titles, descriptions, and image URLs
fetchVnDataOnce()
    .then((data) => {
        data.forEach((vn, index) => {
            console.log(`Entry ${index + 1}:`);
            console.log(`Title: ${vn.title}`);
            console.log(`Description: ${vn.description || 'No description available'}`);
            console.log(`Image URL: ${vn.image?.url || 'No image available'}`);
            console.log('---');
        });
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
