const { analyzeMessageWithGemini } = require("../services/geminiService");
const { searchProductsFromDB } = require("../services/productService");
const { generateCombinedPrompt } = require("../utils/promptBuilder");

const sendMessage = async (req, res) => {
    const { senderId, message } = req.body;

    if (!senderId || !message) {
        return res.status(400).json({ error: 'Sender ID and message are required' });
    }

    console.log(`Received message from user ${senderId}: ${message}`);

    try {
        const buildPrompt = generateCombinedPrompt(message);
        console.log('Generated prompt for Gemini:', buildPrompt);
        const geminiResponse = await analyzeMessageWithGemini(buildPrompt);

        if (!geminiResponse) {
            console.error('Gemini did not return a response');
            return res.status(500).json({ error: 'Failed to get response from Gemini' });
        }

        let parsed;
        try {
            const cleanedResponse = geminiResponse
                .replace(/```json\s*([\s\S]*?)\s*```/, '$1')  // handle ```json blocks
                .replace(/```[\s\S]*?```/, '')                // fallback clean for ``` blocks
                .trim();

            parsed = JSON.parse(cleanedResponse);
        } catch (err) {
            console.error('❌ Failed to parse Gemini response:', geminiResponse);
            return res.status(400).json({ error: 'Invalid response format from Gemini' });
        }

        console.log('Parsed response:', parsed);

        if (parsed.isProductQuery) {
            const products = await searchProductsFromDB(parsed.keywords);

            if (products.length > 0) {
                const productList = products
                    .slice(0, 3)
                    .map(p => `• ${p.name} (${p.brand}) - ${p.price}`)
                    .join('\n');

                const productMessage = `Here are some products you might be interested in:\n\n${productList}`;
                return res.status(200).json({ type: 'product_suggestion', message: productMessage, products });
            } else {
                return res.status(200).json({ type: 'product_suggestion', message: "Sorry, I couldn't find any matching products." });
            }
        } else {
            const fallbackReply = parsed.reply || "Thank you for your message! How can I help you today?";
            return res.status(200).json({ type: 'reply', message: fallbackReply });
        }

    } catch (error) {
        console.error('Error processing message:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


module.exports = {
    sendMessage
};