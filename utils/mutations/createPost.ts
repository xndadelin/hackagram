import { createClient } from '@/lib/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CreatePostParams {
  userId: string;
  caption: string;
  files: File[];
}

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  const supabase = createClient();
  
  return useMutation({
    mutationFn: async ({ userId, caption, files }: CreatePostParams) => {
      const fileNames: string[] = [];

      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('posts')
          .upload(filePath, file);
          
        if (uploadError) {
          throw uploadError;
        }
        
        fileNames.push(filePath);
      }
      
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: userId,
          caption,
          files: fileNames,
          likes: [],
          created_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (postError) {
        throw postError;
      }
      
      return post;
    },
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['profilePosts'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });
};
