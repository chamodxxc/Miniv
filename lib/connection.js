const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const path = require("path");

__path = process.cwd();
const PORT = process.env.PORT || 8000;

// ✅ Import router from index.js
const router = require('../index');
app.use('/', router); // attach router to main app

require('events').EventEmitter.defaultMaxListeners = 500;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Optional: fallback HTML routes
app.use('/pair', async (req, res) => {
    res.sendFile(path.join(__path, '/lib/pair.html'));
});
app.use('/main', async (req, res) => {
    res.sendFile(path.join(__path, '/lib/main.html'));
});

app.get('*', (req, res) => {
    res.send('🚀 WhiteShadow MiniV2 is alive on Heroku!');
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});

module.exports = app;
