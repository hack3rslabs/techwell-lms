import { MetadataRoute } from 'next';

const SERVICES: string[] = []; // Re-add dynamic fetching if needed
const CITIES: string[] = []; // Re-add dynamic fetching if needed

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://techwell.in';

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
  ];

  // Dynamic Service Routes
  const serviceRoutes: MetadataRoute.Sitemap = SERVICES.map((service) => ({
    url: `${baseUrl}/services/${service}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Dynamic Service + Location Routes
  const localRoutes: MetadataRoute.Sitemap = [];
  SERVICES.forEach((service) => {
    CITIES.forEach((city) => {
      localRoutes.push({
        url: `${baseUrl}/services/${service}/${city}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    });
  });

  return [...staticRoutes, ...serviceRoutes, ...localRoutes];
}
