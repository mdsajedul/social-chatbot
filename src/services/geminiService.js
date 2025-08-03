const axios = require('axios');

const analyzeMessageWithGemini = async (text) => {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;

    const response = await axios.post(url, {
      contents: [{ parts: [{ text }] }]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': process.env.GEMINI_API_KEY,
      }
    });

    const reply = response.data.candidates[0].content.parts[0].text;
    return reply;
  } catch (err) {
    console.error('Failed to analyze message with Gemini:', err.response?.data || err.message);
    throw err;
  }
};

module.exports = { analyzeMessageWithGemini };
