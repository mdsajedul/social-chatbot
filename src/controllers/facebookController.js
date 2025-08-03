const { sendMessageToFacebook } = require("../services/facebookService");
const { analyzeMessageWithGemini } = require("../services/geminiService");

const verifyWebhookFacebook = (req,res,next)=>{
    const VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN;
    
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

const handleWebhookFacebook = async (req, res) => {
    const body = req.body;

    if (body.object !== 'page') {
        return res.sendStatus(404); // Invalid webhook type
    }

    try {
        for (const entry of body.entry) {
            for (const event of entry.messaging) {
                const senderId = event.sender?.id;
                const messageText = event.message?.text;

                if (!senderId || !messageText) {
                    console.warn('Missing sender ID or message text');
                    continue;
                }

                console.log(`Received message from Facebook user ${senderId}: ${messageText}`);

                const reply = await analyzeMessageWithGemini(messageText);

                if (!reply) {
                    console.error('Gemini did not return a reply');
                    await sendMessageToFacebook(senderId, 'Please wait a moment, we will get back to you soon.');
                    continue;
                }

                await sendMessageToFacebook(senderId, reply);
                console.log('Reply sent to Facebook user:', reply);
            }
        }

    res.sendStatus(200);

    } catch (error) {
        console.error('Error handling Facebook webhook:', error.response?.data || error.message);
        res.status(500).send('Internal Server Error');
    }
};


module.exports = {
    verifyWebhookFacebook,
    handleWebhookFacebook
};