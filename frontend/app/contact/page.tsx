import type { Metadata } from 'next'
import ContactClient from './ContactClient'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://techwell.co.in'

export const metadata: Metadata = {
    title: 'Contact Techwell | Get in Touch with Our Team',
    description:
        'Contact Techwell for course inquiries, placement support, or technical help. Reach us at info@techwell.co.in or +91 7997473473. We reply within 24 hours.',
    keywords: ['Contact Techwell', 'Tech Learning Support', 'Techwell Help', 'Course Inquiry India'],
    alternates: { canonical: `${BASE_URL}/contact` },
    openGraph: {
        title: 'Contact Techwell | We\'re Here to Help',
        description: 'Reach Techwell support for any course, career, or technical queries.',
        url: `${BASE_URL}/contact`,
        type: 'website',
        images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630, alt: 'Contact Techwell' }],
    },
}

const contactJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Techwell',
    url: `${BASE_URL}/contact`,
    mainEntity: {
        '@type': 'Organization',
        name: 'Techwell',
        telephone: '+91-7997473473',
        email: 'info@techwell.co.in',
        url: BASE_URL,
        address: { '@type': 'PostalAddress', addressCountry: 'IN' },
    },
}

export default function ContactPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
            />
            <ContactClient />
        </>
    )
}
