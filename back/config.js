// config.js
require('dotenv').config();

const HF_API_KEY = process.env.HF_API_KEY;
const PORT = process.env.PORT || 3001;

module.exports = { HF_API_KEY, PORT };