import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create Supabase client with fallback for development
let supabase = null

try {
  if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://your-project.supabase.co') {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  } else {
    console.log('⚠️  Supabase not configured - running in development mode without database')
  }
} catch (error) {
  console.log('⚠️  Supabase connection failed - running in development mode without database')
}

export { supabase }

// Auth helper functions
export const auth = {
  // Sign up with email and password
  signUp: async (email, password) => {
    if (!supabase) {
      return { data: { user: { id: 'dev-user', email } }, error: null }
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  },

  // Sign in with email and password
  signIn: async (email, password) => {
    if (!supabase) {
      return { data: { user: { id: 'dev-user', email } }, error: null }
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  // Sign out
  signOut: async () => {
    if (!supabase) {
      return { error: null }
    }
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  getCurrentUser: async () => {
    if (!supabase) {
      return { user: { id: 'dev-user', email: 'dev@example.com' }, error: null }
    }
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Listen to auth changes
  onAuthStateChange: (callback) => {
    if (!supabase) {
      return { data: { subscription: { unsubscribe: () => {} } } }
    }
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database helper functions
export const db = {
  // Characters
  characters: {
    getAll: async (userId) => {
      if (!supabase) {
        return { data: [], error: null }
      }
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      return { data, error }
    },

    getById: async (id) => {
      if (!supabase) {
        return { data: null, error: null }
      }
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('id', id)
        .single()
      return { data, error }
    },

    create: async (characterData) => {
      if (!supabase) {
        return { data: { id: Date.now(), ...characterData }, error: null }
      }
      const { data, error } = await supabase
        .from('characters')
        .insert([characterData])
        .select()
        .single()
      return { data, error }
    },

    update: async (id, updates) => {
      if (!supabase) {
        return { data: { id, ...updates }, error: null }
      }
      const { data, error } = await supabase
        .from('characters')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      return { data, error }
    },

    delete: async (id) => {
      if (!supabase) {
        return { error: null }
      }
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
      if (!supabase) {
        return { data: [], error: null }
      }
      const { data, error } = await supabase
        .from('storyboards')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      return { data, error }
    },

    getById: async (id) => {
      if (!supabase) {
        return { data: null, error: null }
      }
      const { data, error } = await supabase
        .from('storyboards')
        .select('*')
        .eq('id', id)
        .single()
      return { data, error }
    },

    create: async (storyboardData) => {
      if (!supabase) {
        return { data: { id: Date.now(), ...storyboardData }, error: null }
      }
      const { data, error } = await supabase
        .from('storyboards')
        .insert([storyboardData])
        .select()
        .single()
      return { data, error }
    },

    update: async (id, updates) => {
      if (!supabase) {
        return { data: { id, ...updates }, error: null }
      }
      const { data, error } = await supabase
        .from('storyboards')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      return { data, error }
    },

    delete: async (id) => {
      if (!supabase) {
        return { error: null }
      }
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
      if (!supabase) {
        return { data: [], error: null }
      }
      const { data, error } = await supabase
        .from('styling_templates')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      return { data, error }
    },

    getById: async (id) => {
      if (!supabase) {
        return { data: null, error: null }
      }
      const { data, error } = await supabase
        .from('styling_templates')
        .select('*')
        .eq('id', id)
        .single()
      return { data, error }
    },

    create: async (templateData) => {
      if (!supabase) {
        return { data: { id: Date.now(), ...templateData }, error: null }
      }
      const { data, error } = await supabase
        .from('styling_templates')
        .insert([templateData])
        .select()
        .single()
      return { data, error }
    },

    update: async (id, updates) => {
      if (!supabase) {
        return { data: { id, ...updates }, error: null }
      }
      const { data, error } = await supabase
        .from('styling_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      return { data, error }
    },

    delete: async (id) => {
      if (!supabase) {
        return { error: null }
      }
      const { error } = await supabase
        .from('styling_templates')
        .delete()
        .eq('id', id)
      return { error }
    }
  }
}

export default supabase
