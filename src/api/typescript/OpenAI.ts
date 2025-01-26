import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';  // Adjust port as needed

export const generateResponse = async (userPrompt: string) => {
  try {
    console.log('Sending request to:', `${API_BASE_URL}/api/generateResponse`);
    const response = await axios.post(`${API_BASE_URL}/api/generateResponse`, {
      user_prompt: userPrompt
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      httpsAgent: new (require('https').Agent)({  
        rejectUnauthorized: false
      })
    });
    
    console.log('Response received:', response);
    return response.data;
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
};
