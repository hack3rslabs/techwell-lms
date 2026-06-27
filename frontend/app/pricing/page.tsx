import type { Metadata } from 'next'
import PricingClient from './PricingClient'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://techwell.co.in'

export const metadata: Metadata = {
    title: 'Pricing Plans | Affordable Tech Learning — Techwell',
    description:
        'Explore Techwell\'s transparent pricing: Free Starter plan, Pro at ₹999/month with unlimited AI interviews, and Enterprise for teams. Start your 7-day free trial.',
    keywords: [
        'Techwell Pricing',
        'Online Learning Plans India',
        'Affordable Tech Courses',
        'AI Interview Subscription',
        'Student Learning Plan',
    ],
    alternates: { canonical: `${BASE_URL}/pricing` },
    openGraph: {
        title: 'Simple & Transparent Pricing | Techwell',
        description: 'Free, Pro, and Enterprise plans. Start learning today with no hidden fees.',
        url: `${BASE_URL}/pricing`,
        type: 'website',
        images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630, alt: 'Techwell Pricing' }],
    },
}

const pricingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Techwell Pricing',
    url: `${BASE_URL}/pricing`,
    description: 'Pricing plans for Techwell AI learning platform — Free, Pro, and Enterprise.',
    offers: [
        {
            '@type': 'Offer',
            name: 'Starter',
            price: '0',
            priceCurrency: 'INR',
            description: '3 free courses and 2 AI mock interviews per month.',
        },
        {
            '@type': 'Offer',
            name: 'Pro',
            price: '999',
            priceCurrency: 'INR',
            description: 'Unlimited AI interviews, all courses, priority support.',
        },
    ],
}

export default function PricingPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingJsonLd) }}
            />
            <PricingClient />
        </>
    )
}
