import PostEditor from '@/components/admin/posts/PostEditor';

export const metadata = {
    title: 'Add New Post - Techwell Admin',
    description: 'Create a new blog post or article.',
};

export default function CreatePostPage() {
    return <PostEditor />;
}
