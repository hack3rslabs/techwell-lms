import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HeroSlider } from "@/components/sections/HeroSlider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { 
  GraduationCap, Laptop, Sparkles, Briefcase, ChevronRight, 
  CheckCircle2, Star, ArrowRight, Code2, Users, Building2,
  ShieldCheck, Server, Globe2, Rocket, Cpu, Calendar, TrendingUp
} from 'lucide-react'
import { Testimonials } from "@/components/sections/Testimonials"
import { PlacementPartners } from "@/components/sections/PlacementPartners"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://techwell.co.in"

export const metadata: Metadata = {
  title: "Techwell | Career & IT Consulting, Cyber Security & Franchise",
  description: "A complete ecosystem offering IT Training, Job Consultancy, Campus Placement Drives, Cyber Security Solutions, Managed IT Services, and Business Consulting.",
  keywords: ["IT Training Institute", "Job Consultancy", "Placement Assistance", "Campus Drives", "Cyber Security Solutions", "IT Solutions", "Business Consulting", "Franchise Opportunities"],
  alternates: {
    canonical: BASE_URL,
  }
}

// JSON-LD Structured Data
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Techwell",
  url: BASE_URL,
  description: "IT Training, Job Consultancy, Campus Placement Drives, Cyber Security Solutions, Managed IT Services, and Business Consulting.",
  sameAs: [
    "https://www.linkedin.com/company/techwell"
  ]
}

