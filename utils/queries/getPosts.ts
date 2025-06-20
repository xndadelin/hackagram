import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';

export interface PostType {
  id: string;
  user_id: string;
  caption?: string;
  created_at: string;
  files?: string[];
  fileUrls?: string[];
  liked?: boolean;
  likeCount?: number;
  likes?: string[];
  saved?: boolean;
  commentsCount?: number;
  profiles?: {
    full_name?: string; 
    avatar_url?: string;
  };
}

export interface ProfileDetails {
  full_name: string;
  avatar_url: string | null;
}

const transformPostData = (
  post: any, 
  currentUserId: string | undefined, 
  profileDetails?: ProfileDetails
) => {
  const fileUrls = post.files?.map((file: string) => 
    createClient().storage.from('posts').getPublicUrl(file).data.publicUrl
  ) || [];
  
  const postLikes = post.likes || [];
  const liked = currentUserId ? postLikes.includes(currentUserId) : false;
  
  return {
    ...post,
    fileUrls,
    liked,
    likeCount: postLikes.length || 0,
    profiles: profileDetails || post.profiles
  };
};

export const usePosts = (userId?: string) => {
  const supabase = createClient();
  
  return useQuery({
    queryKey: ['posts', userId],
    queryFn: async (): Promise<PostType[]> => {
      try {
        let query = supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (userId) {
          query = query.eq('user_id', userId);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        const userData = await supabase.auth.getUser();
        const currentUserId = userData.data.user?.id;
        
        const transformedPosts = data.map(post => 
          transformPostData(post, currentUserId, {
            full_name: userData.data.user?.user_metadata?.full_name,
            avatar_url: userData.data.user?.user_metadata?.avatar_url
          })
        );
        
        return transformedPosts || [];
      } catch (error) {
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useProfilePosts = (profileId: string, currentUserId?: string) => {
  const supabase = createClient();
  
  return useQuery({
    queryKey: ['profilePosts', profileId, currentUserId],
    queryFn: async (): Promise<PostType[]> => {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profileId)
          .single();
          
        if (profileError) {
          return [];
        }
        
        const { data: postsData, error: postsError } = await supabase
          .from("posts")
          .select("*")
          .eq("user_id", profileId)
          .order("created_at", { ascending: false });
          
        if (postsError) {
          return [];
        }

        const postIds = postsData.map(post => post.id);
        const { data: commentsData } = await supabase
          .from('comments')
          .select('post_id')
          .in('post_id', postIds);
          
        const commentCounts: Record<string, number> = {};
        if (commentsData) {
          commentsData.forEach((comment: { post_id: string }) => {
            commentCounts[comment.post_id] = (commentCounts[comment.post_id] || 0) + 1;
          });
        }
        
        const profileDetails = {
          full_name: profileData?.full_name,
          avatar_url: profileData?.avatar_url
        };

        return postsData.map(post => {
          const transformedPost = transformPostData(post, currentUserId, profileDetails);
          return {
            ...transformedPost,
            commentsCount: commentCounts[post.id] || 0
          };
        }) || [];
      } catch (error) {
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};