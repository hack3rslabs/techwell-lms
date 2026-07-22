import { MetadataRoute } from 'next';

const SERVICES: string[] = ['consulting', 'training', 'development']; 
const CITIES: string[] = ['hyderabad', 'bangalore', 'pune', 'chennai'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://techwell.co.in';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/courses`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/jobs`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/placements`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/consultancy`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/campus-to-career`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/franchise-request`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/events`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
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

  // Fetch dynamic entities gracefully
  const dynamicRoutes: MetadataRoute.Sitemap = [];
  try {
    const [coursesRes, jobsRes, blogsRes] = await Promise.allSettled([
      fetch(`${apiUrl}/courses`, { next: { revalidate: 3600 } }),
      fetch(`${apiUrl}/jobs`, { next: { revalidate: 3600 } }),
      fetch(`${apiUrl}/blogs`, { next: { revalidate: 3600 } })
    ]);

    if (coursesRes.status === 'fulfilled' && coursesRes.value.ok) {
      const data = await coursesRes.value.json();
      const courses = data.data || data;
      if (Array.isArray(courses)) {
        dynamicRoutes.push(...courses.map((course: any) => ({
          url: `${baseUrl}/courses/${course.id || course.slug}`,
          lastModified: new Date(course.updatedAt || new Date()),
          changeFrequency: 'weekly' as any,
          priority: 0.8,
        })));
      }
    }

    if (jobsRes.status === 'fulfilled' && jobsRes.value.ok) {
      const data = await jobsRes.value.json();
      const jobs = data.data || data;
      if (Array.isArray(jobs)) {
        dynamicRoutes.push(...jobs.map((job: any) => ({
          url: `${baseUrl}/jobs/${job.id || job.slug}`,
          lastModified: new Date(job.updatedAt || new Date()),
          changeFrequency: 'daily' as any,
          priority: 0.8,
        })));
      }
    }
  } catch (error) {
    console.warn("Sitemap: Could not fetch dynamic routes, falling back to static only", error);
  }

  return [...staticRoutes, ...serviceRoutes, ...localRoutes, ...dynamicRoutes];
}
