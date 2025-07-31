const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));


app.get('/webhook', (req, res) => {
    const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;

    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log("Webhook verified");
        res.status(200).send(challenge);
    } else {
        console.error("Webhook verification failed");
        res.sendStatus(403);
    }
});

app.post('/webhook', async (req, res) => {
    const body = req.body;

    if (body.object === 'page') {
        for (const entry of body.entry) {
            for (const event of entry.messaging) {
                const senderId = event.sender.id;
                const message = event.message?.text;

                if (message) {
                    console.log(`Received message from ${senderId}: ${message}`);

                    try {
                        // Call Gemini API (same as /api/chat)
                        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;

                        const response = await axios.post(url, {
                            contents: [{ parts: [{ text: message }] }]
                        }, {
                            headers: {
                                'Content-Type': 'application/json',
                                'X-goog-api-key': process.env.GEMINI_API_KEY,
                            }
                        });

                        const reply = response.data.candidates[0].content.parts[0].text;

                        // Send response to Messenger user
                        await axios.post(
                            `https://graph.facebook.com/v18.0/me/messages?access_token=${process.env.MESSENGER_API_KEY}`,
                            {
                                recipient: { id: senderId },
                                message: { text: reply }
                            }
                        );

                        console.log('Reply sent to Messenger user:', reply);

                    } catch (err) {
                        console.error('Failed to send message:', err.response?.data || err.message);
                    }
                }
            }
        }

        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});


app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }
    try {
        console.log('Received message:', message);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;
        console.log("Generating the response ")

        const response = await axios.post(url, {
            contents: [
                {
                    parts: [{ text: message }]
                }
            ]
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': process.env.GEMINI_API_KEY,
            }
        });

        const reply = response.data.candidates[0].content.parts[0].text;
        console.log('Generated reply:', reply);
        res.json({ reply });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
