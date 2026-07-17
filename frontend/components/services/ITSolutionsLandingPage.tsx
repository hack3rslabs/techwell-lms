"use client";
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Server, ArrowUpRight, CheckCircle2, MonitorSmartphone, Settings, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ITSolutionsLandingPage({ data }: { data: any }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 50, damping: 15 } }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-indigo-500/30">
      
      {/* 1. IMMERSIVE HERO SECTION */}
      <section className="relative w-full h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden border-b border-indigo-900/30">
        <Image 
          src="https://images.unsplash.com/photo-1649364947471-4043b4684a0d?auto=format&fit=crop&q=80&w=2000" // Modern IT Data Center
          alt="Enterprise IT Infrastructure"
          fill
          className="object-cover opacity-30 mix-blend-screen"
          unoptimized
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/50 via-[#020617]/80 to-[#020617]" />
        
        {/* Animated Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />

        <motion.div 
          initial="hidden" animate="visible" variants={containerVariants}
          className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center"
        >
          <motion.div variants={itemVariants}>
            <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20 font-bold tracking-[0.2em] uppercase mb-8 px-5 py-2 shadow-sm backdrop-blur-md">
              <Zap className="w-4 h-4 mr-2 inline" /> Enterprise Grade
            </Badge>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-8 text-white drop-shadow-xl leading-tight">
            Unshakeable <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-600">IT Foundations.</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-slate-400 text-lg md:text-2xl max-w-3xl mx-auto leading-relaxed font-light mb-12">
            Transform your corporate backbone with world-class Infra Solutions, dedicated IT Support, and seamless Hardware Installation & Maintenance.
          </motion.p>

          <motion.div variants={itemVariants}>
            <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg h-16 px-10 rounded-full shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] transition-all duration-300 group">
              <Link href={`/contact?service=IT Solutions`}>
                Optimize Your Infrastructure
                <ArrowUpRight className="ml-2 w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* STATS STRIP */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
        className="border-b border-indigo-900/30 bg-[#040f24]/50 backdrop-blur-xl relative z-20 -mt-8 mx-4 md:mx-auto max-w-6xl rounded-3xl p-8 shadow-2xl"
      >
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
      </motion.section>

      {/* SERVICES 3-COLUMN GRID */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">Our Core IT Services</h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto font-light leading-relaxed">
            We provide specialized, high-performance IT solutions that allow your enterprise to scale rapidly without technical bottlenecks.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* 1. NETWORKING & FIREWALL SECURITY */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-[#0f172a] rounded-[2.5rem] overflow-hidden border border-indigo-900/30 flex flex-col group hover:border-indigo-500/50 transition-all duration-500 shadow-[0_0_40px_-15px_rgba(99,102,241,0.1)] hover:shadow-[0_0_40px_-10px_rgba(99,102,241,0.2)]"
          >
            <div className="relative h-72 w-full overflow-hidden">
              <Image 
                src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800" // IT Servers/Networking
                alt="Networking and Firewall Security"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
            </div>
            <div className="p-10 flex flex-col flex-1">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 -mt-16 relative z-10 backdrop-blur-md">
                <Settings className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Networking & Firewall Security</h3>
              <p className="text-slate-400 leading-relaxed mb-8 flex-1 text-lg">
                Establish a rock-solid, impenetrable digital perimeter. We deploy highly secure networking infrastructure and enterprise-grade firewalls to keep your corporate data safe from modern cyber threats while ensuring maximum throughput.
              </p>
              <ul className="space-y-4 mt-auto pt-8 border-t border-indigo-900/30">
                {['Enterprise Networking Setup', 'Next-Gen Firewall Deployment', 'VPN & Secure Remote Access'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* 2. HARDWARE & SERVERS (SALES & RENTALS) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-[#0f172a] rounded-[2.5rem] overflow-hidden border border-indigo-900/30 flex flex-col group hover:border-indigo-500/50 transition-all duration-500 shadow-[0_0_40px_-15px_rgba(99,102,241,0.1)] hover:shadow-[0_0_40px_-10px_rgba(99,102,241,0.2)]"
          >
            <div className="relative h-72 w-full overflow-hidden">
              <Image 
                src="https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&q=80&w=800" // Desktop & Laptop IT
                alt="Hardware and Servers"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
            </div>
            <div className="p-10 flex flex-col flex-1">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 -mt-16 relative z-10 backdrop-blur-md">
                <Server className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Hardware & Server Deployments</h3>
              <p className="text-slate-400 leading-relaxed mb-8 flex-1 text-lg">
                From high-performance clustered servers to equipping your entire workforce, we've got you covered. We offer massive sales of refurbished desktops and laptops, as well as highly flexible corporate rental plans for any scale.
              </p>
              <ul className="space-y-4 mt-auto pt-8 border-t border-indigo-900/30">
                {['Server Architecture Design & Sales', 'Refurbished Desktop & Laptop Sales', 'Corporate IT Equipment Rentals'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* 3. ASSET AUDIT & MAINTENANCE */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-[#0f172a] rounded-[2.5rem] overflow-hidden border border-indigo-900/30 flex flex-col group hover:border-indigo-500/50 transition-all duration-500 shadow-[0_0_40px_-15px_rgba(99,102,241,0.1)] hover:shadow-[0_0_40px_-10px_rgba(99,102,241,0.2)]"
          >
            <div className="relative h-72 w-full overflow-hidden">
              <Image 
                src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800" // Data Audit / Server Room
                alt="Installation and Asset Audit"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
            </div>
            <div className="p-10 flex flex-col flex-1">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 -mt-16 relative z-10 backdrop-blur-md">
                <Settings className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Installations & Asset Audit</h3>
              <p className="text-slate-400 leading-relaxed mb-8 flex-1 text-lg">
                We handle the heavy lifting. From physical infrastructure installations (cabling, rack setups) to meticulous Asset Auditing and lifecycle management, we maintain absolute control over your technology investments.
              </p>
              <ul className="space-y-4 mt-auto pt-8 border-t border-indigo-900/30">
                {['Physical IT Installations & Cabling', 'Comprehensive Asset Audits', 'Proactive Maintenance Contracts'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* 4. IT SERVICE DELIVERY */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-[#0f172a] rounded-[2.5rem] overflow-hidden border border-indigo-900/30 flex flex-col group hover:border-indigo-500/50 transition-all duration-500 shadow-[0_0_40px_-15px_rgba(99,102,241,0.1)] hover:shadow-[0_0_40px_-10px_rgba(99,102,241,0.2)]"
          >
            <div className="relative h-72 w-full overflow-hidden">
              <Image 
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800" // IT Service Delivery People
                alt="IT Service Delivery"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
            </div>
            <div className="p-10 flex flex-col flex-1">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 -mt-16 relative z-10 backdrop-blur-md">
                <MonitorSmartphone className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Professional IT Service Delivery</h3>
              <p className="text-slate-400 leading-relaxed mb-8 flex-1 text-lg">
                Our elite engineering team delivers seamless, end-to-end IT Service Delivery. We offer top-tier Helpdesk support, remote troubleshooting, and professional IT management tailored to your enterprise's unique operational needs.
              </p>
              <ul className="space-y-4 mt-auto pt-8 border-t border-indigo-900/30">
                {['Remote IT Troubleshooting', 'Professional Helpdesk Services', 'End-to-End Service Delivery'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                    <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 5. FINAL CTA */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
        className="py-32 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center relative z-10"
      >
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-8">
          Ready to scale your enterprise?
        </h2>
        <p className="text-slate-400 text-xl md:text-2xl mb-12 font-light">
          Let Techwell build the unshakeable digital foundation you need to operate efficiently and grow without technical limitations.
        </p>
        <Button asChild size="lg" className="bg-white text-slate-950 hover:bg-slate-200 font-bold text-xl h-20 px-14 rounded-full shadow-[0_0_40px_-10px_rgba(255,255,255,0.2)] transition-all duration-300 group">
          <Link href={`/contact?service=IT Solutions`}>
            Speak to an IT Expert
            <ArrowUpRight className="ml-3 w-8 h-8 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
        </Button>
      </motion.section>

    </div>
  )
}

