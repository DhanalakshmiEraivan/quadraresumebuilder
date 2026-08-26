import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});


export const RESUME_ASSET_BUCKET = 'resume-assets';

export async function uploadResumePhoto(userId: string, resumeId: string, file: File) {
  const extension = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const path = `${userId}/${resumeId}/profile-${Date.now()}.${extension || 'jpg'}`;
  const { error } = await supabase.storage.from(RESUME_ASSET_BUCKET).upload(path, file, {
    cacheControl: '3600', upsert: false, contentType: file.type || 'image/jpeg',
  });
  if (!error) {
    const { data, error: signedError } = await supabase.storage.from(RESUME_ASSET_BUCKET).createSignedUrl(path, 60 * 60 * 24 * 7);
    if (!signedError && data?.signedUrl) return { path, signedUrl: data.signedUrl };
  }

  // Graceful fallback for projects whose Supabase migrations have not yet been
  // applied. The editor remains functional and the data is still saved with
  // the resume. Once the storage bucket exists, the normal private upload path
  // is used automatically.
  if (error?.message?.toLowerCase().includes('bucket not found') || error?.message?.toLowerCase().includes('not found')) {
    const signedUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Could not read profile photo.'));
      reader.readAsDataURL(file);
    });
    return { path: signedUrl, signedUrl };
  }
  throw error || new Error('Profile photo upload failed.');
}

export async function getResumePhotoUrl(path?: string) {
  if (!path) return '';
  if (path.startsWith('data:image/')) return path;
  const { data, error } = await supabase.storage.from(RESUME_ASSET_BUCKET).createSignedUrl(path, 60 * 60 * 24 * 7);
  if (error) return '';
  return data.signedUrl;
}

export async function removeResumePhoto(path?: string) {
  if (!path || path.startsWith('data:image/')) return;
  await supabase.storage.from(RESUME_ASSET_BUCKET).remove([path]);
}
