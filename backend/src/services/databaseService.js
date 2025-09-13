import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️ Supabase credentials not found, database operations will fail');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export class DatabaseService {
  // Storyboards
  static async createStoryboard(data) {
    try {
      const { data: result, error } = await supabase
        .from('storyboards')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Error creating storyboard:', error);
      throw error;
    }
  }

  static async getStoryboardsByUser(userId) {
    try {
      const { data, error } = await supabase
        .from('storyboards')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to match frontend expectations
      const transformedData = (data || []).map(storyboard => ({
        id: storyboard.id,
        title: storyboard.title,
        original_text: storyboard.original_text,
        storyboard_parts: (storyboard.storyboard_parts || []).map(part => ({
          text: part.text,
          image_prompt: part.imagePrompt,
          section_title: part.sectionTitle,
          image_url: part.imageUrl  // Transform imageUrl to image_url
        })),
        character_id: storyboard.character_id,
        style: storyboard.style,
        user_id: storyboard.user_id,
        created_at: storyboard.created_at,
        updated_at: storyboard.updated_at
      }));
      
      return transformedData;
    } catch (error) {
      console.error('Error fetching storyboards:', error);
      throw error;
    }
  }

  static async getStoryboardById(id) {
    try {
      const { data, error } = await supabase
        .from('storyboards')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Transform data to match frontend expectations
      const transformedData = {
        id: data.id,
        title: data.title,
        original_text: data.original_text,
        storyboard_parts: (data.storyboard_parts || []).map(part => ({
          text: part.text,
          image_prompt: part.imagePrompt,
          section_title: part.sectionTitle,
          image_url: part.imageUrl  // Transform imageUrl to image_url
        })),
        character_id: data.character_id,
        style: data.style,
        user_id: data.user_id,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      return transformedData;
    } catch (error) {
      console.error('Error fetching storyboard:', error);
      throw error;
    }
  }

  static async updateStoryboard(id, updates) {
    try {
      const { data, error } = await supabase
        .from('storyboards')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating storyboard:', error);
      throw error;
    }
  }

  static async deleteStoryboard(id) {
    try {
      const { error } = await supabase
        .from('storyboards')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting storyboard:', error);
      throw error;
    }
  }

  // Characters
  static async createCharacter(data) {
    try {
      const { data: result, error } = await supabase
        .from('characters')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Error creating character:', error);
      throw error;
    }
  }

  static async getCharactersByUser(userId) {
    try {
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching characters:', error);
      throw error;
    }
  }

  static async getCharacterById(id) {
    try {
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching character:', error);
      throw error;
    }
  }

  static async updateCharacter(id, updates) {
    try {
      const { data, error } = await supabase
        .from('characters')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating character:', error);
      throw error;
    }
  }

  static async deleteCharacter(id) {
    try {
      const { error } = await supabase
        .from('characters')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting character:', error);
      throw error;
    }
  }

  // Styling Templates
  static async createStylingTemplate(data) {
    try {
      const { data: result, error } = await supabase
        .from('styling_templates')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Error creating styling template:', error);
      throw error;
    }
  }

  static async getStylingTemplatesByUser(userId) {
    try {
      const { data, error } = await supabase
        .from('styling_templates')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching styling templates:', error);
      throw error;
    }
  }

  static async getStylingTemplateById(id) {
    try {
      const { data, error } = await supabase
        .from('styling_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching styling template:', error);
      throw error;
    }
  }

  static async updateStylingTemplate(id, updates) {
    try {
      const { data, error } = await supabase
        .from('styling_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating styling template:', error);
      throw error;
    }
  }

  static async deleteStylingTemplate(id) {
    try {
      const { error } = await supabase
        .from('styling_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting styling template:', error);
      throw error;
    }
  }

  // User Profiles
  static async createUserProfile(data) {
    try {
      const { data: result, error } = await supabase
        .from('user_profiles')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  static async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  static async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
}

export default DatabaseService;
