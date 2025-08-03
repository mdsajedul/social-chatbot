const axios = require('axios');

const sendWhatsAppMessage = async (to, message)=> {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const url = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`;

    try {
        await axios.post(url, {
            messaging_product: 'whatsapp',
            to: to,
            type: 'text',
            text: { body: message }
        }, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}` 
            }
        });

        console.log(`Message sent to ${to}: ${message}`);
    } catch (error) {
        console.error('Error sending WhatsApp message:', error.response?.data || error.message);
    }
}

module.exports = { sendWhatsAppMessage };
