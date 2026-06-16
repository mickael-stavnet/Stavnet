import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function testConnection() {
  console.log('Testing Supabase connection...');
  console.log('URL:', supabaseUrl ? 'Found' : 'Missing');
  console.log('Key:', supabaseAnonKey ? 'Found' : 'Missing');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing environment variables');
    process.exit(1);
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/data-organism`, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Range': '0-0',
        'Range-Unit': 'items'
      }
    });

    const status = response.status;
    const body = await response.text();

    if (status >= 200 && status < 300) {
      console.log('Successfully connected to Supabase REST API.');
      console.log('Status:', status);
    } else {
      console.error('Supabase API error:', status, body);
      process.exit(1);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

testConnection();
