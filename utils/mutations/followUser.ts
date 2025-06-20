import { createClient } from '@/lib/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface FollowUserParams {
  targetUserId: string;
  action: 'follow' | 'unfollow';
}

export function useFollowUser() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ targetUserId, action }: FollowUserParams): Promise<boolean> => {
      try {
        if (action === 'follow') {
          const currentUserId = await getCurrentUserId();
          const { error } = await supabase
            .from('followers')
            .insert({
              follower_id: currentUserId,
              following_id: targetUserId,
            });

          if (error) {
            console.error('Error following user:', error);
            throw new Error(error.message);
          }
        } else {
          const { error } = await supabase
            .from('followers')
            .delete()
            .match({ 
              follower_id: await getCurrentUserId(),
              following_id: targetUserId 
            });

          if (error) {
            console.error('Error unfollowing user:', error);
            throw new Error(error.message);
          }
        }
        
        return true;
      } catch (error) {
        console.error(`Error ${action === 'follow' ? 'following' : 'unfollowing'} user:`, error);
        throw error;
      }
    },
    
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile', variables.targetUserId] });
      queryClient.invalidateQueries({ queryKey: ['isFollowing', variables.targetUserId] });
    },
  });
}

async function getCurrentUserId(): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  
  if (error || !data?.user) {
    throw new Error('User not authenticated');
  }
  
  return data.user.id;
}
