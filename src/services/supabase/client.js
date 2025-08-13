import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test connection function
export const testConnection = async () => {
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