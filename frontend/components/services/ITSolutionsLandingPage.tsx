import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Server, ArrowUpRight, CheckCircle2, MonitorSmartphone, Settings, Zap } from 'lucide-react'

export default function ITSolutionsLandingPage({ data }: { data: any }) {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-indigo-500/30">
      
      {/* 1. IMMERSIVE HERO SECTION */}
      <section className="relative w-full h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden border-b border-indigo-900/30">
        <Image 
          src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=2000"
          alt="Enterprise IT Infrastructure"
          fill
          className="object-cover opacity-40"
          unoptimized
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/40 via-[#020617]/80 to-[#020617]" />
        
        {/* Animated Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />

        <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20 font-bold tracking-[0.2em] uppercase mb-8 px-5 py-2 shadow-sm backdrop-blur-md">
            <Zap className="w-4 h-4 mr-2 inline" /> Enterprise Grade
          </Badge>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-8 text-white drop-shadow-xl leading-tight">
            Unshakeable <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-600">IT Foundations.</span>
          </h1>
          
          <p className="text-slate-400 text-lg md:text-2xl max-w-3xl mx-auto leading-relaxed font-light mb-12">
            Transform your corporate backbone with world-class Infra Solutions, dedicated IT Support, and seamless Hardware Installation & Maintenance.
          </p>

          <Button asChild size="lg" className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-lg h-16 px-10 rounded-full shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] transition-all duration-300 group">
            <Link href={`/contact?service=IT Solutions`}>
              Optimize Your Infrastructure
              <ArrowUpRight className="ml-2 w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="border-b border-indigo-900/30 bg-[#040f24]/50 backdrop-blur-xl relative z-20 -mt-8 mx-4 md:mx-auto max-w-6xl rounded-3xl p-8 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-indigo-900/50">
          <div className="px-4">
            <div className="text-4xl font-black text-white mb-2">10+ Years</div>
            <div className="text-indigo-400 font-medium tracking-wide uppercase text-sm">Market Experience</div>
          </div>
          <div className="px-4 pt-8 md:pt-0">
            <div className="text-4xl font-black text-white mb-2">99.99%</div>
            <div className="text-indigo-400 font-medium tracking-wide uppercase text-sm">Infrastructure Uptime</div>
          </div>
          <div className="px-4 pt-8 md:pt-0">
            <div className="text-4xl font-black text-white mb-2">24/7</div>
            <div className="text-indigo-400 font-medium tracking-wide uppercase text-sm">Dedicated IT Support</div>
          </div>
        </div>
      </section>

      {/* SERVICES 3-COLUMN GRID */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">Our Core IT Services</h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto font-light">
            We provide specialized, high-performance IT solutions that allow your enterprise to scale rapidly without technical bottlenecks.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 1. INFRA SOLUTIONS */}
          <div className="bg-[#0f172a] rounded-[2.5rem] overflow-hidden border border-indigo-900/30 flex flex-col group hover:border-indigo-500/50 transition-all duration-500 shadow-[0_0_40px_-15px_rgba(99,102,241,0.1)] hover:shadow-[0_0_40px_-10px_rgba(99,102,241,0.2)]">
            <div className="relative h-64 w-full overflow-hidden">
              <Image 
                src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800"
                alt="Infra Solutions"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
            </div>
            <div className="p-8 flex flex-col flex-1">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 -mt-12 relative z-10 backdrop-blur-md">
                <Server className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Infra Solutions</h3>
              <p className="text-slate-400 leading-relaxed mb-8 flex-1">
                We design and deploy robust server architectures and cloud-ready infrastructure solutions. Our focus is ensuring your corporate network can handle rapid scaling with absolute reliability and speed.
              </p>
              <ul className="space-y-3 mt-auto pt-6 border-t border-indigo-900/30">
                {['Server Architecture Design', 'Data Center Optimization', 'Cloud Infrastructure Setup'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 2. IT SUPPORT */}
          <div className="bg-[#0f172a] rounded-[2.5rem] overflow-hidden border border-indigo-900/30 flex flex-col group hover:border-indigo-500/50 transition-all duration-500 shadow-[0_0_40px_-15px_rgba(99,102,241,0.1)] hover:shadow-[0_0_40px_-10px_rgba(99,102,241,0.2)]">
            <div className="relative h-64 w-full overflow-hidden">
              <Image 
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800"
                alt="IT Support"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
            </div>
            <div className="p-8 flex flex-col flex-1">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 -mt-12 relative z-10 backdrop-blur-md">
                <MonitorSmartphone className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">IT Support</h3>
              <p className="text-slate-400 leading-relaxed mb-8 flex-1">
                Our elite engineering team handles everything from minor configuration glitches to catastrophic failures. With our advanced remote support capabilities, we resolve issues in real-time, minimizing corporate downtime.
              </p>
              <ul className="space-y-3 mt-auto pt-6 border-t border-indigo-900/30">
                {['Remote IT Troubleshooting', 'Helpdesk Services', 'Executive Workstation Support'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 3. INSTALLATION & MAINTENANCE */}
          <div className="bg-[#0f172a] rounded-[2.5rem] overflow-hidden border border-indigo-900/30 flex flex-col group hover:border-indigo-500/50 transition-all duration-500 shadow-[0_0_40px_-15px_rgba(99,102,241,0.1)] hover:shadow-[0_0_40px_-10px_rgba(99,102,241,0.2)]">
            <div className="relative h-64 w-full overflow-hidden">
              <Image 
                src="https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=800"
                alt="Installation and Maintenance"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
            </div>
            <div className="p-8 flex flex-col flex-1">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 -mt-12 relative z-10 backdrop-blur-md">
                <Settings className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Installation & Maintenance</h3>
              <p className="text-slate-400 leading-relaxed mb-8 flex-1">
                We provide hands-on hardware installations and strict Annual Maintenance Contracts (AMC). Our physical deployments cover everything from high-speed cabling to clustered server racks.
              </p>
              <ul className="space-y-3 mt-auto pt-6 border-t border-indigo-900/30">
                {['Annual Maintenance Contracts (AMC)', 'Hardware Infrastructure Deployment', 'Fiber Optic Cabling'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* 5. FINAL CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-8">
          Ready to scale your enterprise?
        </h2>
        <p className="text-slate-400 text-lg md:text-xl mb-12">
          Let Techwell build the unshakeable digital foundation you need to operate efficiently and grow without technical limitations.
        </p>
        <Button asChild size="lg" className="bg-white text-slate-950 hover:bg-slate-200 font-bold text-lg h-16 px-12 rounded-full shadow-[0_0_40px_-10px_rgba(255,255,255,0.2)] transition-all duration-300">
          <Link href={`/contact?service=IT Solutions`}>
            Speak to an IT Expert
            <ArrowUpRight className="ml-2 w-6 h-6" />
          </Link>
        </Button>
      </section>

    </div>
  )
}
