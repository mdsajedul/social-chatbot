const { analyzeMessageWithGemini } = require("../services/geminiService");
const { sendWhatsAppMessage } = require("../services/whatsappService");

const verifyWebhookWhatsapp = (req, res, next) => {
    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    try {
        if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log("Webhook verified");
            res.status(200).send(challenge);
        } else {
            console.error("Webhook verification failed");
            res.sendStatus(403);
        }
    } catch (error) {
        console.error("Error during webhook verification:", error);
        res.status(500).send("Internal Server Error");
    }
}


const handleWebhookWhatsapp = async (req, res) => {
    console.log('Received WhatsApp webhook payload:', JSON.stringify(req.body, null, 2));

    const message = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    const senderId = message?.from;
    const userText = message?.text?.body;

    if (!senderId || !userText) {
        console.error('Invalid message format or missing sender/text');
        return res.status(400).send('Invalid message format');
    }

    try {
        const reply = await analyzeMessageWithGemini(userText);

        if (!reply) {
            console.error('Gemini did not return a reply');
            await sendWhatsAppMessage(senderId, 'Please wait a moment, we will get back to you soon.');
            return res.status(500).send('No reply generated');
        }
        await sendWhatsAppMessage(senderId, reply);
        console.log('Reply sent to WhatsApp user:', reply);
        return res.sendStatus(200);

    } catch (error) {
        console.error('Error processing WhatsApp message:', error.response?.data || error.message);
        await sendWhatsAppMessage(senderId, 'Something went wrong. Please try again later.');
        return res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    verifyWebhookWhatsapp,
    handleWebhookWhatsapp
};