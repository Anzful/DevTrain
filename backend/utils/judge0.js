// backend/utils/judge0.js
const axios = require('axios');

exports.executeCode = async (code, language, input) => {
  // Map language to Judge0 language id (example: JavaScript=63, Python=71, C++=54)
  const languageMap = { javascript: 63, python: 71, cpp: 54 };
  const languageId = languageMap[language] || 63;
  
  try {
    const response = await axios.post(
      process.env.JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com/submissions',
      {
        source_code: code,
        language_id: languageId,
        stdin: input
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Host': process.env.JUDGE0_HOST,
          'X-RapidAPI-Key': process.env.JUDGE0_API_KEY
        }
      }
    );
    
    let token = response.data.token;
    let result;
    // Poll for result
    while (true) {
      const res = await axios.get(`${process.env.JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com/submissions'}/${token}`, {
        headers: {
          'X-RapidAPI-Host': process.env.JUDGE0_HOST,
          'X-RapidAPI-Key': process.env.JUDGE0_API_KEY
        }
      });
      result = res.data;
      if (result.status && result.status.id >= 3) break;
      await new Promise(r => setTimeout(r, 1000));
    }
    return result.stdout || result.stderr || '';
  } catch (err) {
    console.error(err);
    return '';
  }
};
