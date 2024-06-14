const express = require('express');
const fs = require('fs'); // Import the 'fs' module to work with the file system
const dataDotJson = require('./data.json');

const app = express();
const PORT = process.env.PORT || 8080;
const { data: jsonData } = dataDotJson;


// Route to get app version information
app.get('/version', (req, res) => {
    const appVersionInfo = {
        current_version: "5.0.0",
        is_update_available: true,
        update_type: "minor",
        release_notes: "Added new features and fixed bugs.",
        mandatory_update: false,
        download_url: "https://example.com/app/download",
        release_date: "2024-06-01",
        min_supported_version: "4.0.0",
        security_patches: "Fixed vulnerabilities in the authentication module.",
        file_size: "50MB"
    };
    res.json(appVersionInfo);
});

const paginationMiddleware = () => {
    return (req, res, next) => {
        const pageNumber = +req.query.page || 1;
        const pageSize = parseInt(req.query.limit) || 50;
        const startIndex = (pageNumber - 1) * pageSize;
        const endIndex = startIndex + pageSize;

        req.pagination = {
            page: pageNumber,
            limit: pageSize,
            startIndex,
            endIndex
        };

        next();
    };
};

app.get('/search', paginationMiddleware(), (req, res) => {
    const { startIndex, endIndex } = req.pagination;
    const searchText = req.query.apps;
    const filters = req.query.filters;
    const filterArray = filters?.split(',') || ['title'];

    let searchResults = searchText
        ? jsonData.filter((item) => {
            return filterArray.every(filterTerm => item[filterTerm].toLowerCase().includes(searchText.toLowerCase()));
        })
        : jsonData.slice(startIndex, endIndex);

    searchResults = searchResults.slice(startIndex, endIndex);

    const response = {
        result: searchResults.map(({ id, icon, color, title, disc }) => (
            {
                id,
                icon,
                color,
                title,
                disc
            }))
    };

    res.json(response);
});

app.get('/id/:id', (req, res) => {
    const requestedId = req.params.id.toLowerCase();
    const searchResult = jsonData.find((item) => item.id === requestedId);

    if (!searchResult) {
        res.status(404).json({ error: 'ID not found' });
        return;
    }

    const response = {
        result: searchResult
    };

    res.json(response);
});

// Catch-all route for handling all requests
app.get('*', (req, res) => {
    res.status(200).json({ success: '🎉 Congratulations! Your deployment was successful! 🎉' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
