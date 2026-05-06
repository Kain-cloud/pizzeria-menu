import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zzubgipqgqqckcsriuti.supabase.co';
const supabaseKey = 'sb_publishable_RKzdrHYI8F8HLLrMA0lYAA_yOJrXYlO';
const supabase = createClient(supabaseUrl, supabaseKey);

async function setup() {
  const categories = [
    { id: 'pizza', sort_order: 1 },
    { id: 'pasta', sort_order: 2 },
    { id: 'rizoto', sort_order: 3 },
    { id: 'krepa', sort_order: 4 },
    { id: 'salads', sort_order: 5 },
    { id: 'drinks', sort_order: 6 }
  ];

  for (const cat of categories) {
    await supabase.from('categories').upsert(cat);
  }
  console.log('Categories created successfully!');
}

setup();
