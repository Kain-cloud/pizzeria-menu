import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setup() {
  const categories = [
    { id: 'pizza', sort_order: 1, emoji: '🍕' },
    { id: 'pasta', sort_order: 2, emoji: '🍝' },
    { id: 'rizoto', sort_order: 3, emoji: '🍚' },
    { id: 'krepa', sort_order: 4, emoji: '🥞' },
    { id: 'salads', sort_order: 5, emoji: '🥗' },
    { id: 'drinks', sort_order: 6, emoji: '🥤' },
  ];

  for (const cat of categories) {
    const { error } = await supabase.from('categories').upsert(cat);
    if (error) console.error(`Error upserting ${cat.id}:`, error.message);
  }
  console.log('Categories created successfully!');
}

setup();
