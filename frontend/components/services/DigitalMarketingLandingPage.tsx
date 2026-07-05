import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowUpRight, BarChart, Globe, Search, Smartphone, CheckCircle2 } from 'lucide-react'
import DOMPurify from 'isomorphic-dompurify'

export default function DigitalMarketingLandingPage({ data }: { data: any }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] font-sans selection:bg-amber-500/30 pb-12">
      
      {/* IMMERSIVE HERO SECTION */}
      <section className="relative w-full h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        {data.image && (
          <Image 
            src={data.image}
            alt={data.title}
            fill
            className="object-cover"
            unoptimized
            priority
          />
        )}
        <div className="absolute inset-0 bg-slate-900/80 dark:bg-[#030712]/90 backdrop-blur-[2px]" />
        
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center animate-in fade-in slide-in-from-bottom-8 duration-1000 w-full pt-16">
          <Badge className="bg-white/10 text-white border-white/20 hover:bg-white/20 font-bold tracking-[0.2em] uppercase mb-8 px-5 py-2 shadow-sm backdrop-blur-md">
            Techwell Premium Services
          </Badge>
          
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight mb-6 text-white drop-shadow-xl">
            <span className="text-amber-500">Digital</span> Marketing
          </h1>
          
          <p className="text-slate-200 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-light drop-shadow-md">
            {data.shortDesc}
          </p>
        </div>
      </section>

      {/* TWO-COLUMN CONTENT LAYOUT */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT: DEEP CONTENT (8 columns) */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[2rem] lg:rounded-[2.5rem] p-6 sm:p-8 md:p-12 shadow-2xl border border-slate-100 dark:border-slate-800/60 space-y-16 animate-in fade-in duration-1000 delay-200">
            
            {/* Introduction */}
            <div className="prose prose-lg dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight max-w-none">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="p-3 rounded-2xl w-14 h-14 flex items-center justify-center shrink-0 text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-amber-500/20">
                  <Globe className="w-8 h-8" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white m-0">
                  Dominate Your Market Online
                </h2>
              </div>
              <p 
                className="text-slate-600 dark:text-slate-300 leading-loose text-[17px] font-light"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data.content.introduction) }}
              />
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <Search className="w-8 h-8 text-amber-500 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">SEO Dominance</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Rank at the top of search engines for keywords that drive actual revenue and targeted traffic.</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <Smartphone className="w-8 h-8 text-amber-500 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Social Strategy</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Build a massive, highly engaged community across all relevant social platforms tailored to your brand.</p>
              </div>
            </div>

            {/* In-content feature image */}
            {data.inlineImage && (
              <div className="w-full h-[350px] md:h-[450px] relative rounded-[2rem] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 group transition-all duration-700 hover:shadow-amber-500/10">
                <Image 
                  src={data.inlineImage}
                  alt={`${data.title} Expertise`}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />
              </div>
            )}

            {/* Methodology */}
            <div className="prose prose-lg dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight max-w-none">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="p-3 rounded-2xl w-14 h-14 flex items-center justify-center shrink-0 text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-amber-500/20">
                  <BarChart className="w-8 h-8" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white m-0">
                  Data-Driven Execution
                </h2>
              </div>
              <p 
                className="text-slate-600 dark:text-slate-300 leading-loose text-[17px] font-light"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data.content.methodology) }}
              />
            </div>

          </div>

          {/* RIGHT: STICKY SIDEBAR (4 columns) */}
          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24 mb-12 lg:mb-0">
            
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-8 shadow-xl border border-slate-100 dark:border-slate-800/60">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <span className="w-2 h-8 rounded-full bg-amber-500" />
                Key Deliverables
              </h3>
              <div className="space-y-4">
                {data.content.features.map((feature: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 group">
                    <div className="p-2 rounded-lg shrink-0 mt-0.5 transition-colors bg-amber-500/10 text-amber-500">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-[15px] leading-relaxed text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] p-6 sm:p-8 shadow-xl border relative overflow-hidden bg-amber-500/10 border-amber-500/20">
              <div className="relative z-10 space-y-6">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Ready to elevate your enterprise?
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Connect directly with our elite marketing and strategy team to discuss how we can accelerate your growth.
                </p>
                <Button asChild className="w-full font-bold shadow-md h-12 bg-amber-600 hover:bg-amber-700 text-white">
                  <Link href={`/contact?service=${encodeURIComponent(data.title)}`}>
                    Enquire Now
                    <ArrowUpRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  )
}
