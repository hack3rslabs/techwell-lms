import PostEditor from '@/components/admin/posts/PostEditor';

export const metadata = {
    title: 'Edit Post - Techwell Admin',
    description: 'Edit an existing blog post.',
};

export default function EditPostPage() {
    return <PostEditor />;
}
