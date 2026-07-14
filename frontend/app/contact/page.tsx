import type { Metadata } from 'next'
import ContactClient from './ContactClient'

export const metadata: Metadata = {
    title: 'Contact Techwell | Get in Touch',
    description: 'Have questions? Reach out to Techwell for support, HR inquiries, or general information. We are here to help you accelerate your tech journey.',
    keywords: ['Contact Techwell', 'Tech Support', 'HR Inquiries'],
}

export default function ContactPage() {
    return <ContactClient />
}
