const express = require('express');
const routes = require('./routes');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Add bodyParser.json() middleware to parse JSON request bodies
app.use(bodyParser.json());

// Load routes from routes/index.js
app.use('/', routes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
