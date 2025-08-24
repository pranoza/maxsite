const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the root directory.
// This includes your index.html, index.tsx, and other files.
app.use(express.static(path.join(__dirname, '')));

// This route handler must be the last one.
// It ensures that for any request that doesn't match a static file,
// the index.html is served. This is crucial for Single Page Applications like React.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
