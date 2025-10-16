// Centralized API configuration
export const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
};

// Helper function for API calls with automatic base URL
export const apiCall = async (endpoint, options = {}) => {
  const baseUrl = getApiBaseUrl();
  const url = endpoint.startsWith('/') ? `${baseUrl}${endpoint}` : `${baseUrl}/${endpoint}`;
  
  return fetch(url, options);
};


