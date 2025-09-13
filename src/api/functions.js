// Real functions using the backend
import apiClient from './client.js';

const styleToPreset = (styleKey) => {
  const key = String(styleKey || '').toUpperCase();
  const map = {
    SKETCH: 'HALFTONE_PRINT',
    WATERCOLOR: 'WATERCOLOR',
    VECTOR: 'VECTOR_GRAPHIC',
    COMIC: 'C4D_CARTOON',
    ILLUSTRATION: 'ABSTRACT_ORGANIC',
  };
  return map[key] || null;
};

export const runwareImageGeneration = async (params) => {
  try {
    // Enhanced options for Ideogram API
    const selectedStyle = (params?.visualStyle || params?.options?.style_type || params?.options?.style || 'GENERAL');
    const selectedTheme = (params?.colorTheme || params?.options?.color_theme || null);
    const options = {
      aspect_ratio: '16:9',
      style_type: selectedStyle,
      // Turn off magic prompt when a specific style is chosen to avoid overrides
      magic_prompt: (selectedStyle?.toString?.().toUpperCase?.() === 'GENERAL'),
      // Prefer style_preset when available for stronger aesthetics
      ...(styleToPreset(selectedStyle) ? { style_preset: styleToPreset(selectedStyle) } : {}),
      ...(selectedTheme ? { color_theme: selectedTheme } : {}),
      ...params.options
    };
    
    const response = await apiClient.generateImage(
      params.prompt,
      options,
      params.characterReferenceImages || [],
      params.logoUrl,
      params.includeLogo
    );
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

