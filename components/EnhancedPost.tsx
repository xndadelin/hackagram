import { Post as OriginalPost } from './Post';
import { PostDialog } from './PostDialog';

const EnhancedPost = (props: any) => <OriginalPost {...props} />;

EnhancedPost.Dialog = PostDialog;

export { EnhancedPost as Post };
