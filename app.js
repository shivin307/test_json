const express = require('express');
const dataDotJson = require('./data.json');

const app = express();
const PORT = process.env.PORT || 8080;
const { data: jsonData } = dataDotJson;

app.get('/', (req, res) => {
    const response = {
        greeting: "Hey, Buddy! Welcome to the StudentAI API",
        statusCode: res.statusCode
    };

    res.json(response);
});

// Define a function to read the version information from the version.json file
const getVersionInfo = () => {
    try {
        const versionData = fs.readFileSync('./version.json');
        return JSON.parse(versionData);
    } catch (err) {
        console.error('Error reading version.json file:', err);
        return { err }; // Return an empty object if there's an error
    }
};

// Route to get app version information
app.get('/version', (req, res) => {
    const versionInfo = getVersionInfo();
    res.json(versionInfo);
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

app.get('*', function (req, res) {
    res.status(500).json({ error: 'Details not found!' });
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});