import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';

export function useIsFollowing(targetUserId: string) {
  const supabase = createClient();
  
  return useQuery({
    queryKey: ['isFollowing', targetUserId],
    queryFn: async (): Promise<boolean> => {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError || !userData?.user) {
          return false;
        }
        
        const currentUserId = userData.user.id;
        
        if (currentUserId === targetUserId) {
          return false;
        }

        const { data, error } = await supabase
          .from('followers')
          .select('id')
          .eq('follower_id', currentUserId)
          .eq('following_id', targetUserId)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error("Error checking follow status:", error);
          return false;
        }
        
        return !!data;
      } catch (error) {
        console.error("Error checking follow status:", error);
        return false;
      }
    },
    
    staleTime: 1000 * 60 * 5
  });
}
