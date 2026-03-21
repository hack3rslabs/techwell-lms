import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import { ScrollButton } from "@/components/ui/scroll-button";
import { FloatingCallButton } from "@/components/ui/floating-call-button";
import ChatWidget from "@/components/ai/ChatWidget";
import { BehaviorTrackingProvider } from "@/components/BehaviorTrackingProvider";

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
    default: "TechWell | AI-Powered Learning & Career Platform",
    template: "%s | TechWell"
  },
  description: "Accelerate your tech career with AI-powered mock interviews, personalized adaptive courses, and direct placement support. Join 10,000+ successful students.",
  keywords: [
    "AI-Powered Learning",
    "Tech Career Platform",
    "AI Mock Interviews",
    "Tailored Coding Courses",
    "Placement Assistance India",
    "TechWell Learning",
    "Adaptive Learning AI"
  ],
  authors: [{ name: "TechWell Team", url: "https://techwell.co.in/about" }],
  creator: "TechWell",
  publisher: "TechWell Inc.",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://techwell.co.in",
    siteName: "TechWell",
    title: "TechWell | AI-Powered Learning",
    description: "Launch your tech career with AI-mock interviews and personalized courses. Bridge the gap between campus and corporate.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TechWell - Your Tech Career Partner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TechWell | AI-Powered Learning & Jobs",
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
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
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
              <div className="print:hidden fixed bottom-6 right-6 z-[9999]">
                <ChatWidget />
              </div>
            </BehaviorTrackingProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}



