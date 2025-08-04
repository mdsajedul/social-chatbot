const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const webhookRoutes = require('./routes/webhookRoutes');
const apiRoutes = require('./routes/apiRoutes');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use('/api', (req, res, next) => {
    console.log(`API Request: ${req.method} ${req.originalUrl}`);

    next();
}, apiRoutes);
app.use('/', webhookRoutes);
app.get('/', (req, res) => {
    res.send('Welcome to the Chatbot Server!');
});


module.exports = app;