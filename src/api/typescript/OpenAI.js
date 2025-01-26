import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_SERVER_URL;

export const generateResponse = async (params) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/generateResponse`, params);
    return response.data;
  } catch (error) {
    console.error('Error in OpenAI generate API:', error.response?.data || error.message);
    throw error;
  }
};
