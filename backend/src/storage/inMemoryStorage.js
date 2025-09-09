// In-memory storage for development (will be replaced with database later)
class InMemoryStorage {
  constructor() {
    this.stories = new Map();
    this.brandProfiles = new Map();
    this.users = new Map();
    this.nextId = 1;
  }

  // Story operations
  createStory(data) {
    const id = `story_${this.nextId++}`;
    const story = {
      id,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'processing'
    };
    this.stories.set(id, story);
    return story;
  }

  getStory(id) {
    return this.stories.get(id);
  }

  updateStory(id, data) {
    const story = this.stories.get(id);
    if (!story) return null;
    
    const updatedStory = {
      ...story,
      ...data,
      updated_at: new Date().toISOString()
    };
    this.stories.set(id, updatedStory);
    return updatedStory;
  }

  deleteStory(id) {
    return this.stories.delete(id);
  }

  listStories(userId = null, sortBy = '-created_at') {
    let stories = Array.from(this.stories.values());
    
    if (userId) {
      stories = stories.filter(story => story.user_id === userId);
    }
    
    if (sortBy === '-created_at') {
      stories.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    
    return stories;
  }

  // Brand Profile operations
  createBrandProfile(data) {
    const id = `brand_${this.nextId++}`;
    const brandProfile = {
      id,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.brandProfiles.set(id, brandProfile);
    return brandProfile;
  }

  getBrandProfile(id) {
    return this.brandProfiles.get(id);
  }

  updateBrandProfile(id, data) {
    const brandProfile = this.brandProfiles.get(id);
    if (!brandProfile) return null;
    
    const updatedProfile = {
      ...brandProfile,
      ...data,
      updated_at: new Date().toISOString()
    };
    this.brandProfiles.set(id, updatedProfile);
    return updatedProfile;
  }

  deleteBrandProfile(id) {
    return this.brandProfiles.delete(id);
  }

  listBrandProfiles(userId = null) {
    let profiles = Array.from(this.brandProfiles.values());
    
    if (userId) {
      profiles = profiles.filter(profile => profile.user_id === userId);
    }
    
    return profiles.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  // User operations
  createUser(data) {
    const id = `user_${this.nextId++}`;
    const user = {
      id,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.users.set(id, user);
    return user;
  }

  getUser(id) {
    return this.users.get(id);
  }

  getUserByEmail(email) {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  updateUser(id, data) {
    const user = this.users.get(id);
    if (!user) return null;
    
    const updatedUser = {
      ...user,
      ...data,
      updated_at: new Date().toISOString()
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  deleteUser(id) {
    return this.users.delete(id);
  }

  // Utility methods
  clear() {
    this.stories.clear();
    this.brandProfiles.clear();
    this.users.clear();
    this.nextId = 1;
  }

  getStats() {
    return {
      stories: this.stories.size,
      brandProfiles: this.brandProfiles.size,
      users: this.users.size
    };
  }
}

// Create singleton instance
const storage = new InMemoryStorage();

export default storage;
