// In-memory storage for development (will be replaced with database later)
class InMemoryStorage {
  constructor() {
    this.stories = new Map();
    this.brandProfiles = new Map();
    this.users = new Map();
    this.characters = new Map();
    this.storyboards = new Map();
    this.stylingTemplates = new Map();
    // Simple site-wide branding settings (admin editable)
    this.branding = {
      brandName: 'NewsPlay',
      logoUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/30f8cfabb_POWEREDBYSTAIBLTECH.png',
      iconUrl: '',
      poweredByUrl: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/30f8cfabb_POWEREDBYSTAIBLTECH.png',
      footerText: 'Transform any text into captivating visual storyboards using AI.',
      primaryFrom: '#2563eb',
      primaryTo: '#7c3aed'
    };
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

  // Character operations
  createCharacter(data) {
    const id = `character_${this.nextId++}`;
    const character = {
      id,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.characters.set(id, character);
    return character;
  }

  getCharacterById(id) {
    return this.characters.get(id);
  }

  updateCharacter(id, data) {
    const character = this.characters.get(id);
    if (!character) return null;
    
    const updatedCharacter = {
      ...character,
      ...data,
      updated_at: new Date().toISOString()
    };
    this.characters.set(id, updatedCharacter);
    return updatedCharacter;
  }

  deleteCharacter(id) {
    return this.characters.delete(id);
  }

  getCharactersByUser(userId) {
    return Array.from(this.characters.values())
      .filter(character => character.userId === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  // Storyboard operations
  createStoryboard(data) {
    const id = `storyboard_${this.nextId++}`;
    const storyboard = {
      id,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.storyboards.set(id, storyboard);
    return storyboard;
  }

  getStoryboardById(id) {
    return this.storyboards.get(id);
  }

  updateStoryboard(id, data) {
    const storyboard = this.storyboards.get(id);
    if (!storyboard) return null;
    
    const updatedStoryboard = {
      ...storyboard,
      ...data,
      updatedAt: new Date().toISOString()
    };
    this.storyboards.set(id, updatedStoryboard);
    return updatedStoryboard;
  }

  deleteStoryboard(id) {
    return this.storyboards.delete(id);
  }

  getStoryboardsByUser(userId) {
    return Array.from(this.storyboards.values())
      .filter(storyboard => storyboard.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Styling Template operations
  createStylingTemplate(data) {
    const id = `template_${this.nextId++}`;
    const template = {
      id,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.stylingTemplates.set(id, template);
    return template;
  }

  getStylingTemplateById(id) {
    return this.stylingTemplates.get(id);
  }

  updateStylingTemplate(id, data) {
    const template = this.stylingTemplates.get(id);
    if (!template) return null;
    
    const updatedTemplate = {
      ...template,
      ...data,
      updatedAt: new Date().toISOString()
    };
    this.stylingTemplates.set(id, updatedTemplate);
    return updatedTemplate;
  }

  deleteStylingTemplate(id) {
    return this.stylingTemplates.delete(id);
  }

  getStylingTemplatesByUser(userId) {
    return Array.from(this.stylingTemplates.values())
      .filter(template => template.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Branding operations
  getBranding() {
    return this.branding;
  }

  updateBranding(updates) {
    this.branding = {
      ...this.branding,
      ...updates
    };
    return this.branding;
  }

  // Utility methods
  clear() {
    this.stories.clear();
    this.brandProfiles.clear();
    this.users.clear();
    this.characters.clear();
    this.storyboards.clear();
    this.stylingTemplates.clear();
    this.nextId = 1;
  }

  getStats() {
    return {
      stories: this.stories.size,
      brandProfiles: this.brandProfiles.size,
      users: this.users.size,
      characters: this.characters.size,
      storyboards: this.storyboards.size,
      stylingTemplates: this.stylingTemplates.size
    };
  }
}

// Create singleton instance
const storage = new InMemoryStorage();

// Export both the class and the instance
export { InMemoryStorage as CharacterStorage };
export default storage;
