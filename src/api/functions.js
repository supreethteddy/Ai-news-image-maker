// Real functions using the backend
import apiClient from './client.js';

export const runwareImageGeneration = async (params) => {
  try {
    // Enhanced options for Ideogram API
    const options = {
      aspect_ratio: '16:9',
      style: 'photorealistic',
      magic_prompt: true,
      ...params.options
    };
    
    const response = await apiClient.generateImage(params.prompt, options);
    const url = response?.data?.url || response?.data?.data?.[0]?.url || response?.url || null;
    return {
      data: {
        url
      },
      success: Boolean(url)
    };
  } catch (error) {
    console.error('Ideogram image generation error:', error);
    
    // Fallback for development
    if (import.meta.env.DEV) {
      return {
        data: {
          url: `https://picsum.photos/1024/576?random=${Math.floor(Math.random() * 1000)}`
        },
        success: true
      };
    }
    
    throw error;
  }
};

