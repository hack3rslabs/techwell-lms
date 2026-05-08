import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import { ScrollButton } from "@/components/ui/scroll-button";
import { FloatingCallButton } from "@/components/ui/floating-call-button";
import { BehaviorTrackingProvider } from "@/components/BehaviorTrackingProvider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "Techwell | AI-Powered Learning & Career Platform",
    template: "%s | Techwell"
  },
  description: "Techwell is a comprehensive AI-powered LMS for colleges and students. Master technical skills, ace interviews with AI avatars, and get placed at top companies.",
  keywords: [
    "Techwell Learning",
    "AI Interviews",
    "LMS Platform",
    "Career Readiness"
  ],
  authors: [{ name: "Techwell Team", url: "https://techwell.co.in/about" }],
  creator: "Techwell",
  publisher: "Techwell Inc.",
  alternates: {
    canonical: "/",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://techwell.co.in",
    siteName: "Techwell",
    title: "Techwell | AI-Powered Learning",
    description: "The ultimate platform for tech education and placement preparation.",
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
    title: "Techwell | AI-Powered Learning & Jobs",
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
      { url: "/images/favicon/Logo light.svg", media: "(prefers-color-scheme: light)" },
      { url: "/images/favicon/Logo dark.svg", media: "(prefers-color-scheme: dark)" },
    ],
    shortcut: "/images/favicon/Logo dark.svg",
    apple: "/images/favicon/Logo dark.svg",
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
        <SonnerToaster position="top-center" richColors />
      </body>
    </html>
  );
}



