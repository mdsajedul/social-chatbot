const axios = require('axios');

const sendMessageToFacebook = async (senderId, message) => {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/me/messages?access_token=${process.env.MESSENGER_API_KEY}`,
      {
        recipient: { id: senderId },
        message: { text: message }
      }
    );
    console.log('Reply sent to Messenger user:', message);
    return response.data;
  } catch (err) {
    console.error('Failed to send message to Messenger:', err.response?.data || err.message);
    throw err;
  }
};

module.exports = { sendMessageToFacebook };
