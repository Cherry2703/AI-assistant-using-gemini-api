const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config(); 

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "GOOGLE_API_KEY");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const MAX_RETRIES = 3;

const sendToGoogleGenerativeAI = async (userMessage, retries = MAX_RETRIES) => {
  try {
    const result = await model.generateContent(userMessage); 
    const responseText = result.response.text();
    return responseText;
  } catch (error) {
    if (error.response && error.response.status === 429 && retries > 0) {
      console.warn('Rate limit exceeded. Retrying...');
      await new Promise(resolve => setTimeout(resolve, 2000)); 
      return sendToGoogleGenerativeAI(userMessage, retries - 1);
    }
    console.error('Error with Google Generative AI API:', error.message);
    throw new Error('Something went wrong or rate limit exceeded');
  }
};

app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.input;
  console.log(userMessage);
  

  if (!userMessage) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  try {
    const response = await sendToGoogleGenerativeAI(userMessage);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
