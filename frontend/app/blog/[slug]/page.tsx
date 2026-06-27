import type { Metadata, ResolvingMetadata } from 'next'
import BlogPostClient from './BlogPostClient'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://techwell.co.in'
const API_URL  = process.env.NEXT_PUBLIC_API_URL  || 'http://localhost:5000/api'

type Props = {
    params: { slug: string }
}

async function getBlogPost(slug: string) {
    try {
        const res = await fetch(`${API_URL}/blogs/${slug}`, { next: { revalidate: 3600 } })
        if (!res.ok) return null
        return await res.json()
    } catch {
        return null
    }
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { slug } = await params
    const post = await getBlogPost(slug)

    if (!post) {
        return { title: 'Blog Post Not Found' }
    }

    const previousImages = (await parent).openGraph?.images || []
    const ogImage = post.coverImage
        ? (post.coverImage.startsWith('http') ? post.coverImage : `${BASE_URL}${post.coverImage}`)
        : `${BASE_URL}/og-image.png`

    return {
        title: post.title,
        description: post.summary || post.content?.slice(0, 160) || 'Read this article on Techwell Blog.',
        keywords: post.tags || ['Tech Blog', 'Techwell'],
        alternates: { canonical: `${BASE_URL}/blog/${post.slug || post.id}` },
        authors: post.author?.name ? [{ name: post.author.name }] : [{ name: 'Techwell Team' }],
        openGraph: {
            title: post.title,
            description: post.summary || post.content?.slice(0, 160),
            type: 'article',
            url: `${BASE_URL}/blog/${post.slug || post.id}`,
            publishedTime: post.publishedAt || post.createdAt,
            modifiedTime: post.updatedAt,
            authors: post.author?.name ? [post.author.name] : ['Techwell Team'],
            tags: post.tags || [],
            images: [ogImage, ...previousImages],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.summary || post.content?.slice(0, 160),
            images: [ogImage],
        },
    }
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params
    const post = await getBlogPost(slug)

    const articleJsonLd = post ? {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.summary || post.content?.slice(0, 160),
        datePublished: post.publishedAt || post.createdAt,
        dateModified: post.updatedAt || post.createdAt,
        author: {
            '@type': 'Person',
            name: post.author?.name || 'Techwell Team',
        },
        publisher: {
            '@type': 'Organization',
            name: 'Techwell',
            logo: { '@type': 'ImageObject', url: `${BASE_URL}/logo-light.png` },
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${BASE_URL}/blog/${post.slug || post.id}`,
        },
        image: post.coverImage
            ? (post.coverImage.startsWith('http') ? post.coverImage : `${BASE_URL}${post.coverImage}`)
            : `${BASE_URL}/og-image.png`,
        keywords: (post.tags || []).join(', '),
        url: `${BASE_URL}/blog/${post.slug || post.id}`,
    } : null

    return (
        <>
            {articleJsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
                />
            )}
            <BlogPostClient />
        </>
    )
}
