import { Metadata } from 'next'
import BlogPostClient from './BlogPostClient'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const slug = params.slug
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs/${slug}`, { next: { revalidate: 60 } })
        const post = await res.json()
        if (!post || post.error) return { title: 'Blog Not Found | Techwell' }
        
        return {
            title: post.metaTitle || `${post.title} | Techwell Blog`,
            description: post.metaDescription || post.summary || 'Read the latest insights from Techwell.',
            keywords: post.keywords ? post.keywords.join(', ') : '',
            alternates: {
                canonical: post.canonicalUrl || `https://techwell.com/blog/${slug}`
            },
            openGraph: {
                title: post.metaTitle || post.title,
                description: post.metaDescription || post.summary,
                type: 'article',
                authors: post.author?.name ? [post.author.name] : [],
                images: post.coverImage ? [{ url: post.coverImage }] : [],
            },
            twitter: {
                card: 'summary_large_image',
                title: post.metaTitle || post.title,
                description: post.metaDescription || post.summary,
                images: post.coverImage ? [post.coverImage] : []
            }
        }
    } catch {
        return { title: 'Techwell Blog' }
    }
}

export default function Page({ params }: { params: { slug: string } }) {
    return <BlogPostClient slug={params.slug} />
}
