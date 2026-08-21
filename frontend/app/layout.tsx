import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClientShell } from "@/components/layout/ClientShell";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import { BehaviorTrackingProvider } from "@/components/BehaviorTrackingProvider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as HotToaster } from 'react-hot-toast';
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { SystemStatusManager } from "@/components/shared/SystemStatusManager";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://techwell.co.in"),
  title: {
    default: "Techwell | Business, Technology & Career Solutions",
    template: "%s | Techwell"
  },
  description: "Techwell provides comprehensive business and IT consulting, full-stack software development, professional IT training, and career recruitment solutions. Join 10,000+ students and professionals shaping their careers.",
  keywords: [
    "Business Consulting",
    "IT Consulting",
    "Software Development",
    "IT Training",
    "Career Development",
    "Freshers Jobs",
    "Campus Hiring",
    "Placement Assistance"
  ],
  authors: [{ name: "Techwell Team", url: "https://techwell.co.in/about" }],
  creator: "Techwell",
  publisher: "Techwell Inc.",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://techwell.co.in",
    siteName: "Techwell",
    title: "Techwell | Business, Technology & Career Solutions",
    description: "Launch your career with professional IT training, placement assistance, and business technology solutions. Bridge the gap between campus and corporate.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Techwell - Business, Technology, Career & Recruitment",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Techwell | Business, Technology & Career Solutions",
    description: "Master tech skills with AI. Build your career. Empower your business.",
    images: ["/og-image.png"],
    creator: "@techwell_edu",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: "/logo-dark.png", type: "image/png", sizes: "any" },
      { url: "/images/favicon/Logo dark.svg", type: "image/svg+xml" },
    ],
    shortcut: "/logo-dark.png",
    apple: [
      { url: "/logo-dark.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col no-scrollbar`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              // ── Organization (brand entity) ──────────────────────
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "@id": "https://techwell.co.in/#organization",
                "name": "Techwell",
                "alternateName": ["Techwell IT Solutions", "Techwell Career Hub"],
                "url": "https://techwell.co.in",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://techwell.co.in/logo-dark.png",
                  "width": 200,
                  "height": 60
                },
                "description": "Techwell provides professional IT training, career development, job assistance, placement assistance, campus hiring, recruitment consultancy, IT consulting, and software development services. Based in Srikakulam and Visakhapatnam, Andhra Pradesh.",
                "foundingDate": "2018",
                "areaServed": ["Srikakulam", "Visakhapatnam", "Andhra Pradesh", "Telangana", "India"],
                "serviceType": [
                  "IT Training", "Career Guidance", "Job Assistance", "Placement Assistance",
                  "Campus Hiring", "Recruitment Consultancy", "IT Consulting", "Software Development",
                  "Cyber Security Training", "DevOps Training", "Cloud Computing Training",
                  "AI ML Training", "Full Stack Development Training"
                ],
                "sameAs": [
                  "https://www.linkedin.com/company/techwell",
                  "https://twitter.com/techwell_edu",
                  "https://elearnstack.com"
                ],
                "contactPoint": [
                  {
                    "@type": "ContactPoint",
                    "contactType": "customer support",
                    "email": "support@techwell.co.in",
                    "availableLanguage": ["English", "Telugu", "Hindi"]
                  },
                  {
                    "@type": "ContactPoint",
                    "contactType": "admissions",
                    "email": "support@techwell.co.in"
                  }
                ]
              },
              // ── LocalBusiness — Srikakulam ───────────────────────
              {
                "@context": "https://schema.org",
                "@type": ["LocalBusiness", "EducationalOrganization"],
                "@id": "https://techwell.co.in/#srikakulam",
                "name": "Techwell — Srikakulam",
                "url": "https://techwell.co.in",
                "image": "https://techwell.co.in/logo-dark.png",
                "description": "IT training, career guidance, job assistance, and placement support in Srikakulam, Andhra Pradesh.",
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": "Srikakulam",
                  "addressRegion": "Andhra Pradesh",
                  "addressCountry": "IN"
                },
                "geo": {
                  "@type": "GeoCoordinates",
                  "latitude": 18.2949,
                  "longitude": 83.8977
                },
                "priceRange": "₹₹",
                "areaServed": "Srikakulam",
                "openingHoursSpecification": [
                  {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
                    "opens": "09:00",
                    "closes": "18:00"
                  }
                ],
                "parentOrganization": { "@id": "https://techwell.co.in/#organization" }
              },
              // ── LocalBusiness — Visakhapatnam ────────────────────
              {
                "@context": "https://schema.org",
                "@type": ["LocalBusiness", "EducationalOrganization"],
                "@id": "https://techwell.co.in/#visakhapatnam",
                "name": "Techwell — Visakhapatnam",
                "url": "https://techwell.co.in",
                "image": "https://techwell.co.in/logo-dark.png",
                "description": "IT training, career guidance, job assistance, and placement support in Visakhapatnam (Vizag), Andhra Pradesh.",
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": "Visakhapatnam",
                  "addressRegion": "Andhra Pradesh",
                  "addressCountry": "IN"
                },
                "geo": {
                  "@type": "GeoCoordinates",
                  "latitude": 17.6868,
                  "longitude": 83.2185
                },
                "priceRange": "₹₹",
                "areaServed": "Visakhapatnam",
                "openingHoursSpecification": [
                  {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
                    "opens": "09:00",
                    "closes": "18:00"
                  }
                ],
                "parentOrganization": { "@id": "https://techwell.co.in/#organization" }
              },
              // ── WebSite + SearchAction ───────────────────────────
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "@id": "https://techwell.co.in/#website",
                "name": "Techwell",
                "url": "https://techwell.co.in",
                "publisher": { "@id": "https://techwell.co.in/#organization" },
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": "https://techwell.co.in/jobs?q={search_term_string}"
                  },
                  "query-input": "required name=search_term_string"
                }
              }
            ])
          }}
        />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <BehaviorTrackingProvider>
              {/*
                ClientShell: shows public Header/Footer only on non-dashboard routes.
                Dashboard routes (/admin, /dashboard, /franchise-admin) get no public chrome.
              */}
              <ClientShell>
                <SystemStatusManager />
                {children}
              </ClientShell>
            </BehaviorTrackingProvider>
          </AuthProvider>
        </ThemeProvider>
        <WhatsAppButton />
        <Toaster />
        <HotToaster position="top-right" />
      </body>
    </html>
  );
}
