import { createClient } from './client';

export async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Check environment variables
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('Supabase URL:', url ? 'Set' : 'Missing');
    console.log('Supabase Key:', key ? 'Set' : 'Missing');
    
    if (!url || !key) {
      throw new Error('Missing environment variables. Please check your .env.local file.');
    }
    
    const supabase = createClient();
    
    // Test basic connection
    const { data, error } = await supabase
      .from('apartments')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Supabase connection successful!');
    return { success: true, data };
    
  } catch (error) {
    console.error('Connection test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
