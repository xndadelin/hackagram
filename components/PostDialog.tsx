import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle,
} from "@/components/ui/dialog"
import { VisuallyHidden } from "@/components/ui/visually-hidden"
import { Input } from "@/components/ui/input"
import { HeartButton } from "@/components/HeartButton"
import { ImageCarousel } from "@/components/ImageCarousel"
import { useGetUser } from "@/utils/queries/getUser"
import { useState, useEffect } from "react"
import { Bookmark, MessageCircle } from "lucide-react"
import { PostType } from "@/utils/queries/getPosts"

interface PostDialogProps {
    post: PostType;
    children: React.ReactNode;
    onLikeToggle: (postId: string, liked: boolean) => Promise<void>;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

interface CommentType {
    id: string;
    post_id: string;
    user_id: string;
    text: string;
    created_at: string;
    profiles: {
        full_name: string;
        avatar_url?: string;
    };
}

export const PostDialog = ({ post, children, onLikeToggle, open: controlledOpen, onOpenChange }: PostDialogProps) => {
    const [comment, setComment] = useState("");
    const { data: currentUserData } = useGetUser();
    const [comments, setComments] = useState<CommentType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [internalOpen, setInternalOpen] = useState(false);

    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setIsOpen = onOpenChange || setInternalOpen;

    useEffect(() => {
        const fetchComments = async () => {
            if (post?.id) {
                setIsLoading(true);
                try {
                    const { createClient } = await import('@/lib/supabase/client');
                    const supabase = createClient();

                    const { data: commentsData, error: commentsError } = await supabase
                        .from('comments')
                        .select(`
              id,
              post_id,
              user_id,
              text,
              created_at,
              profiles(id, full_name, avatar_url)
            `)
                        .eq('post_id', post.id)
                        .order('created_at', { ascending: true });

                    if (commentsError) throw commentsError;

                    if (commentsData && commentsData.length > 0) {
                        const processedComments = commentsData.map(comment => ({
                            ...comment,
                            profiles: Array.isArray(comment.profiles)
                                ? (comment.profiles[0] || { full_name: 'User', avatar_url: null })
                                : (comment.profiles || { full_name: 'User', avatar_url: null })
                        }));

                        setComments(processedComments);
                    } else {
                        setComments([]);
                    }
                } catch (error) {
                    console.error('error fetching comments:', error);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchComments();
    }, [post?.id]);

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!comment.trim() || !currentUserData?.user?.id || !post?.id) return;

        try {
            setIsLoading(true);
            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();

            const { data: commentData, error: commentError } = await supabase
                .from('comments')
                .insert({
                    post_id: post.id,
                    user_id: currentUserData.user.id,
                    text: comment.trim(),
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (commentError) throw commentError;

            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url')
                .eq('id', currentUserData.user.id)
                .single();

            if (profileError) throw profileError;

            const newComment = {
                ...commentData,
                profiles: {
                    full_name: profileData.full_name,
                    avatar_url: profileData.avatar_url
                }
            };

            setComments(prev => [...prev, newComment]);
            setComment("");
        } catch (error) {
            console.error('Error submitting comment:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[1000px] p-0 gap-0 h-auto overflow-hidden grid sm:grid-cols-[1.5fr_1fr]">
                <VisuallyHidden>
                    <DialogTitle>Post from {post.profiles?.full_name || "User"}</DialogTitle>
                </VisuallyHidden>
                <div className="flex items-center justify-center h-[600px]">
                    {post.fileUrls && post.fileUrls.length > 0 ? (
                        <ImageCarousel 
                            images={post.fileUrls}
                            aspectRatio="square"
                            cropMode="cover"
                        />
                    ) : (
                        <div className="h-32 w-32 flex items-center justify-center">
                            <img
                                src="https://assets.hackclub.com/flag-standalone.svg"
                                alt="Post placeholder"
                                className="h-full w-full object-contain"
                            />
                        </div>
                    )}
                </div>

                <div className="flex flex-col border-l h-[600px] overflow-hidden">
                    <div className="flex items-center justify-between p-3 border-b">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 border rounded-full flex items-center justify-center overflow-hidden">
                                <img
                                    src={post.profiles?.avatar_url || "https://assets.hackclub.com/flag-standalone.svg"}
                                    alt={post.profiles?.full_name || "User"}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = "https://assets.hackclub.com/flag-standalone.svg";
                                    }}
                                />
                            </div>
                            <span className="font-medium text-sm">{post.profiles?.full_name || "User"}</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3" style={{ maxHeight: 'calc(600px - 180px)' }}>
                        {post.caption && (
                            <div className="flex gap-2 mb-4">
                                <div className="w-8 h-8 border rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                                    <img
                                        src={post.profiles?.avatar_url || "https://assets.hackclub.com/flag-standalone.svg"}
                                        alt={post.profiles?.full_name || "User"}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src = "https://assets.hackclub.com/flag-standalone.svg";
                                        }}
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <div>
                                        <span className="font-medium text-sm mr-1">{post.profiles?.full_name || "User"}</span>
                                        <span className="text-sm">{post.caption}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground mt-1">
                                        {new Date(post.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        )}

                        {comments.length > 0 ? (
                            <div className="space-y-4">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-2">
                                        <div className="w-8 h-8 border rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                                            <img
                                                src={comment.profiles?.avatar_url || "https://assets.hackclub.com/flag-standalone.svg"}
                                                alt={comment.profiles?.full_name || "User"}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src = "https://assets.hackclub.com/flag-standalone.svg";
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <div>
                                                <span className="font-medium text-sm mr-1">{comment.profiles?.full_name || "User"}</span>
                                                <span className="text-sm">{comment.text}</span>
                                            </div>
                                            <span className="text-xs text-muted-foreground mt-1">
                                                {new Date(comment.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                                <MessageCircle className="h-12 w-12 mb-4 opacity-20" />
                                <p>No comments yet</p>
                                <p className="text-sm">Be the first to comment!</p>
                            </div>
                        )}
                    </div>

                    <div className="border-t p-3 flex-shrink-0">
                        <div className="flex gap-3 mb-3">
                            <HeartButton
                                initialState={!!post.liked}
                                onToggle={(isLiked) => onLikeToggle(post.id, isLiked)}
                                size={24}
                                key={`dialog-heart-${post.id}-${String(post.liked)}-${Date.now()}`}
                            />
                            <Button variant="ghost" size="icon" className="p-0 h-6 w-6">
                                <MessageCircle className="h-6 w-6" />
                            </Button>
                            <div className="ml-auto">
                                <Button variant="ghost" size="icon" className="p-0 h-6 w-6">
                                    <Bookmark className="h-6 w-6" />
                                </Button>
                            </div>
                        </div>

                        <div className="mb-3">
                            <p className="font-medium text-sm">
                                <span>{post.likeCount || 0} {post.likeCount === 1 ? 'like' : 'likes'}</span>
                                {comments.length > 0 && (
                                    <span className="ml-2 text-muted-foreground">•</span>
                                )}
                                {comments.length > 0 && (
                                    <span className="ml-2">{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</span>
                                )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>

                        <form onSubmit={handleCommentSubmit} className="flex gap-2">
                            <Input
                                placeholder="Add a comment..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="flex-1"
                                disabled={isLoading}
                            />
                            <Button
                                type="submit"
                                size="sm"
                                variant="ghost"
                                disabled={!comment.trim() || isLoading}
                                className="text-[#ec3750] font-medium hover:bg-transparent hover:text-[#ec3750]/90 disabled:opacity-50"
                            >
                                {isLoading ? "Posting..." : "Post"}
                            </Button>
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};