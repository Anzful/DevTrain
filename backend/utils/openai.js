// backend/utils/openai.js
const axios = require('axios');

exports.getCodeFeedback = async (code) => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a helpful programming assistant." },
          { role: "user", content: `Review the following code and suggest improvements:\n\n${code}` }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );
    return response.data.choices[0].message.content;
  } catch (err) {
    console.error(err);
    return 'Unable to get feedback.';
  }
};
