import { createClient } from '@supabase/supabase-js'

const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (typeof process !== 'undefined' ? process.env : {})
const supabaseUrl = env?.VITE_SUPABASE_URL
const supabaseAnonKey = env?.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null

// Test connection function (safe if not configured)
export const testConnection = async () => {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase is not configured' }
  }
  try {
    const { data, error } = await supabase.from('_test_connection').select('*').limit(1)
    
    if (error && error.code === 'PGRST116') {
      // Table doesn't exist, but connection works
      return { success: true, message: 'Connection successful! Ready to create tables.' }
    } else if (error) {
      return { success: false, error: error.message }
    } else {
      return { success: true, message: 'Connection successful!', data }
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}