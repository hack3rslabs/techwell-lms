import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, GraduationCap, Building, ArrowRight, CheckCircle2 } from 'lucide-react'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://techwell.co.in"

export const metadata: Metadata = {
  title: "Campus to Career & Corporate RTraining | Techwell",
  description: "Bridging the gap between colleges and tech MNCs. Host Campus Placement Drives, organize Corporate RTraining, and secure bulk hiring opportunities.",
  keywords: ["Campus Drives", "Campus to Career", "Corporate RTraining", "Bulk Hiring", "College Placements", "Techwell Campus"],
  alternates: {
    canonical: `${BASE_URL}/campus-to-career`,
  }
}

const campusJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Campus to Career & Corporate RTraining",
  description: "Host Campus Placement Drives and organize Corporate RTraining to bridge the gap between colleges and MNCs."
}

export default function CampusToCareerPage() {
    return (
        <>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(campusJsonLd) }}
        />
        <div className="bg-slate-50 dark:bg-[#030712] min-h-screen">
            
            {/* HERO SECTION */}
            <div className="bg-indigo-950 text-white py-24 px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/30 to-transparent blur-3xl -z-10"></div>
                <div className="max-w-6xl mx-auto relative z-10 text-center space-y-6">
                    <Badge className="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border-none px-4 py-2 uppercase tracking-widest font-bold">
                        Bridging The Gap
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-black">
                        Campus to <span className="text-indigo-400">Career</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto">
                        Empowering educational institutes with Corporate RTraining, AI-driven mock interviews, and guaranteed mass Campus Placement Drives with top-tier MNCs.
                    </p>
                    <div className="pt-8 flex flex-col sm:flex-row justify-center gap-4">
                        <Button asChild size="lg" className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold h-14 px-8 rounded-xl">
                            <Link href="/contact?type=campus">Partner your College</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="h-14 px-8 rounded-xl font-bold bg-white/10 border-white/20 hover:bg-white/20 text-white">
                            <Link href="/courses">View RTraining Modules</Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* FEATURES SECTION */}
            <div className="py-24 px-4 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white">Our Campus Ecosystem</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Block 1 */}
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6">
                            <GraduationCap className="h-7 w-7" />
                        </div>
                        <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Corporate RTraining</h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            Intensive technical skill development bridging the academic-industry gap. We bring corporate-level bootcamps directly to your campus.
                        </p>
                        <ul className="space-y-3">
                            {['Full Stack Development', 'AI & Machine Learning', 'Data Structures & Algos'].map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                                    <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Block 2 */}
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
                            <Users className="h-7 w-7" />
                        </div>
                        <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Campus Placement Drives</h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            We organize exclusive, large-scale hiring events connecting your students with our network of 500+ global tech partners.
                        </p>
                        <ul className="space-y-3">
                            {['Mass Hiring Events', 'On-Campus Assessments', 'Direct HR Interviews'].map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Block 3 */}
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="w-14 h-14 bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 rounded-2xl flex items-center justify-center mb-6">
                            <Building className="h-7 w-7" />
                        </div>
                        <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">MNC Readiness</h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            Equip students with the exact skills employers demand. Our platform offers AI mock interviews and resume optimization.
                        </p>
                        <ul className="space-y-3">
                            {['AI Interview Simulators', 'ATS-Friendly Resumes', 'Aptitude Test Prep'].map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                                    <CheckCircle2 className="w-5 h-5 text-sky-500 shrink-0" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* CTA SECTION */}
            <div className="bg-indigo-50 dark:bg-slate-900 border-t border-b border-indigo-100 dark:border-slate-800 py-16 text-center px-4">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-6">Ready to Transform Your Institute?</h2>
                <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-10 h-14 font-bold">
                    <Link href="/contact?type=campus">Schedule a Meeting <ArrowRight className="ml-2 w-5 h-5" /></Link>
                </Button>
            </div>
            
        </div>
        </>
    )
}
