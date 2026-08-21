import { MetadataRoute } from 'next';

// These are the dynamic SEO landing pages handled by app/(seo-pages)/[slug]/page.tsx
// Do NOT add pages that already have a real app directory route (e.g. /jobs, /courses)
const SEO_PAGES: string[] = [
  // Career & Jobs
  'career-hub', 'freshers-jobs', 'campus-hiring', 'campus-recruitment',
  'campus-to-career', 'job-assistance', 'placement-assistance',
  'job-consultancy', 'recruitment', 'resume-builder',
  'ai-mock-interview', 'interview-training',
  // IT Services
  'it-consulting', 'software-development',
  // IT Training — Hub
  'it-training',
  // IT Training — Domain Pages
  'networking', 'desktop-support', 'windows-server', 'linux',
  'cloud-computing', 'devops', 'devsecops', 'application-security',
  'cyber-security', 'endpoint-management', 'site-reliability-engineering',
  'it-service-management',
  // Technology
  'ai-ml', 'full-stack-development', 'vibe-coding',
];

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
    { url: `${baseUrl}/franchise-request`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/events`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  ];

  // Primary SEO Landing Pages
  const seoRoutes: MetadataRoute.Sitemap = SEO_PAGES.map((page) => ({
    url: `${baseUrl}/${page}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

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

  return [...staticRoutes, ...seoRoutes, ...dynamicRoutes];
}
