import type { Metadata } from "next"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://techwell.co.in"

export const metadata: Metadata = {
  title: "IT Solutions & Cyber Security Services | Techwell",
  description:
    "Enterprise IT solutions, Custom Software Development, Cyber Security audits, and AI Automation services for scaling businesses.",
  keywords: [
    "IT Solutions",
    "Cyber Security",
    "Software Development",
    "IT Infrastructure",
    "Maintenance Support",
  ],
  alternates: {
    canonical: `${BASE_URL}/services`,
  },
}

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
