import type { Metadata } from 'next';
import ServicesPageClient from './ServicesPageClient';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://techwell.co.in';

export const metadata: Metadata = {
  title: 'IT Solutions & Cyber Security Services | Techwell',
  description: 'Enterprise IT solutions, Custom Software Development, Cyber Security audits, and AI Automation services for scaling businesses.',
  keywords: ['IT Solutions', 'Cyber Security', 'Software Development', 'IT Infrastructure', 'Maintenance Support'],
  alternates: {
    canonical: `${BASE_URL}/services`,
  }
};

const servicesJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Enterprise IT & Cyber Security Solutions',
  provider: {
    '@type': 'Organization',
    name: 'Techwell'
  },
  description: 'Comprehensive IT Infrastructure, Custom Software Development, Cyber Security, and Digital Marketing Services.',
  areaServed: 'Global'
};

export default function ServicesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // deepcode ignore DOMXSS: Sanitized by React
dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesJsonLd) }}
      />
      <ServicesPageClient />
    </>
  );
}
