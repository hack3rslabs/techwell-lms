import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import { ScrollButton } from "@/components/ui/scroll-button";
import { FloatingCallButton } from "@/components/ui/floating-call-button";
import { BehaviorTrackingProvider } from "@/components/BehaviorTrackingProvider";
import { Toaster } from "@/components/ui/toaster";
import { GoogleAnalytics } from '@next/third-parties/google';

export const viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://techwell.co.in"),
  title: {
    default: "Techwell | AI-Powered Learning & Career Platform",
    template: "%s | Techwell"
  },
  description: "Accelerate your tech career with AI-powered mock interviews, personalized adaptive courses, and direct placement support. Join 10,000+ successful students.",
  keywords: [
    "AI-Powered Learning",
    "Tech Career Platform",
    "AI Mock Interviews",
    "Tailored Coding Courses",
    "Placement Assistance India",
    "Techwell Learning",
    "Adaptive Learning AI",
    "Online Tech Courses India",
    "Software Developer Training",
    "Data Science Courses",
  ],
  authors: [{ name: "Techwell Team", url: "https://techwell.co.in/about" }],
  creator: "Techwell",
  publisher: "Techwell Inc.",
  category: "Education",
  applicationName: "Techwell",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
    languages: {
      "en-IN": "/",
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || "",
    other: {
      "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION || "",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    alternateLocale: ["en_US"],
    url: "https://techwell.co.in",
    siteName: "Techwell",
    title: "Techwell | AI-Powered Learning & Career Platform",
    description: "Launch your tech career with AI-mock interviews and personalized courses. Bridge the gap between campus and corporate.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Techwell - Your Tech Career Partner",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@techwell_edu",
    creator: "@techwell_edu",
    title: "Techwell | AI-Powered Learning & Jobs",
    description: "Master tech skills with AI. Ace interviews. Get placed.",
    images: [{ url: "/og-image.png", alt: "Techwell Platform" }],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/images/favicon/Logo light.svg", media: "(prefers-color-scheme: light)" },
      { url: "/images/favicon/Logo dark.svg",  media: "(prefers-color-scheme: dark)" },
    ],
    shortcut: "/images/favicon/Logo dark.svg",
    apple: [{ url: "/images/favicon/Logo dark.svg" }],
  },
  manifest: "/manifest.json",
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
  className="antialiased min-h-screen flex flex-col no-scrollbar"
>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <BehaviorTrackingProvider>
              {/* Header - hidden on print */}
              <div className="print:hidden">
                <Header />
              </div>
              <main className="flex-1 w-full">
                {children}
              </main>
              {/* Footer - hidden on print */}
              <div className="print:hidden">
                <Footer />
              </div>
              {/* Scroll button - hidden on print */}
              <div className="print:hidden">
                <ScrollButton />
              </div>
              <div className="print:hidden">
                <FloatingCallButton />
              </div>

            </BehaviorTrackingProvider>
          </AuthProvider>
        </ThemeProvider>
        <Toaster />
        {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
      </body>
    </html>
  );
}
