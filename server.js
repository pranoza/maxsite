const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the root directory.
// Set the correct MIME type for .tsx files so the browser doesn't block them.
app.use(express.static(path.join(__dirname, ''), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.tsx')) {
      // Set the content type to match the script type in index.html
      res.setHeader('Content-Type', 'text/babel; charset=UTF-8');
    }
  }
}));

// This route handler must be the last one.
// It ensures that for any request that doesn't match a static file,
// the index.html is served. This is crucial for Single Page Applications like React.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
