import { Metadata } from 'next';
import { getSeoData, type SEOPageData } from '../seo-data';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight, ChevronDown } from 'lucide-react';
import { notFound } from 'next/navigation';

// Must stay in sync with SEO_PAGES in sitemap.ts
const VALID_SLUGS = [
  // Career & Jobs
  'career-hub', 'freshers-jobs', 'campus-hiring', 'campus-recruitment',
  'job-assistance', 'placement-assistance', 'job-consultancy', 'recruitment',
  'ai-mock-interview', 'interview-training',
  // IT Services & Consulting
  'it-consulting', 'software-development',
  // IT Training — Hub
  'it-training',
  // IT Training — Domain Pages
  'networking', 'desktop-support', 'windows-server', 'linux',
  'cloud-computing', 'devops', 'devsecops', 'application-security',
  'cyber-security', 'endpoint-management', 'site-reliability-engineering',
  'it-service-management',
  // Technology Training
  'ai-ml', 'full-stack-development', 'vibe-coding', 'python-training',
];

export async function generateStaticParams() {
  return VALID_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  let data: SEOPageData | null = null;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/seo/dynamic/${slug}`, { next: { revalidate: 3600 } });
    if (res.ok) {
      data = (await res.json()) as SEOPageData;
    } else {
      data = getSeoData(slug);
    }
  } catch (err) {
    data = getSeoData(slug);
  }

  if (!data) return {};
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://techwell.co.in';

  return {
    title: data.title,
    description: data.description,
    alternates: { canonical: `https://techwell.co.in` }, // Consolidate SEO authority to main domain
    openGraph: {
      title: data.title,
      description: data.description,
      url: `${baseUrl}/${slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description: data.description,
    },
  };
}

// Career funnel steps — standard across all training pages
const CAREER_FUNNEL = [
  { label: 'Training', href: '/it-training', desc: 'Learn the skills' },
  { label: 'Assessment', href: 'https://elearnstack.com', desc: 'Practice tests', external: true },
  { label: 'Resume', href: '/resume-builder', desc: 'ATS-ready CV' },
  { label: 'AI Interview', href: '/ai-mock-interview', desc: 'Mock rounds' },
  { label: 'Jobs', href: '/jobs', desc: 'Live openings' },
  { label: 'Job Assistance', href: '/job-assistance', desc: 'Get placed' },
];

export default async function SeoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  let data: SEOPageData | null = null;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/seo/dynamic/${slug}`, { next: { revalidate: 3600 } });
    if (res.ok) {
      data = (await res.json()) as SEOPageData;
    } else {
      data = getSeoData(slug);
    }
  } catch (err) {
    data = getSeoData(slug);
  }

  console.log('SEO Data for slug', slug, ':', data);
  if (!data) notFound();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://techwell.co.in';
  const isTrainingPage = data.careerPaths && data.careerPaths.length > 0;

  // Build JSON-LD
  const jsonLd: Record<string, any>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: data.title,
      description: data.description,
      url: `${baseUrl}/${slug}`,
      publisher: { '@type': 'Organization', name: 'Techwell', url: 'https://techwell.co.in' },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
          { '@type': 'ListItem', position: 2, name: 'IT Training', item: `${baseUrl}/it-training` },
          { '@type': 'ListItem', position: 3, name: data.h1, item: `${baseUrl}/${slug}` },
        ],
      },
    },
  ];

  // Course schema for training pages
  if (isTrainingPage) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: data.h1,
      description: data.description,
      provider: { '@type': 'Organization', name: 'Techwell', url: 'https://techwell.co.in' },
    });
  }

  if (data.faqs && data.faqs.length > 0) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: data.faqs.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {jsonLd.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-blue-950 via-sky-900 to-slate-900 py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-700/20 via-transparent to-transparent pointer-events-none" />
        <div className="container relative z-10 px-6 max-w-5xl mx-auto text-center">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center justify-center gap-2 text-sky-300/70 text-sm flex-wrap">
            <Link href="/" className="hover:text-sky-200 transition-colors">Home</Link>
            <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
            <Link href="/it-training" className="hover:text-sky-200 transition-colors">IT Training</Link>
            <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
            <span className="text-sky-100">{data.h1}</span>
          </nav>

          <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/30 text-sky-200 text-sm font-medium px-4 py-2 rounded-full mb-8">
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
            10,000+ Students Placed &amp; Career Supported
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-5 leading-tight">
            {data.h1}
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            {data.subheading}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={data.ctaPrimary.href}>
              <Button size="lg" className="bg-white text-blue-900 hover:bg-sky-50 font-bold text-base px-8 rounded-xl">
                {data.ctaPrimary.label}
              </Button>
            </Link>
            {data.ctaSecondary && (
              <Link href={data.ctaSecondary.href}>
                <Button size="lg" variant="outline" className="border-sky-400/40 text-sky-100 hover:bg-sky-400/10 font-medium text-base px-8 rounded-xl">
                  {data.ctaSecondary.label}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── Intro ── */}
      <section className="py-14 bg-white border-b border-slate-100">
        <div className="container max-w-4xl mx-auto px-6">
          <p className="text-lg text-slate-600 leading-relaxed text-center">{data.intro}</p>
        </div>
      </section>

      {/* ── Quick Answers — AI Overview / Perplexity citation bait ── */}
      {data.quickAnswers && data.quickAnswers.length > 0 && (
        <section className="py-12 bg-sky-50/60 border-b border-sky-100">
          <div className="container max-w-4xl mx-auto px-6 space-y-6">
            {data.quickAnswers.map((qa, i) => (
              <div key={i} className="bg-white rounded-2xl border border-sky-100 p-6 shadow-sm">
                <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 text-xs font-bold flex items-center justify-center flex-shrink-0">Q</span>
                  {qa.q}
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed pl-8">{qa.a}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Features ── */}
      {data.features && data.features.length > 0 && (
        <section className="py-20 bg-slate-50">
          <div className="container max-w-5xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">What You Will Learn</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {data.features.map((f, i) => (
                <div key={i} className="bg-white p-7 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-3xl mb-4">{f.icon}</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Tools Covered ── (training pages only) */}
      {data.tools && data.tools.length > 0 && (
        <section className="py-16 bg-white border-y border-slate-100">
          <div className="container max-w-5xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">Tools &amp; Technologies Covered</h2>
            <div className="flex flex-wrap gap-3 justify-center">
              {data.tools.map((tool, i) => (
                <span key={i} className="bg-sky-50 text-sky-800 border border-sky-200 rounded-lg px-4 py-2 text-sm font-semibold">
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Career Paths ── (training pages only) */}
      {data.careerPaths && data.careerPaths.length > 0 && (
        <section className="py-16 bg-slate-50">
          <div className="container max-w-5xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-4">Career Opportunities</h2>
            <p className="text-slate-500 text-center text-sm mb-10 max-w-xl mx-auto">
              Roles you can target after completing this training and building your portfolio.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {data.careerPaths.map((role, i) => (
                <span key={i} className="bg-white border border-slate-200 text-slate-700 rounded-xl px-5 py-2.5 text-sm font-medium shadow-sm">
                  {role}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Course → Career Funnel ── (training pages only) */}
      {isTrainingPage && (
        <section className="py-16 bg-gradient-to-r from-blue-900 to-sky-900">
          <div className="container max-w-5xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-white text-center mb-3">Your Complete Career Pathway</h2>
            <p className="text-sky-200 text-center text-sm mb-10">From training to job offer — we support every step.</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {CAREER_FUNNEL.map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Link
                    href={step.href}
                    target={step.external ? '_blank' : undefined}
                    rel={step.external ? 'noopener noreferrer' : undefined}
                    className="flex flex-col items-center bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-5 py-4 min-w-[110px] text-center transition-all group"
                  >
                    <span className="text-white font-bold text-sm group-hover:text-sky-200 transition-colors">{step.label}</span>
                    <span className="text-sky-300 text-xs mt-0.5">{step.desc}</span>
                  </Link>
                  {i < CAREER_FUNNEL.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-sky-400 flex-shrink-0 hidden sm:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── eLearnStack Cross-Link ── */}
      {data.crossLink && (
        <section className="py-10 bg-sky-50 border-y border-sky-100">
          <div className="container max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center gap-6 justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">{data.crossLink.heading}</h3>
              <p className="text-slate-600 text-sm leading-relaxed max-w-lg">{data.crossLink.text}</p>
            </div>
            <Link href={data.crossLink.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
              <Button variant="outline" className="border-sky-400 text-sky-700 hover:bg-sky-100 gap-2 px-6">
                {data.crossLink.cta} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* ── FAQs ── */}
      {data.faqs && data.faqs.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {data.faqs.map((faq, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-7 border border-slate-100">
                  <h3 className="text-base font-bold text-slate-900 mb-3">{faq.q}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Related Internal Links ── */}
      {data.relatedLinks && data.relatedLinks.length > 0 && (
        <section className="py-14 bg-slate-50 border-t border-slate-100">
          <div className="container max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-xl font-bold text-slate-700 mb-6">Explore More at Techwell</h2>
            <div className="flex flex-wrap gap-3 justify-center">
              {data.relatedLinks.map((link, i) => (
                <Link key={i} href={link.href}>
                  <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-white gap-1.5">
                    {link.label} <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Footer CTA ── */}
      <section className="py-20 bg-gradient-to-br from-blue-900 via-sky-900 to-slate-900">
        <div className="container max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-slate-300 mb-8 text-lg">
            Join 10,000+ students and professionals who have built their careers with Techwell.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={data.ctaPrimary.href}>
              <Button size="lg" className="bg-white text-blue-900 hover:bg-sky-50 font-bold px-8 rounded-xl">
                {data.ctaPrimary.label}
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-sky-400/40 text-sky-100 hover:bg-sky-400/10 px-8 rounded-xl">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
