import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Code2, ArrowUpRight, CheckCircle2, Layout, Smartphone, Network } from 'lucide-react'

export default function SoftwareSolutionsLandingPage({ data }: { data: any }) {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-purple-500/30">
      
      {/* 1. IMMERSIVE HERO SECTION */}
      <section className="relative w-full h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden border-b border-purple-900/30">
        <Image 
          src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=2000"
          alt="Enterprise Software Development"
          fill
          className="object-cover opacity-40"
          unoptimized
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/40 via-[#020617]/80 to-[#020617]" />
        
        {/* Animated Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />

        <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20 font-bold tracking-[0.2em] uppercase mb-8 px-5 py-2 shadow-sm backdrop-blur-md">
            <Code2 className="w-4 h-4 mr-2 inline" /> Scalable Architectures
          </Badge>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-8 text-white drop-shadow-xl leading-tight">
            Custom Engineered <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">Software.</span>
          </h1>
          
          <p className="text-slate-400 text-lg md:text-2xl max-w-3xl mx-auto leading-relaxed font-light mb-12">
            Automate business workflows and eliminate operational bottlenecks with our bespoke ERP systems, high-performance web apps, and modern mobile applications.
          </p>

          <Button asChild size="lg" className="bg-purple-500 hover:bg-purple-600 text-white font-bold text-lg h-16 px-10 rounded-full shadow-[0_0_40px_-10px_rgba(168,85,247,0.5)] transition-all duration-300 group">
            <Link href={`/contact?service=Software Solutions`}>
              Discuss Your Project
              <ArrowUpRight className="ml-2 w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="border-b border-purple-900/30 bg-[#040f24]/50 backdrop-blur-xl relative z-20 -mt-8 mx-4 md:mx-auto max-w-6xl rounded-3xl p-8 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-purple-900/50">
          <div className="px-4">
            <div className="text-4xl font-black text-white mb-2">10+ Years</div>
            <div className="text-purple-400 font-medium tracking-wide uppercase text-sm">Development Expertise</div>
          </div>
          <div className="px-4 pt-8 md:pt-0">
            <div className="text-4xl font-black text-white mb-2">Zero</div>
            <div className="text-purple-400 font-medium tracking-wide uppercase text-sm">Off-the-shelf Compromises</div>
          </div>
          <div className="px-4 pt-8 md:pt-0">
            <div className="text-4xl font-black text-white mb-2">100%</div>
            <div className="text-purple-400 font-medium tracking-wide uppercase text-sm">Bespoke Solutions</div>
          </div>
        </div>
      </section>

      {/* SERVICES 2x2 GRID */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">Our Software Services</h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto font-light">
            From complex enterprise integrations to sleek mobile interfaces, we build technology that adapts to your business workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          
          {/* 1. ERP SOLUTIONS */}
          <div className="bg-[#0f172a] rounded-[2.5rem] overflow-hidden border border-purple-900/30 flex flex-col group hover:border-purple-500/50 transition-all duration-500 shadow-[0_0_40px_-15px_rgba(168,85,247,0.1)] hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.2)]">
            <div className="relative h-72 w-full overflow-hidden">
              <Image 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800"
                alt="ERP Solutions"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
            </div>
            <div className="p-8 flex flex-col flex-1">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 -mt-12 relative z-10 backdrop-blur-md">
                <Network className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">ERP Solutions</h3>
              <p className="text-slate-400 leading-relaxed mb-8 flex-1">
                We engineer comprehensive Enterprise Resource Planning systems that unify fragmented corporate departments into a single, cohesive, highly efficient operational engine.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto pt-6 border-t border-purple-900/30">
                {['Workflow Automation', 'Department Unification', 'Data Centralization', 'Custom Reporting'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 2. CUSTOM SOFTWARE */}
          <div className="bg-[#0f172a] rounded-[2.5rem] overflow-hidden border border-purple-900/30 flex flex-col group hover:border-purple-500/50 transition-all duration-500 shadow-[0_0_40px_-15px_rgba(168,85,247,0.1)] hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.2)]">
            <div className="relative h-72 w-full overflow-hidden">
              <Image 
                src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800"
                alt="Custom Software"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
            </div>
            <div className="p-8 flex flex-col flex-1">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 -mt-12 relative z-10 backdrop-blur-md">
                <Code2 className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Custom Software</h3>
              <p className="text-slate-400 leading-relaxed mb-8 flex-1">
                Generic, off-the-shelf software consistently fails to address highly nuanced business demands. We engineer completely bespoke software specifically tailored to eliminate your operational bottlenecks.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto pt-6 border-t border-purple-900/30">
                {['Bespoke Architecture', 'Legacy Modernization', 'API Integrations', 'Problem-solving Tools'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 3. WEB DEVELOPMENT */}
          <div className="bg-[#0f172a] rounded-[2.5rem] overflow-hidden border border-purple-900/30 flex flex-col group hover:border-purple-500/50 transition-all duration-500 shadow-[0_0_40px_-15px_rgba(168,85,247,0.1)] hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.2)]">
            <div className="relative h-72 w-full overflow-hidden">
              <Image 
                src="https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&q=80&w=800"
                alt="Web Development"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
            </div>
            <div className="p-8 flex flex-col flex-1">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 -mt-12 relative z-10 backdrop-blur-md">
                <Layout className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Web Development</h3>
              <p className="text-slate-400 leading-relaxed mb-8 flex-1">
                Our portfolio includes robust web development projects that create deeply engaging digital storefronts, incredibly high-performance SaaS platforms, and dynamic corporate portals.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto pt-6 border-t border-purple-900/30">
                {['Enterprise Web Portals', 'SaaS Platform Dev', 'React / Next.js', 'Responsive UI/UX'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 4. APPLICATION DEVELOPMENT */}
          <div className="bg-[#0f172a] rounded-[2.5rem] overflow-hidden border border-purple-900/30 flex flex-col group hover:border-purple-500/50 transition-all duration-500 shadow-[0_0_40px_-15px_rgba(168,85,247,0.1)] hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.2)]">
            <div className="relative h-72 w-full overflow-hidden">
              <Image 
                src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=800"
                alt="Application Development"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
            </div>
            <div className="p-8 flex flex-col flex-1">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 -mt-12 relative z-10 backdrop-blur-md">
                <Smartphone className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Application Development</h3>
              <p className="text-slate-400 leading-relaxed mb-8 flex-1">
                We build powerful native and cross-platform mobile applications. Our apps deliver seamless user experiences, flawless backend integrations, and unmatched performance across all devices.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto pt-6 border-t border-purple-900/30">
                {['iOS / Android Apps', 'Cross-Platform', 'Mobile UI/UX Design', 'API Backends'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-8">
          Stop adapting to your software.
        </h2>
        <p className="text-slate-400 text-lg md:text-xl mb-12">
          Let Techwell engineer robust custom solutions that seamlessly adapt to your unique business workflows instead.
        </p>
        <Button asChild size="lg" className="bg-white text-slate-950 hover:bg-slate-200 font-bold text-lg h-16 px-12 rounded-full shadow-[0_0_40px_-10px_rgba(255,255,255,0.2)] transition-all duration-300">
          <Link href={`/contact?service=Software Solutions`}>
            Consult Our Engineering Team
            <ArrowUpRight className="ml-2 w-6 h-6" />
          </Link>
        </Button>
      </section>

    </div>
  )
}
