import { supabase } from '@/lib/supabase';

export const storage = {
  uploadProjectPhoto: async (userId: string, file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('project-photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('project-photos')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  },

  uploadProjectVideo: async (userId: string, file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('project-videos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('project-videos')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  },

  uploadDocument: async (userId: string, file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  },

  deleteFile: async (bucket: string, path: string): Promise<void> => {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
  },

  uploadMultiplePhotos: async (userId: string, files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(file => storage.uploadProjectPhoto(userId, file));
    return Promise.all(uploadPromises);
  },
};
