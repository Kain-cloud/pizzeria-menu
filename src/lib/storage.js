import { supabase } from './supabase';

const BUCKET = 'menu-images';

/**
 * Upload an image file to Supabase Storage.
 * @returns {string} Public URL of the uploaded image
 */
export async function uploadImage(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  const allowed = ['jpg', 'jpeg', 'png', 'webp', 'avif'];

  if (!allowed.includes(ext)) {
    throw new Error(`File type .${ext} not supported. Use: ${allowed.join(', ')}`);
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image must be under 5 MB');
  }

  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

/**
 * Delete an image from Supabase Storage by its public URL.
 */
export async function deleteImage(publicUrl) {
  if (!publicUrl) return;
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return;
  const path = publicUrl.slice(idx + marker.length);
  await supabase.storage.from(BUCKET).remove([path]);
}
