import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helper functions
export const auth = {
  // Sign up with email and password
  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  },

  // Sign in with email and password
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Listen to auth changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

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

export default supabase
