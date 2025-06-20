"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useFollowUser } from '@/utils/mutations/followUser';
import { useIsFollowing } from '@/utils/queries/getFollowStatus';
import { useGetUser } from '@/utils/queries/getUser';

interface FollowButtonProps {
  userId: string;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function FollowButton({ userId, variant = 'default', size = 'default', className = '' }: FollowButtonProps) {
  const { data: userData } = useGetUser();
  const { data: isFollowing, isLoading: isCheckingFollow } = useIsFollowing(userId);
  const { mutate: followUser, isPending } = useFollowUser();
  const [optimisticIsFollowing, setOptimisticIsFollowing] = useState(false);
  
  const effectiveIsFollowing = optimisticIsFollowing || isFollowing || false;
  
  const handleFollowAction = () => {
    if (!userData?.user || userData?.user?.id === userId) return;
    
    setOptimisticIsFollowing(!effectiveIsFollowing);
    
    followUser({
      targetUserId: userId,
      action: effectiveIsFollowing ? 'unfollow' : 'follow',
    }, {
      onError: () => {
        setOptimisticIsFollowing(!!effectiveIsFollowing);
      }
    });
  };
  
  if (userData?.user?.id === userId) {
    return null;
  }
  
  return (
    <Button
      onClick={handleFollowAction}
      disabled={isPending || isCheckingFollow || !userData?.user}
      variant={effectiveIsFollowing ? 'outline' : variant}
      size={size}
      className={className}
    >
      {isPending ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : null}
      {effectiveIsFollowing ? 'Following' : 'Follow'}
    </Button>
  );
}
