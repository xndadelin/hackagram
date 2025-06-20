"use client"

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';
import { FollowButton } from '@/components/FollowButton';
import { useGetUser } from '@/utils/queries/getUser';
import { Skeleton } from '@/components/ui/skeleton';

interface FollowListProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  listType: 'followers' | 'following';
  title: string;
}

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

export function FollowListDialog({ open, onOpenChange, userId, listType, title }: FollowListProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: currentUserData } = useGetUser();
  const supabase = createClient();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!userId || !open) return;
      
      setLoading(true);
      try {
        let followerOrFollowingIds: string[] = [];
        
        // First, get the IDs
        if (listType === 'followers') {
          // Get users who follow this user
          const { data: followersData, error: followersError } = await supabase
            .from('followers')
            .select('follower_id')
            .eq('following_id', userId);
            
          if (followersError) throw followersError;
          followerOrFollowingIds = followersData.map(item => item.follower_id);
        } else {
          // Get users this user follows
          const { data: followingData, error: followingError } = await supabase
            .from('followers')
            .select('following_id')
            .eq('follower_id', userId);
            
          if (followingError) throw followingError;
          followerOrFollowingIds = followingData.map(item => item.following_id);
        }
        
        // Then get the profile data for these IDs
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', followerOrFollowingIds);
          
        if (profilesError) throw profilesError;
        
        // Set the profile data directly
        setUsers(profilesData || []);
      } catch (error) {
        console.error(`Error fetching ${listType}:`, error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [userId, listType, open, supabase]);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle>{title}</DialogTitle>
        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="space-y-4 p-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-9 w-20" />
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              {listType === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full overflow-hidden border">
                      <img 
                        src={user.avatar_url || 'https://assets.hackclub.com/flag-standalone.svg'} 
                        alt={user.full_name} 
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://assets.hackclub.com/flag-standalone.svg";
                        }}
                      />
                    </div>
                    <div>
                      <p className="font-medium">{user.full_name}</p>
                    </div>
                  </div>
                  {currentUserData?.user?.id !== user.id && (
                    <FollowButton userId={user.id} size="sm" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
