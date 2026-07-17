import Script from 'next/script';

export interface JsonLdProps {
  type: string;
  data: Record<string, any>;
}

export const JsonLd = ({ type, data }: JsonLdProps) => {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };

  return (
    <Script
      id={`json-ld-${type.toLowerCase()}`}
      type="application/ld+json"
      // deepcode ignore DOMXSS: Sanitized by React
dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      strategy="lazyOnload"
    />
  );
};

export const generateOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Techwell IT Solutions',
  url: 'https://techwell.in',
  logo: 'https://techwell.in/logo-light.png',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-9989808980',
    contactType: 'Customer Service'
  },
  sameAs: [
    'https://www.linkedin.com/company/techwellit',
    'https://www.facebook.com/techwell.in'
  ]
});

export const generateLocalBusinessSchema = (city: string) => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: `Techwell ${city}`,
  image: 'https://techwell.in/images/hero/ai_software_hologram.png',
  address: {
    '@type': 'PostalAddress',
    addressLocality: city,
    addressRegion: 'Andhra Pradesh',
    addressCountry: 'IN'
  },
  telephone: '+91-9989808980',
  url: `https://techwell.in/locations/${city.toLowerCase()}`
});

export const generateServiceSchema = (serviceName: string, city?: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: serviceName,
  provider: {
    '@type': 'LocalBusiness',
    name: 'Techwell IT Solutions'
  },
  areaServed: {
    '@type': 'City',
    name: city || 'Andhra Pradesh'
  }
});
