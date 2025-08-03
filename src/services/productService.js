const fs = require('fs');
const path = require('path');

// Load and parse product data once at startup
const productDataPath = path.join(__dirname, 'db', 'products.json');
console.log(`Loading product data from: ${productDataPath}`);
let products = [];

try {
    const rawData = fs.readFileSync(productDataPath, 'utf8');
    products = JSON.parse(rawData);
} catch (err) {
    console.error('Failed to load product data:', err.message);
}

/**
 * Filters products from the local DB based on keyword object
 * @param {Object} keywords - Extracted from Gemini prompt (e.g. { brand: 'HP', type: 'laptop' })
 * @returns {Array} matching products
 */
const searchProductsFromDB = async (keywords) => {
    if (!keywords || typeof keywords !== 'object') return [];

    const keywordEntries = Object.entries(keywords).filter(([_, val]) => val?.trim() !== '');

    const matches = products.filter(product =>
        keywordEntries.every(([field, value]) => {
            const productValue = product[field];
            if (!productValue || typeof productValue !== 'string') return false;

            return productValue.toLowerCase().includes(value.toLowerCase());
        })
    );

    return matches;
};

module.exports = { searchProductsFromDB };
