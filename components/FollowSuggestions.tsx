"use client"

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useGetUser } from '@/utils/queries/getUser';
import { FollowButton } from '@/components/FollowButton';
import { Skeleton } from '@/components/ui/skeleton';

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

export function FollowSuggestions() {
  const [suggestions, setSuggestions] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: currentUserData } = useGetUser();
  const supabase = createClient();
  
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!currentUserData?.user?.id) return;
      
      try {
        setLoading(true);
        
        const { data: followingData } = await supabase
          .from('followers')
          .select('following_id')
          .eq('follower_id', currentUserData.user.id);
          
        const followingIds = followingData 
          ? followingData.map(item => item.following_id) 
          : [];
        
        const excludedIds = [...followingIds, currentUserData.user.id];
        // Modified query to work with the current database structure
        const { data: profilesData, error } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .not('id', 'in', `(${excludedIds.join(',')})`)
          .limit(5);
        
        if (error) {
          throw error;
        }
        
        setSuggestions(profilesData || []);
      } catch (error) {
        console.error('Error fetching follow suggestions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUserData?.user) {
      fetchSuggestions();
    }
  }, [currentUserData?.user?.id, supabase]);
  
  if (loading) {
    return (
      <div className="p-4 space-y-3">
        <h3 className="text-sm font-medium">Suggested for you</h3>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8">
                <Skeleton className="w-full h-full rounded-full" />
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
    );
  }
  
  if (!suggestions.length) {
    return null;
  }
  
  return (
    <div className="p-4 space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-muted-foreground">Suggested for you</h3>
        {suggestions.length > 5 && <span className="text-xs text-[#ec3750]">See All</span>}
      </div>
      
      {suggestions.map(user => (
        <div key={user.id} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <a href={`/profile/${user.id}`} className="block">
              <div className="w-8 h-8 rounded-full overflow-hidden border">
                <img
                  src={user.avatar_url || "https://assets.hackclub.com/flag-standalone.svg"}
                  alt={user.full_name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://assets.hackclub.com/flag-standalone.svg";
                  }}
                />
              </div>
            </a>
            <a href={`/profile/${user.id}`} className="block">
              <span className="text-sm font-medium">{user.full_name}</span>
            </a>
          </div>
          <FollowButton userId={user.id} size="sm" />
        </div>
      ))}
    </div>
  );
}
