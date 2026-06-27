import type { Metadata } from 'next'
import PrivacyClient from './PrivacyClient'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://techwell.co.in'

export const metadata: Metadata = {
    title: 'Privacy Policy | Techwell Data Protection',
    description:
        'Read Techwell\'s Privacy Policy. Learn how we collect, use, and protect your data. GDPR compliant. 256-bit SSL encryption. Last updated February 2026.',
    keywords: ['Techwell Privacy Policy', 'Data Protection', 'GDPR Compliance', 'User Data Security'],
    alternates: { canonical: `${BASE_URL}/privacy` },
    robots: { index: true, follow: false },
    openGraph: {
        title: 'Privacy Policy | Techwell',
        description: 'How Techwell collects and protects your personal data.',
        url: `${BASE_URL}/privacy`,
        type: 'website',
    },
}

export default function PrivacyPage() {
    return <PrivacyClient />
}
