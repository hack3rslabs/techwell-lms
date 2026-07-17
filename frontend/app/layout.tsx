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
    default: "Techwell | AI Career and Business Consulting",
    template: "%s | Techwell"
  },
  description: "Accelerate your tech career with AI-powered mock interviews, personalized adaptive courses, and direct placement support. Join 10,000+ successful students.",
  keywords: [
    "AI Career and Business Consulting",
    "Tech Career Platform",
    "AI Mock Interviews",
    "Tailored Coding Courses",
    "Placement Assistance India",
    "Techwell Learning",
    "Adaptive Learning AI"
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
    title: "Techwell | AI Career and Business Consulting",
    description: "Launch your tech career with AI-mock interviews and personalized courses. Bridge the gap between campus and corporate.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Techwell - Your Tech Career Partner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Techwell | AI Career and Business Consulting",
    description: "Master tech skills with AI. Ace interviews. Get placed.",
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
