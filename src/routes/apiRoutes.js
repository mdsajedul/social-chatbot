const router = require('express').Router();

const {sendMessage} = require('../controllers/messagingController');

router.post('/send-message', (req, res) => {
    console.log('Received message request:', req.body);
    sendMessage(req, res);
});
router.get('/hello', (req, res) => {
    res.send('Hello from API Routes!');
});

module.exports = router;