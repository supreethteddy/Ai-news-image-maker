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

  async delete(id) {
    await apiClient.deleteStory(id);
  },

  async regenerateImage(id, partIndex, promptOverride = null) {
    const response = await apiClient.regenerateImage(id, partIndex, promptOverride);
    return response.data;
  }
};

export const BrandProfile = {
  async create(data) {
    const response = await apiClient.createBrandProfile(data);
    return response.data;
  },

  async list() {
    const response = await apiClient.getBrandProfiles();
    return response.data;
  },

  async update(id, data) {
    const response = await apiClient.updateBrandProfile(id, data);
    return response.data;
  },

  async get(id) {
    const response = await apiClient.getBrandProfile(id);
    return response.data;
  },

  async delete(id) {
    await apiClient.deleteBrandProfile(id);
  },

  async getDefault() {
    try {
      const response = await apiClient.getDefaultBrandProfile();
      return response.data;
    } catch (error) {
      return null;
    }
  },

  async setDefault(id) {
    const response = await apiClient.setDefaultBrandProfile(id);
    return response.data;
  }
};

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