import type { Metadata } from 'next'
import BlogClient from './BlogClient'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://techwell.co.in'

export const metadata: Metadata = {
    title: 'Tech Blog | Insights, Tutorials & Career Tips — Techwell',
    description:
        'Read expert articles on AI, Web Development, Data Science, IT careers, and fresher guides. Stay ahead in the tech industry with Techwell Blog.',
    keywords: [
        'Tech Blog India',
        'Software Development Articles',
        'AI Career Tips',
        'Fresher IT Guide',
        'Programming Tutorials',
        'Data Science Blog',
        'Techwell Blog',
    ],
    alternates: { canonical: `${BASE_URL}/blog` },
    openGraph: {
        title: 'Techwell Blog | Tech Insights & Career Tips',
        description: 'Expert articles on AI, Web Dev, Data Science, and career growth for Indian tech professionals.',
        url: `${BASE_URL}/blog`,
        type: 'website',
        images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630, alt: 'Techwell Blog' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Techwell Blog | Tech Insights',
        description: 'Expert articles on AI, Web Dev, and career growth.',
        images: [`${BASE_URL}/og-image.png`],
    },
}

const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Techwell Blog',
    description: 'Expert articles on AI, Web Development, Data Science, and IT career tips.',
    url: `${BASE_URL}/blog`,
    publisher: {
        '@type': 'Organization',
        name: 'Techwell',
        logo: { '@type': 'ImageObject', url: `${BASE_URL}/logo-light.png` },
    },
}

export default function BlogPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
            />
            <BlogClient />
        </>
    )
}
