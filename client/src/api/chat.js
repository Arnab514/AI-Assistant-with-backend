import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export const generateOptions = async (query) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/generate-options`, { query });
    return response.data.options;
  } catch (error) {
    console.error('Error generating options:', error);
    throw new Error('Failed to generate options');
  }
};

export const generateDetailedResponse = async (query, selectedOptions) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/generate-detailed-response`, {
      query,
      selectedOptions,
    });
    return response.data.response;
  } catch (error) {
    console.error('Error generating detailed response:', error);
    throw new Error('Failed to generate detailed response');
  }
};