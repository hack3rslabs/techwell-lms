import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, Briefcase, ChevronRight, 
  CheckCircle2, Users, Target, Rocket, Lightbulb
} from 'lucide-react'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://techwell.co.in"

export const metadata: Metadata = {
  title: "IT & Business Consulting | Job Assistance | Techwell",
  description: "Accelerate your career and business with Techwell's expert Job Consultancy, Placement Assistance, and Enterprise IT & Business Strategy Consulting.",
  keywords: ["Job Consultancy", "Placement Assistance", "Business Consulting", "IT Strategy", "Career Hub", "Techwell Consulting"],
  alternates: {
    canonical: `${BASE_URL}/consultancy`,
  }
}

const consultancyJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "IT & Business Consulting and Job Assistance",
  provider: {
    "@type": "Organization",
    name: "Techwell"
  },
  description: "Expert Job Consultancy, Placement Assistance, and Enterprise IT & Business Strategy Consulting.",
  areaServed: "Global"
}

export default function ConsultancyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(consultancyJsonLd) }}
      />
      <div className="bg-slate-50 dark:bg-[#030712] min-h-screen">
        
        {/* HERO SECTION */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay z-0"></div>
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-teal-500/20 to-transparent blur-3xl -z-10"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <Badge className="bg-teal-500/10 text-teal-600 dark:text-teal-400 hover:bg-teal-500/20 border-none px-4 py-2 text-sm mb-8">
              Expert Guidance
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white mb-6">
              Empowering <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-400">Careers & Business</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
              Whether you're a professional seeking 100% placement assistance or an enterprise needing digital transformation strategy, our consultancy experts are here to guide you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-teal-500 hover:bg-teal-600 text-white font-bold h-14 px-8 rounded-xl">
                <Link href="/contact?type=business-consulting">Business Consulting <ChevronRight className="w-5 h-5 ml-2" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 px-8 rounded-xl font-bold border-slate-200 dark:border-slate-800">
                <Link href="/register">Join Career Hub</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* DUAL OFFERINGS SECTION */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Job Assistance Block */}
            <div className="bg-white dark:bg-[#0B1121] p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full group-hover:bg-indigo-500/20 transition-colors duration-700"></div>
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-8 border border-indigo-200 dark:border-indigo-500/30">
                <Briefcase className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Job Consultancy & Assistance</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                Land your dream job with our comprehensive career placement services. We prepare you for the industry and connect you directly with hiring managers.
              </p>
              <ul className="space-y-4 mb-8">
                {['AI-Powered Resume Building', 'MNC Mock Interview Simulations', '1-on-1 Career Mentorship', 'Direct Referrals to 500+ Hiring Partners'].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-6 h-6 text-indigo-500 shrink-0" />
                    <span className="font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button asChild variant="default" className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 rounded-xl">
                <Link href="/register">Start Your Career Journey</Link>
              </Button>
            </div>

            {/* Business Consulting Block */}
            <div className="bg-white dark:bg-[#0B1121] p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full group-hover:bg-emerald-500/20 transition-colors duration-700"></div>
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-8 border border-emerald-200 dark:border-emerald-500/30">
                <TrendingUp className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">IT & Business Consulting</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                Transform your business operations with our expert IT strategists. We help enterprises scale, automate, and secure their digital infrastructure.
              </p>
              <ul className="space-y-4 mb-8">
                {['Digital Transformation Strategy', 'Operational Scaling & Automation', 'Risk Assessment & Cyber Strategy', 'Technology Stack Optimization'].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                    <span className="font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button asChild variant="default" className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 rounded-xl">
                <Link href="/contact?type=consulting">Book a Strategy Call</Link>
              </Button>
            </div>

          </div>
        </section>

      </div>
    </>
  )
}
