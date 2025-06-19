import { createClient } from '@/lib/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface SavePostParams {
  postId: string;
  userId: string;
  isSaved: boolean;
}

export const useSavePost = () => {
  const queryClient = useQueryClient();
  const supabase = createClient();
  
  return useMutation({
    mutationFn: async ({ postId, userId, isSaved }: SavePostParams) => {
      const { data: profile, error: fetchError } = await supabase
        .from("profiles")
        .select("saved_posts")
        .eq("id", userId)
        .single();
        
      if (fetchError) {
        throw fetchError;
      }
      
      let updatedSavedPosts = [...(profile.saved_posts || [])];
      
      if (isSaved) {
        if (!updatedSavedPosts.includes(postId)) {
          updatedSavedPosts.push(postId);
        }
      } else {
        updatedSavedPosts = updatedSavedPosts.filter(id => id !== postId);
      }
      
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ saved_posts: updatedSavedPosts })
        .eq("id", userId);
        
      if (updateError) {
        throw updateError;
      }
      
      return { postId, saved_posts: updatedSavedPosts, isSaved };
    },
    
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['savedPosts', variables.userId] });
      
      queryClient.setQueriesData({ queryKey: ['posts'] }, (oldData: any) => {
        if (!oldData) return oldData;
        
        if (Array.isArray(oldData)) {
          return oldData.map((post: any) => {
            if (post.id === data.postId) {
              return { ...post, saved: data.isSaved };
            }
            return post;
          });
        }
        
        return oldData;
      });
      
      queryClient.setQueriesData({ queryKey: ['profilePosts'] }, (oldData: any) => {
        if (!oldData) return oldData;
        
        if (Array.isArray(oldData)) {
          return oldData.map((post: any) => {
            if (post.id === data.postId) {
              return { ...post, saved: data.isSaved };
            }
            return post;
          });
        }
        
        return oldData;
      });
    }
  });
};
