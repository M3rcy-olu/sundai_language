import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface TTSRequest {
  text: string;
  voice_id?: string;  // Optional
  model_id?: string;  // Optional
}

export const generateSpeech = async (params: TTSRequest) => {
  try {
    console.log("wtfwtfwtfwtwftfwf generate speech")
    console.log('Sending request to:', `${API_BASE_URL}/api/text-to-speech`);
    const response = await axios.post(`${API_BASE_URL}/api/text-to-speech`, params, {
      headers: {
        'Content-Type': 'application/json',
      },
      responseType: 'arraybuffer',  // Important for receiving audio data
      httpsAgent: new (require('https').Agent)({  
        rejectUnauthorized: false
      })
    });
    
    console.log('Response received:', response);
    return response.data;  // This will be audio data
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error generating speech:', {
        message: error.message,
        endpoint: `${API_BASE_URL}/api/text-to-speech`,
        params: params
      });
    } else {
      console.error('Unknown error generating speech:', {
        error,
        endpoint: `${API_BASE_URL}/api/text-to-speech`,
        params: params
      });
    }
    throw error;
  }
};
