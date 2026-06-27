import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, Lock, Activity, Server, ArrowUpRight, CheckCircle2, ShieldAlert } from 'lucide-react'

export default function CyberSecurityLandingPage({ data }: { data: any }) {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-emerald-500/30">
      
      {/* 1. IMMERSIVE HERO SECTION */}
      <section className="relative w-full h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden border-b border-emerald-900/30">
        <Image 
          src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2000"
          alt="Cyber Security Operations"
          fill
          className="object-cover opacity-40"
          unoptimized
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/40 via-[#020617]/80 to-[#020617]" />
        
        {/* Animated Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />

        <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 font-bold tracking-[0.2em] uppercase mb-8 px-5 py-2 shadow-sm backdrop-blur-md">
            <ShieldAlert className="w-4 h-4 mr-2 inline" /> Advanced Threat Defense
          </Badge>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-8 text-white drop-shadow-xl leading-tight">
            Impenetrable <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">Enterprise Security.</span>
          </h1>
          
          <p className="text-slate-400 text-lg md:text-2xl max-w-3xl mx-auto leading-relaxed font-light mb-12">
            Protect your global digital assets with military-grade encryption, zero-trust architecture, and 24/7 AI-driven threat monitoring. Backed by 10 years of elite cyber expertise.
          </p>

          <Button asChild size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-lg h-16 px-10 rounded-full shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] transition-all duration-300 group">
            <Link href={`/contact?service=Cyber Security`}>
              Secure Your Enterprise
              <ArrowUpRight className="ml-2 w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="border-b border-emerald-900/30 bg-[#040f24]/50 backdrop-blur-xl relative z-20 -mt-8 mx-4 md:mx-auto max-w-6xl rounded-3xl p-8 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-emerald-900/50">
          <div className="px-4">
            <div className="text-4xl font-black text-white mb-2">10+ Years</div>
            <div className="text-emerald-400 font-medium tracking-wide uppercase text-sm">Market Leadership</div>
          </div>
          <div className="px-4 pt-8 md:pt-0">
            <div className="text-4xl font-black text-white mb-2">24/7/365</div>
            <div className="text-emerald-400 font-medium tracking-wide uppercase text-sm">Active Threat Monitoring</div>
          </div>
          <div className="px-4 pt-8 md:pt-0">
            <div className="text-4xl font-black text-white mb-2">Zero</div>
            <div className="text-emerald-400 font-medium tracking-wide uppercase text-sm">Critical Breaches</div>
          </div>
        </div>
      </section>

      {/* SERVICES 3-COLUMN GRID */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">Our Core Security Services</h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto font-light">
            We deliver highly specialized, enterprise-grade security consulting and testing services to fortify every layer of your digital infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 1. WEB APP SECURITY TESTING */}
          <div className="bg-[#0f172a] rounded-[2.5rem] overflow-hidden border border-emerald-900/30 flex flex-col group hover:border-emerald-500/50 transition-all duration-500 shadow-[0_0_40px_-15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.2)]">
            <div className="relative h-64 w-full overflow-hidden">
              <Image 
                src="https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=800"
                alt="Web App Security Testing"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
            </div>
            <div className="p-8 flex flex-col flex-1">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 -mt-12 relative z-10 backdrop-blur-md">
                <Server className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Web App Security Testing</h3>
              <p className="text-slate-400 leading-relaxed mb-8 flex-1">
                We meticulously analyze your proprietary web applications to uncover hidden vulnerabilities—such as SQL injections, XSS, and flawed authentication mechanisms—before threat actors can exploit them.
              </p>
              <ul className="space-y-3 mt-auto pt-6 border-t border-emerald-900/30">
                {['Rigorous Penetration Testing', 'Vulnerability Assessments', 'Secure Code Review Services'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 2. ENDPOINT SECURITY SERVICES */}
          <div className="bg-[#0f172a] rounded-[2.5rem] overflow-hidden border border-emerald-900/30 flex flex-col group hover:border-emerald-500/50 transition-all duration-500 shadow-[0_0_40px_-15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.2)]">
            <div className="relative h-64 w-full overflow-hidden">
              <Image 
                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800"
                alt="Endpoint Security Services"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
            </div>
            <div className="p-8 flex flex-col flex-1">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 -mt-12 relative z-10 backdrop-blur-md">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Endpoint Security Services</h3>
              <p className="text-slate-400 leading-relaxed mb-8 flex-1">
                We provide comprehensive services to protect devices connected to your corporate network. From managing executive laptops to securing BYOD mobile devices, our service ensures every endpoint is monitored.
              </p>
              <ul className="space-y-3 mt-auto pt-6 border-t border-emerald-900/30">
                {['Endpoint Threat Monitoring', 'Security Policy Enforcement', 'Device Compliance Audits'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 3. NETWORK SECURITY SERVICES */}
          <div className="bg-[#0f172a] rounded-[2.5rem] overflow-hidden border border-emerald-900/30 flex flex-col group hover:border-emerald-500/50 transition-all duration-500 shadow-[0_0_40px_-15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.2)]">
            <div className="relative h-64 w-full overflow-hidden">
              <Image 
                src="https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=800"
                alt="Network Security Services"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
            </div>
            <div className="p-8 flex flex-col flex-1">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 -mt-12 relative z-10 backdrop-blur-md">
                <Activity className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Network Security Services</h3>
              <p className="text-slate-400 leading-relaxed mb-8 flex-1">
                Our services provide continuous monitoring and analysis of inbound and outbound corporate traffic. We actively investigate anomalous network behavior and implement protocols to prevent unauthorized access.
              </p>
              <ul className="space-y-3 mt-auto pt-6 border-t border-emerald-900/30">
                {['Network Traffic Analysis', 'Firewall Configuration', 'Intrusion Detection Support'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> {item}
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
          Do not wait for a breach.
        </h2>
        <p className="text-slate-400 text-lg md:text-xl mb-12">
          Let Techwell fortify your digital perimeter so you can confidently operate and aggressively expand your business with absolute, unshakeable confidence.
        </p>
        <Button asChild size="lg" className="bg-white text-slate-950 hover:bg-slate-200 font-bold text-lg h-16 px-12 rounded-full shadow-[0_0_40px_-10px_rgba(255,255,255,0.2)] transition-all duration-300">
          <Link href={`/contact?service=Cyber Security`}>
            Consult a Security Expert
            <ArrowUpRight className="ml-2 w-6 h-6" />
          </Link>
        </Button>
      </section>

    </div>
  )
}
