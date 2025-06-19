import { createClient } from '@/lib/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface LikePostParams {
  postId: string;
  userId: string;
  isLiked: boolean;
}

export const useLikePost = () => {
  const queryClient = useQueryClient();
  const supabase = createClient();
  
  return useMutation({
    mutationFn: async ({ postId, userId, isLiked }: LikePostParams) => {
      const { data: post, error: fetchError } = await supabase
        .from("posts")
        .select("likes")
        .eq("id", postId)
        .single();
        
      if (fetchError) {
        throw fetchError;
      }
      
      let updatedLikes = [...(post.likes || [])];
      
      if (isLiked) {
        if (!updatedLikes.includes(userId)) {
          updatedLikes.push(userId);
        }
      } else {
        updatedLikes = updatedLikes.filter(id => id !== userId);
      }
      
      const { error: updateError } = await supabase
        .from("posts")
        .update({ likes: updatedLikes })
        .eq("id", postId);
        
      if (updateError) {
        throw updateError;
      }
      
      return { postId, likes: updatedLikes, isLiked };
    },
    
    onSuccess: (data, variables) => {
      // Invalidate all query keys that might contain this post
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      
      // Specific invalidation for the profile posts - this includes the userId now
      queryClient.invalidateQueries({
        queryKey: ['profilePosts'],
        exact: false, 
        refetchType: 'all'
      });
      
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['savedPosts'] });
      
      // Optimistically update any posts in the cache
      queryClient.setQueriesData({ queryKey: ['posts'] }, (oldData: any) => {
        if (!oldData) return oldData;
        
        if (Array.isArray(oldData)) {
          return oldData.map((post: any) => {
            if (post.id === data.postId) {
              return { 
                ...post, 
                likes: data.likes,
                liked: data.isLiked,
                likeCount: data.likes.length
              };
            }
            return post;
          });
        }
        
        return oldData;
      });
      
      // Update profile posts cache for any queryKey that starts with profilePosts
      queryClient.setQueriesData({ predicate: (query) => {
        return Array.isArray(query.queryKey) && query.queryKey[0] === 'profilePosts';
      }}, (oldData: any) => {
        if (!oldData) return oldData;
        
        if (Array.isArray(oldData)) {
          return oldData.map((post: any) => {
            if (post.id === data.postId) {
              return { 
                ...post, 
                likes: data.likes,
                liked: data.isLiked,
                likeCount: data.likes.length
              };
            }
            return post;
          });
        }
        
        return oldData;
      });
      
      // Update saved posts cache
      queryClient.setQueriesData({ queryKey: ['savedPosts'] }, (oldData: any) => {
        if (!oldData) return oldData;
        
        if (Array.isArray(oldData)) {
          return oldData.map((post: any) => {
            if (post.id === data.postId) {
              return { 
                ...post, 
                likes: data.likes,
                liked: data.isLiked,
                likeCount: data.likes.length
              };
            }
            return post;
          });
        }
        
        return oldData;
      });
    }
  });
};
