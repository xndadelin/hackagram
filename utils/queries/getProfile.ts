import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';

export interface ProfileData {
  id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string;
  website: string;
  saved_posts: string[];
  post_count: number;
  saved_count: number;
}

export const useProfile = (userId: string) => {
  const supabase = createClient();
  
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async (): Promise<ProfileData | null> => {
      try {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (userError) {
          console.error("Error fetching user:", userError);
          return null;
        }
        
        const { data: postsData, error: postsError } = await supabase
          .from("posts")
          .select("id")
          .eq("user_id", userId);
          
        if (postsError) {
          console.error("Error fetching posts count:", postsError);
        }

        return {
          id: userData.id,
          full_name: userData?.full_name || 'User',
          avatar_url: userData?.avatar_url,
          bio: userData?.bio || "",
          website: userData?.website || "",
          saved_posts: userData?.saved_posts || [],
          post_count: postsData?.length || 0,
          saved_count: userData?.saved_posts?.length || 0
        };
      } catch (error) {
        console.error("Error loading profile:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};