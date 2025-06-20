"use client";
import { Button } from '@/components/ui/button';
import { useSlackAuth } from '@/utils/oauth/slack';
import { useGetUser } from '@/utils/queries/getUser';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { MessageCircle, Bookmark, Share2, MoreHorizontal, Heart } from "lucide-react";
import { Post } from '@/components/Post';
import { PostDialog } from '@/components/PostDialog';
import { HeartButton } from '@/components/HeartButton';
import { ImageCarousel } from '@/components/ImageCarousel';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function Home() {
  const { signInWithSlack } = useSlackAuth();
  const { data: userData, isLoading } = useGetUser();
  type PostType = {
    id: string;
    user_id: string;
    caption?: string;
    created_at: string;
    files?: string[];
    fileUrls?: string[];
    liked?: boolean;
    likeCount?: number;
    likes?: string[];
    commentsCount?: number;
    profiles?: {
      full_name?: string; 
      avatar_url?: string;
    };
  };

  const [posts, setPosts] = useState<PostType[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [activeDoubleTapPostId, setActiveDoubleTapPostId] = useState<string | null>(null);
  
  const supabase = createClient();
  
  useEffect(() => {
    if (userData?.user) {
      const fetchPosts = async () => {
        setLoadingPosts(true);
        try {
          const { data, error } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });
            
          if (error) throw error;

          const filteredPosts = data.filter(post => {
            return post.user_id === userData.user?.id;
          });

          const { data: commentsData, error: commentsError } = await supabase
            .from('comments')
            .select('post_id')
            .in('post_id', filteredPosts.map(post => post.id));

          const commentCounts: Record<string, number> = {};
          if (commentsData) {
            commentsData.forEach((comment: { post_id: string }) => {
              commentCounts[comment.post_id] = (commentCounts[comment.post_id] || 0) + 1;
            });
          }
          
            
          const transformedPosts = filteredPosts.map(post => {
            const fileUrls: string[] = post.files?.map((file: string) => 
              supabase.storage.from('posts').getPublicUrl(file).data.publicUrl
            ) || [];

            const liked = post.likes?.includes(userData.user?.id) || false;
            
            return {
              ...post,
              fileUrls,
              liked,
              likeCount: post.likes?.length || 0,
              profiles: {
                full_name: userData.user?.user_metadata?.full_name,
                avatar_url: userData.user?.user_metadata?.avatar_url
              },
              commentsCount: commentCounts[post.id] || 0
            };
          });
          
          setPosts(transformedPosts || []);
        } catch (error) {

        } finally {
          setLoadingPosts(false);
        }
      };
      
      fetchPosts();
    }
  }, [userData?.user]);
  
  const { Loading } = require('@/components/Loading');

  const handleLike = async (postId: string, liked: boolean) => {
    if (!userData?.user?.id) return;
    
    try {
      const postIndex = posts.findIndex(post => post.id === postId);
      if (postIndex === -1) return;
      
      const post = posts[postIndex];
      const userId = userData.user.id;
      
      let updatedLikes = [...(post.likes || [])];
      
      if (liked) {
        if (!updatedLikes.includes(userId)) {
          updatedLikes.push(userId);
        }
      } else {
        updatedLikes = updatedLikes.filter(id => id !== userId);
      }

      await supabase
        .from('posts')
        .update({ likes: updatedLikes })
        .eq('id', postId);
      
      
      const newPosts = [...posts];
      newPosts[postIndex] = {
        ...post,
        likes: updatedLikes,
        liked: liked,
        likeCount: updatedLikes.length
      };
      
      setPosts(newPosts);
      
    } catch (error) {
      
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loading text="Hackagram" />
      </div>  
    );
  }
  
  if (userData?.user) {
    return (
      <SidebarProvider>
        <div className="grid grid-cols-[auto_1fr] w-full min-h-screen">
          <AppSidebar />
          <main className="flex flex-col items-center p-6">
            <div className="w-full max-w-xl flex items-center mb-3 gap-2">
              <SidebarTrigger />
              <div className="h-5 w-px bg-border" />
              <h1 className="text-xl font-medium">Hackagram</h1>
            </div>
            
            <div className="w-full max-w-xl text-center mb-4">
              <div className="text-xs text-muted-foreground">
                <span>Pro tip: Double-click on any image to like it!</span>
              </div>
            </div>
            
            <div className="w-full max-w-xl">
              <div className="space-y-6">
                {loadingPosts ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ec3750]"></div>
                  </div>
                ) : posts.length > 0 ? (
                  posts.map((post) => (
                    <div key={post.id} className="bg-card rounded-lg overflow-hidden border">
                      <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 border rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold">
                              <a href={`/profile/${post.user_id}`}>
                                <img
                                  src={post.profiles?.avatar_url || 'https://assets.hackclub.com/flag-standalone.svg'}
                                  alt="User avatar"
                                  className="w-full h-full rounded-full object-cover"
                                />
                              </a>
                            </span>
                          </div>
                          <div>
                            <a href={`/profile/${post.user_id}`} className="hover:underline">
                              <p className="font-medium text-sm">
                                {post.profiles?.full_name}
                              </p>
                            </a>
                            <p className="text-xs text-muted-foreground">Hack Club Member</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </div>
                      
                      <div className="aspect-square bg-muted flex items-center justify-center relative">
                        {post.fileUrls && post.fileUrls.length > 0 ? (
                          <ImageCarousel 
                            images={post.fileUrls}
                            aspectRatio="square"
                            cropMode="cover"
                            onImageDoubleClick={() => {
                              if (!post.liked) {
                                handleLike(post.id, true);
                                setActiveDoubleTapPostId(post.id);
                                setTimeout(() => setActiveDoubleTapPostId(null), 1000);
                              }
                            }}
                            showLikeAnimation={activeDoubleTapPostId === post.id}
                          />
                        ) : (
                          <div className="h-32 w-32 flex items-center justify-center">
                            <img
                              src="https://assets.hackclub.com/flag-standalone.svg"
                              alt="Hack Club flag"
                              className="h-32 w-32"
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" className="rounded-full p-2">
                              <HeartButton 
                                size={24} 
                                initialState={post.liked}
                                enableDoubleClick={true}
                                onToggle={(isLiked) => handleLike(post.id, isLiked)}
                              />
                            </Button>
                            <PostDialog post={post} onLikeToggle={(postId, liked) => handleLike(postId, liked)}>
                              <Button variant="ghost" size="icon" className="rounded-full">
                                <MessageCircle className="h-6 w-6" />
                              </Button>
                            </PostDialog>
                            <Button variant="ghost" size="icon" className="rounded-full">
                              <Share2 className="h-6 w-6" />
                            </Button>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-full"
                          >
                            <Bookmark 
                              className="h-6 w-6"
                            />
                          </Button>
                        </div>
                        
                        <p className="font-medium text-sm mb-1">
                          <span>{post.likeCount || 0} {post.likeCount === 1 ? 'like' : 'likes'}</span>
                          {(post.commentsCount ?? 0) > 0 && (
                            <span className="ml-2 text-muted-foreground">•</span>
                          )}
                          {(post.commentsCount ?? 0) > 0 && (
                            <span className="ml-2">{post.commentsCount} {post.commentsCount === 1 ? 'comment' : 'comments'}</span>
                          )}
                        </p>
                        
                        {post.caption && (
                          <div className="mb-2">
                            <span className="font-medium text-sm mr-1">
                              {post.profiles?.full_name}
                            </span>
                            <span className="text-sm">{post.caption}</span>
                          </div>
                        )}
                        
                        <p className="text-xs text-muted-foreground">
                          {new Date(post.created_at).toLocaleDateString()} · {new Date(post.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
                  </div>
                )}
              </div>
            </div>
          </main>
          
          <div className="fixed bottom-6 right-6 z-10">
            <Post />
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-8 rounded-xl backdrop-blur-sm border">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Hackagram</h1>
          <div className="h-1 w-20 bg-[#ec3750] mx-auto rounded-full mb-6"></div>
          <p className="text-muted-foreground mb-8">Connect and share with the Hack Club community.</p>
        </div>

        <Button
          onClick={() => signInWithSlack()}
          className="w-full bg-[#ec3750] hover:bg-[#ec3750]/60 text-primary-foreground py-2 px-4 rounded-md flex items-center justify-center gap-3"
        >
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 122.8 122.8">
            <path d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9zm6.5 0c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z" fill="#e01e5a" />
            <path d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2zm0 6.5c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9h32.3z" fill="#36c5f0" />
            <path d="M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.2zm-6.5 0c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.7 5.8 70.5 0 77.6 0s12.9 5.8 12.9 12.9v32.3z" fill="#2eb67d" />
            <path d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9zm0-6.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6z" fill="#ecb22e" />
          </svg>
          Sign in with Slack
        </Button>
      </div>
    </div>
  )
}