export default function Home() {
  const businessPillars = [
    {
      title: "IT & Corporate Training",
      icon: <GraduationCap className="h-8 w-8 text-indigo-400" />,
      desc: "Accelerate your career with expert-led tech training, rigorous coding bootcamps, and corporate RTraining programs.",
      href: "/courses",
      actionText: "Explore Curriculum",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/20",
      glowColor: "group-hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)]",
      bullets: ["Industry-Curated Syllabus", "Live Coding Sessions", "Corporate RTraining", "Capstone Projects"]
    },
    {
      title: "Job Consultancy & Assistance",
      icon: <Briefcase className="h-8 w-8 text-emerald-400" />,
      desc: "Comprehensive career guidance, AI resume building, and direct interview scheduling with top MNCs.",
      href: "/consultancy",
      actionText: "Get Job Assistance",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      glowColor: "group-hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]",
      bullets: ["AI Resume Builder", "Mock Interviews", "Dedicated Career Coach", "Guaranteed Referrals"]
    },
    {
      title: "Campus Placement Drives",
      icon: <Users className="h-8 w-8 text-purple-400" />,
      desc: "Bridging the gap between colleges and tech companies through organized mass hiring events and assessments.",
      href: "/campus-to-career",
      actionText: "Host a Drive",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
      glowColor: "group-hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)]",
      bullets: ["Bulk Candidate Screening", "On-Campus Interviews", "Skill Gap Bridging", "Corporate Tie-ups"]
    },
    {
      title: "Custom Software Solutions",
      icon: <Code2 className="h-8 w-8 text-sky-400" />,
      desc: "Bespoke SaaS engineering, enterprise ERPs, and high-performance digital products engineered for scale.",
      href: "/products",
      actionText: "Discover Products",
      bgColor: "bg-sky-500/10",
      borderColor: "border-sky-500/20",
      glowColor: "group-hover:shadow-[0_0_30px_-5px_rgba(14,165,233,0.3)]",
      bullets: ["Web & Mobile Apps", "Scalable Architectures", "Modern UI/UX Design", "E-commerce & CRMs"]
    },
    {
      title: "Cyber Security Solutions",
      icon: <ShieldCheck className="h-8 w-8 text-red-400" />,
      desc: "Robust protection for your enterprise data. We conduct audits, pentesting, and implement zero-trust architectures.",
      href: "/services/cyber-security",
      actionText: "Secure Your Business",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
      glowColor: "group-hover:shadow-[0_0_30px_-5px_rgba(239,68,68,0.3)]",
      bullets: ["Vulnerability Audits", "Firewall Management", "Data Encryption", "Compliance (GDPR)"]
    },
    {
      title: "Managed IT Solutions",
      icon: <Server className="h-8 w-8 text-amber-400" />,
      desc: "End-to-end IT infrastructure consulting, cloud managed services, and networking for modern enterprises.",
      href: "/services",
      actionText: "Request Consultation",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      glowColor: "group-hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)]",
      bullets: ["Cloud Migration", "Managed IT AMC", "Network Architecture", "Disaster Recovery"]
    },
    {
      title: "IT & Business Consulting",
      icon: <TrendingUp className="h-8 w-8 text-teal-400" />,
      desc: "Strategic guidance to accelerate your digital transformation, optimize workflows, and scale operations globally.",
      href: "/consultancy",
      actionText: "Book Strategy Call",
      bgColor: "bg-teal-500/10",
      borderColor: "border-teal-500/20",
      glowColor: "group-hover:shadow-[0_0_30px_-5px_rgba(20,184,166,0.3)]",
      bullets: ["Digital Transformation", "Operational Scaling", "Process Automation", "Market Strategy"]
    },
    {
      title: "Franchise Opportunities",
      icon: <Building2 className="h-8 w-8 text-orange-400" />,
      desc: "Start your own successful IT training and consulting branch with our proven, high-ROI franchise model.",
      href: "/franchise-request",
      actionText: "Become a Partner",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
      glowColor: "group-hover:shadow-[0_0_30px_-5px_rgba(249,115,22,0.3)]",
      bullets: ["Brand Association", "Turnkey Setup", "Marketing Support", "Curriculum Access"]
    }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      
      <div className="flex flex-col gap-0 overflow-x-hidden bg-slate-50 dark:bg-[#030712] font-sans selection:bg-indigo-500/30">
        
        {/* ULTRA-PREMIUM HERO SECTION SLIDER */}
        <HeroSlider />

        {/* EVENTS & WEBINARS HIGHLIGHT BANNER */}
        <section className="bg-indigo-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
          <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/50 to-transparent pointer-events-none"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2 rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-white font-bold text-lg">Upcoming: Future of Cyber Security & AI</h4>
                <p className="text-indigo-200 text-sm">Join our exclusive live corporate webinar. Limited seats available!</p>
              </div>
            </div>
            <Button asChild variant="secondary" className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold whitespace-nowrap">
              <Link href="/events">
                Register Now
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </section>

        {/* 8 CORE PILLARS SECTION - BENTO GRID STYLE */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto space-y-6 mb-16">
            <h2 className="text-sm font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">Our Expertise</h2>
            <h3 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              End-to-End <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-teal-400">IT Excellence</span>
            </h3>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              From molding the next generation of software developers and providing top-tier job consultancy, to engineering mission-critical cyber security solutions for enterprises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {businessPillars.map((pillar, idx) => (
              <div 
                key={pillar.title} 
                className={`group relative bg-white dark:bg-[#0B1121] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 hover:-translate-y-2 transition-all duration-500 ${pillar.glowColor} flex flex-col`}
              >
                {/* Background Accent */}
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full -z-10 transition-opacity duration-500 opacity-50 group-hover:opacity-100 ${pillar.bgColor}`}></div>
                
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border transition-transform duration-500 group-hover:scale-110 ${pillar.bgColor} ${pillar.borderColor}`}>
                  {pillar.icon}
                </div>
                
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{pillar.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 leading-relaxed flex-1">
                  {pillar.desc}
                </p>
                
                <ul className="space-y-3 mb-16">
                  {pillar.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="font-medium leading-tight">{b}</span>
                    </li>
                  ))}
                </ul>

                <div className="absolute bottom-8 left-8 right-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <Link href={pillar.href} className="inline-flex items-center text-sm font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group/link">
                    {pillar.actionText}
                    <ChevronRight className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* DUAL TARGET AUDIENCE SECTION */}
        <section className="py-24 bg-slate-900 dark:bg-[#020617] text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              
              {/* For Students Block */}
              <div className="space-y-8 bg-white/5 backdrop-blur-sm border border-white/10 p-10 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full group-hover:bg-indigo-500/30 transition-colors duration-700"></div>
                <Badge className="bg-indigo-500 text-white border-none font-bold tracking-widest uppercase mb-4">For Individuals</Badge>
                <h3 className="text-3xl md:text-4xl font-black leading-tight">Master Code.<br/>Secure Placements.</h3>
                <p className="text-slate-300 text-lg leading-relaxed">
                  Join the ultimate Career Hub. Our intensive IT Training Institute prepares you for the industry, while our Placement Assistance team ensures you land your dream job.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 bg-black/20 p-4 rounded-xl border border-white/5">
                    <div className="bg-indigo-500/20 p-3 rounded-lg"><Rocket className="w-6 h-6 text-indigo-400" /></div>
                    <div>
                      <h5 className="font-bold">Guaranteed Interviews</h5>
                      <p className="text-sm text-slate-400">Direct referrals to our 500+ hiring partners.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-black/20 p-4 rounded-xl border border-white/5">
                    <div className="bg-indigo-500/20 p-3 rounded-lg"><Laptop className="w-6 h-6 text-indigo-400" /></div>
                    <div>
                      <h5 className="font-bold">Real-World Projects</h5>
                      <p className="text-sm text-slate-400">Build software that actually matters.</p>
                    </div>
                  </div>
                </div>
                <Button asChild className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600 text-white font-bold h-12 px-8 rounded-xl mt-4">
                  <Link href="/courses">Explore IT Training</Link>
                </Button>
              </div>

              {/* For Businesses Block */}
              <div className="space-y-8 bg-white/5 backdrop-blur-sm border border-white/10 p-10 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/20 blur-[80px] rounded-full group-hover:bg-sky-500/30 transition-colors duration-700"></div>
                <Badge className="bg-sky-500 text-white border-none font-bold tracking-widest uppercase mb-4">For Enterprises</Badge>
                <h3 className="text-3xl md:text-4xl font-black leading-tight">Scale Operations.<br/>Hire Top Tech Talent.</h3>
                <p className="text-slate-300 text-lg leading-relaxed">
                  From custom Software Solutions and SaaS ERPs to comprehensive IT Solutions & AMCs. We also provide highly vetted, trained talent for your workforce.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 bg-black/20 p-4 rounded-xl border border-white/5">
                    <div className="bg-sky-500/20 p-3 rounded-lg"><Server className="w-6 h-6 text-sky-400" /></div>
                    <div>
                      <h5 className="font-bold">IT Infrastructure</h5>
                      <p className="text-sm text-slate-400">Cloud migrations, networking, and security.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-black/20 p-4 rounded-xl border border-white/5">
                    <div className="bg-sky-500/20 p-3 rounded-lg"><Code2 className="w-6 h-6 text-sky-400" /></div>
                    <div>
                      <h5 className="font-bold">Custom SaaS Development</h5>
                      <p className="text-sm text-slate-400">Web apps, mobile apps, and enterprise ERPs.</p>
                    </div>
                  </div>
                </div>
                <Button asChild className="w-full sm:w-auto bg-sky-500 hover:bg-sky-600 text-white font-bold h-12 px-8 rounded-xl mt-4">
                  <Link href="/contact?type=it-solutions">Request IT Solutions</Link>
                </Button>
              </div>

            </div>
          </div>
        </section>

        {/* TESTIMONIALS & PARTNERS SECTIONS */}
        <div className="bg-slate-50 dark:bg-[#030712] relative z-20 shadow-[0_-20px_50px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_-20px_50px_-15px_rgba(0,0,0,0.5)]">
          <Testimonials />
          <div className="border-t border-slate-200 dark:border-slate-800/60">
            <PlacementPartners />
          </div>
        </div>

      </div>
    </>
  );
}
