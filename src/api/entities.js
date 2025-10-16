// Real API entities using the backend
import apiClient from './client.js';

export const Story = {
  async create(data) {
    const response = await apiClient.createStory(data);
    return response.data;
  },

  async list(sortBy = '-created_date') {
    const response = await apiClient.getStories();
    return response.data;
  },

  async update(id, data) {
    const response = await apiClient.updateStory(id, data);
    return response.data;
  },

  async get(id) {
    const response = await apiClient.getStory(id);
    return response.data;
  },

  async getPublic(id) {
    const response = await apiClient.getPublicStory(id);
    return response.data;
  },

  async getPublicBySlug(slug) {
    const response = await apiClient.getPublicStoryBySlug(slug);
    return response.data;
  },

  async delete(id) {
    await apiClient.deleteStory(id);
  },

  async regenerateImage(id, partIndex, promptOverride = null) {
    const response = await apiClient.regenerateImage(id, partIndex, promptOverride);
    return response.data;
  }
};

// BrandProfile entity removed - using user profiles only

export const User = {
  async getCurrentUser() {
    try {
      const response = await apiClient.getProfile();
      return response.data;
    } catch (error) {
      return null;
    }
  },

  async register(userData) {
    const response = await apiClient.register(userData);
    return response.data;
  },

  async login(credentials) {
    const response = await apiClient.login(credentials);
    return response.data;
  },

  async logout() {
    apiClient.logout();
  },

  async updateProfile(profileData) {
    const response = await apiClient.updateProfile(profileData);
    return response.data;
  }
};