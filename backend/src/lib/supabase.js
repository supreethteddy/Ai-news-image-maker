import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Create Supabase client with service role key for backend operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Database helper functions
export const db = {
  // Characters
  characters: {
    getAll: async (userId) => {
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      return { data, error }
    },

    getById: async (id) => {
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('id', id)
        .single()
      return { data, error }
    },

    create: async (characterData) => {
      const { data, error } = await supabase
        .from('characters')
        .insert([characterData])
        .select()
        .single()
      return { data, error }
    },

    update: async (id, updates) => {
      const { data, error } = await supabase
        .from('characters')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      return { data, error }
    },

    delete: async (id) => {
      const { error } = await supabase
        .from('characters')
        .delete()
        .eq('id', id)
      return { error }
    }
  },

  // Storyboards
  storyboards: {
    getAll: async (userId) => {
      const { data, error } = await supabase
        .from('storyboards')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      return { data, error }
    },

    getById: async (id) => {
      const { data, error } = await supabase
        .from('storyboards')
        .select('*')
        .eq('id', id)
        .single()
      return { data, error }
    },

    create: async (storyboardData) => {
      const { data, error } = await supabase
        .from('storyboards')
        .insert([storyboardData])
        .select()
        .single()
      return { data, error }
    },

    update: async (id, updates) => {
      const { data, error } = await supabase
        .from('storyboards')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      return { data, error }
    },

    delete: async (id) => {
      const { error } = await supabase
        .from('storyboards')
        .delete()
        .eq('id', id)
      return { error }
    }
  },

  // Styling Templates
  stylingTemplates: {
    getAll: async (userId) => {
      const { data, error } = await supabase
        .from('styling_templates')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      return { data, error }
    },

    getById: async (id) => {
      const { data, error } = await supabase
        .from('styling_templates')
        .select('*')
        .eq('id', id)
        .single()
      return { data, error }
    },

    create: async (templateData) => {
      const { data, error } = await supabase
        .from('styling_templates')
        .insert([templateData])
        .select()
        .single()
      return { data, error }
    },

    update: async (id, updates) => {
      const { data, error } = await supabase
        .from('styling_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      return { data, error }
    },

    delete: async (id) => {
      const { error } = await supabase
        .from('styling_templates')
        .delete()
        .eq('id', id)
      return { error }
    }
  }
}

// Auth helper functions for backend
export const auth = {
  // Verify JWT token from Supabase
  verifyToken: async (token) => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token)
      if (error) throw error
      return { user, error: null }
    } catch (error) {
      return { user: null, error }
    }
  }
}

export default supabase
