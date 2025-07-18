"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { MessageCircle, Settings, Grid3X3, Users } from "lucide-react";
import { useGetUser } from "@/utils/queries/getUser";
import { useLikePost } from "@/utils/mutations/likePost";
import { useProfile } from "@/utils/queries/getProfile";
import { useProfilePosts } from "@/utils/queries/getPosts";
import { HeartButton } from "@/components/HeartButton";
import { PostDialog } from "@/components/PostDialog";
import { ImageCarousel } from "@/components/ImageCarousel";
import { FollowButton } from "@/components/FollowButton";
import { FollowListDialog } from "@/components/FollowListDialog";
import Link from "next/link";


export default function UserProfile() {
  const { userId } = useParams();
  const profileId = Array.isArray(userId) ? userId[0] : userId as string;
  const { data: currentUserData } = useGetUser();
  const { data: profileData, isLoading: isProfileLoading } = useProfile(profileId);
  const { data: profilePosts = [], isLoading: isProfilePostsLoading } = useProfilePosts(
    profileId, 
    currentUserData?.user?.id
  );
  
  const [openPostId, setOpenPostId] = useState<string | null>(null);
  const [followDialogOpen, setFollowDialogOpen] = useState(false);
  const [followDialogType, setFollowDialogType] = useState<'followers' | 'following'>('followers');
  
  const loading = isProfileLoading || isProfilePostsLoading;
  
  const likePostMutation = useLikePost();
  
  const handleLike = async (postId: string, liked: boolean) => {
    if (!currentUserData?.user?.id) return;
    
    try {
      await likePostMutation.mutateAsync({
        postId,
        userId: currentUserData.user.id,
        isLiked: liked
      });
      
    } catch (error) {
      
    }
  };
  
  if (loading) {
    return (
      <SidebarProvider>
        <div className="grid grid-cols-[auto_1fr] w-full min-h-screen">
          <AppSidebar />
          <main className="flex flex-col items-center p-6">
            <div className="w-full max-w-4xl flex items-center mb-6 gap-2">
              <SidebarTrigger />
              <div className="h-5 w-px bg-border" />
              <h1 className="text-xl font-medium">Profile</h1>
            </div>
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ec3750]"></div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }
  
  if (!profileData) {
    return (
      <SidebarProvider>
        <div className="grid grid-cols-[auto_1fr] w-full min-h-screen">
          <AppSidebar />
          <main className="flex flex-col items-center p-6">
            <div className="w-full max-w-4xl flex items-center mb-6 gap-2">
              <SidebarTrigger />
              <div className="h-5 w-px bg-border" />
              <h1 className="text-xl font-medium">Profile</h1>
            </div>
            <div className="text-center py-12">
              <p className="text-muted-foreground">User not found</p>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }
  
  return (
    <SidebarProvider>
      <div className="grid grid-cols-[auto_1fr] w-full min-h-screen">
        <AppSidebar />
        <main className="flex flex-col items-center p-6">
          <div className="w-full max-w-4xl flex items-center mb-6 gap-2">
            <SidebarTrigger />
            <div className="h-5 w-px bg-border" />
            <h1 className="text-xl font-medium">Profile</h1>
          </div>
          
          <div className="w-full max-w-4xl">
            <div className="mb-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 mb-6">
                <div className="w-24 h-24 md:w-36 md:h-36 rounded-full overflow-hidden border-2 border-border">
                  <img 
                    src={profileData.avatar_url || "https://assets.hackclub.com/flag-standalone.svg"} 
                    alt={`${profileData.full_name}'s avatar`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://assets.hackclub.com/flag-standalone.svg";
                    }}
                  />
                </div>
                
                <div className="flex-1 space-y-4 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <h2 className="text-xl md:text-2xl font-bold">{profileData.full_name}</h2>
                    {profileData.id === currentUserData?.user?.id ? (
                      <Link href="/profile/settings">
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          <span>Edit Profile</span>
                        </Button>
                      </Link>
                    ) : (
                      <div className="flex gap-2">
                        <FollowButton userId={profileData.id} />
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4" />
                          <span>Message</span>
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-2 md:gap-6">
                    <p><span className="font-semibold">{profileData.post_count}</span> posts</p>
                    <button 
                      className="hover:underline"
                      onClick={() => {
                        setFollowDialogType('followers');
                        setFollowDialogOpen(true);
                      }}
                    >
                      <span className="font-semibold">{profileData.followers_count}</span> followers
                    </button>
                    <button 
                      className="hover:underline"
                      onClick={() => {
                        setFollowDialogType('following');
                        setFollowDialogOpen(true);
                      }}
                    >
                      <span className="font-semibold">{profileData.following_count}</span> following
                    </button>
                  </div>
                  
                  {profileData.bio && (
                    <p className="max-w-md">{profileData.bio}</p>
                  )}
                  
                  {profileData.website && (
                    <a 
                      href={profileData.website.startsWith('http') ? profileData.website : `https://${profileData.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#ec3750] hover:underline block"
                    >
                      {profileData.website.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </div>
              </div>
            </div>
            
            <div className="border-t">
              <div className="flex flex-col">
                <div className="flex">
                  <div className="flex items-center gap-2 py-3 px-6 border-t-2 border-[#ec3750] text-foreground font-medium">
                    <Grid3X3 className="h-4 w-4" />
                    <span>Posts</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground px-6 py-1">
                  <span>Click on any post to view details</span>
                </div>
              </div>
            </div>
            
            {profilePosts.length > 0 ? (
                  <div className="grid grid-cols-3 gap-1 md:gap-4 mt-4">
                    {profilePosts.map(post => (
                        <div key={post.id} className="aspect-square bg-muted relative group overflow-hidden cursor-pointer">
                          <PostDialog 
                            post={post} 
                            onLikeToggle={handleLike}
                            open={openPostId === post.id}
                            onOpenChange={(isOpen) => setOpenPostId(isOpen ? post.id : null)}
                          >
                            <div 
                              className="w-full h-full aspect-square overflow-hidden"
                              onClick={() => setOpenPostId(post.id)}
                            >
                              {post.fileUrls && post.fileUrls.length > 0 ? (
                                <ImageCarousel 
                                  images={post.fileUrls}
                                  aspectRatio="square"
                                  cropMode="cover"
                                />
                              ) : (
                                <img 
                                  src="https://assets.hackclub.com/flag-standalone.svg"
                                  alt="Post" 
                                  className="w-full h-full object-contain p-4"
                                />
                              )}
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4 text-white">
                                <div className="flex items-center">                            
                                  <HeartButton 
                                    size={20} 
                                    initialState={!!post.liked}
                                    enableDoubleClick={false}
                                    onToggle={(isLiked) => {
                                      if (event) event.stopPropagation();
                                      handleLike(post.id, isLiked);
                                    }}
                                    key={`heart-${post.id}-${String(post.liked)}-${Date.now()}`} 
                                  />
                                  <span className="ml-1">{post.likeCount}</span>
                                </div>
                                <div 
                                  className="flex items-center cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenPostId(post.id);
                                  }}
                                >
                                  <MessageCircle className="h-5 w-5" />
                                  <span className="ml-1">{post.commentsCount || 0}</span>
                                </div>
                              </div>
                            </div>
                          </PostDialog>
                        </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 opacity-50">
                      <img 
                        src="https://assets.hackclub.com/flag-standalone.svg"
                        alt="Hack Club" 
                        className="w-full h-full"
                      />
                    </div>
                    <p className="text-muted-foreground">No posts yet</p>
                  </div>
                )}
          </div>
        </main>
        
        <FollowListDialog 
          open={followDialogOpen}
          onOpenChange={setFollowDialogOpen}
          userId={profileId}
          listType={followDialogType}
          title={followDialogType === 'followers' ? 'Followers' : 'Following'}
        />
      </div>
    </SidebarProvider>
  );
}
