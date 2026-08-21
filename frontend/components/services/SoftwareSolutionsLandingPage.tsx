"use client";
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Code2, ArrowUpRight, CheckCircle2, Layout, Smartphone, Network } from 'lucide-react'
import { motion } from 'framer-motion'

export default function SoftwareSolutionsLandingPage({ data }: { data: any }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 50, damping: 15 } }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-sky-500/30">
      
      {/* 1. IMMERSIVE HERO SECTION */}
      <section className="relative w-full h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden border-b border-sky-900/30">
        <Image 
          src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=2000" // Code / Dark tech
          alt="Enterprise Software Development"
          fill
          className="object-cover opacity-30 mix-blend-screen"
          unoptimized
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/50 via-[#020617]/80 to-[#020617]" />
        
        {/* Animated Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />

        <motion.div 
          initial="hidden" animate="visible" variants={containerVariants}
          className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center"
        >
          <motion.div variants={itemVariants}>
            <Badge className="bg-sky-500/10 text-sky-400 border-sky-500/20 hover:bg-sky-500/20 font-bold tracking-[0.2em] uppercase mb-8 px-5 py-2 shadow-sm backdrop-blur-md">
              <Code2 className="w-4 h-4 mr-2 inline" /> Scalable Architectures
            </Badge>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-8 text-white drop-shadow-xl leading-tight">
            Custom Engineered <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-sky-600">Software.</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-slate-400 text-lg md:text-2xl max-w-3xl mx-auto leading-relaxed font-light mb-12">
            Automate business workflows and eliminate operational bottlenecks with our bespoke ERP systems, high-performance web apps, and modern mobile applications.
          </motion.p>

          <motion.div variants={itemVariants}>
            <Button asChild size="lg" className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-lg h-16 px-10 rounded-full shadow-[0_0_40px_-10px_rgba(168,85,247,0.5)] transition-all duration-300 group">
              <Link href={`/contact?service=Software Solutions`}>
                Discuss Your Project
                <ArrowUpRight className="ml-2 w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* STATS STRIP */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
        className="border-b border-sky-900/30 bg-[#040f24]/50 backdrop-blur-xl relative z-20 -mt-8 mx-4 md:mx-auto max-w-6xl rounded-3xl p-8 shadow-2xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-sky-900/50">
          <div className="px-4">
            <div className="text-4xl font-black text-white mb-2">10+ Years</div>
            <div className="text-sky-400 font-medium tracking-wide uppercase text-sm">Development Expertise</div>
          </div>
          <div className="px-4 pt-8 md:pt-0">
            <div className="text-4xl font-black text-white mb-2">Zero</div>
            <div className="text-sky-400 font-medium tracking-wide uppercase text-sm">Off-the-shelf Compromises</div>
          </div>
          <div className="px-4 pt-8 md:pt-0">
            <div className="text-4xl font-black text-white mb-2">100%</div>
            <div className="text-sky-400 font-medium tracking-wide uppercase text-sm">Bespoke Solutions</div>
          </div>
        </div>
      </motion.section>

      {/* SERVICES 2x2 GRID */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">Our Software Services</h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto font-light leading-relaxed">
            From complex enterprise integrations to sleek mobile interfaces, we build technology that adapts to your business workflows.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10">
          
          {/* 1. ERP SOLUTIONS */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-[#0f172a] rounded-[2.5rem] overflow-hidden border border-sky-900/30 flex flex-col group hover:border-sky-500/50 transition-all duration-500 shadow-[0_0_40px_-15px_rgba(168,85,247,0.1)] hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.2)]"
          >
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
              <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-6 -mt-16 relative z-10 backdrop-blur-md">
                <Network className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">ERP Solutions</h3>
              <p className="text-slate-400 leading-relaxed mb-8 flex-1 text-base">
                We engineer comprehensive Enterprise Resource Planning systems that unify fragmented corporate departments into a single, cohesive, highly efficient operational engine.
              </p>
              <ul className="space-y-3 mt-auto pt-6 border-t border-sky-900/30">
                {['Workflow Automation', 'Department Unification', 'Data Centralization', 'Custom Reporting'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                    <CheckCircle2 className="w-5 h-5 text-sky-500 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* 2. CUSTOM SOFTWARE */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-[#0f172a] rounded-[2.5rem] overflow-hidden border border-sky-900/30 flex flex-col group hover:border-sky-500/50 transition-all duration-500 shadow-[0_0_40px_-15px_rgba(168,85,247,0.1)] hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.2)]"
          >
            <div className="relative h-72 w-full overflow-hidden">
              <Image 
                src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800" // Custom Software
                alt="Custom Software"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
            </div>
            <div className="p-8 flex flex-col flex-1">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-6 -mt-16 relative z-10 backdrop-blur-md">
                <Code2 className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Custom Software</h3>
              <p className="text-slate-400 leading-relaxed mb-8 flex-1 text-base">
                Generic, off-the-shelf software consistently fails to address highly nuanced business demands. We engineer completely bespoke software tailored to eliminate bottlenecks.
              </p>
              <ul className="space-y-3 mt-auto pt-6 border-t border-sky-900/30">
                {['Bespoke Architecture', 'Legacy Modernization', 'API Integrations', 'Problem-solving Tools'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                    <CheckCircle2 className="w-5 h-5 text-sky-500 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* 3. WEB DEVELOPMENT */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-[#0f172a] rounded-[2.5rem] overflow-hidden border border-sky-900/30 flex flex-col group hover:border-sky-500/50 transition-all duration-500 shadow-[0_0_40px_-15px_rgba(168,85,247,0.1)] hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.2)]"
          >
            <div className="relative h-72 w-full overflow-hidden">
              <Image 
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800" // Web Dev / Analytical
                alt="Web Development"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
            </div>
            <div className="p-8 flex flex-col flex-1">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-6 -mt-16 relative z-10 backdrop-blur-md">
                <Layout className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Web Development</h3>
              <p className="text-slate-400 leading-relaxed mb-8 flex-1 text-base">
                Our portfolio includes robust web development projects that create deeply engaging digital storefronts, incredibly high-performance SaaS platforms, and dynamic portals.
              </p>
              <ul className="space-y-3 mt-auto pt-6 border-t border-sky-900/30">
                {['Enterprise Web Portals', 'SaaS Platform Dev', 'React / Next.js', 'Responsive UI/UX'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                    <CheckCircle2 className="w-5 h-5 text-sky-500 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* 4. APPLICATION DEVELOPMENT */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-[#0f172a] rounded-[2.5rem] overflow-hidden border border-sky-900/30 flex flex-col group hover:border-sky-500/50 transition-all duration-500 shadow-[0_0_40px_-15px_rgba(168,85,247,0.1)] hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.2)]"
          >
            <div className="relative h-72 w-full overflow-hidden">
              <Image 
                src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=800" // App dev
                alt="Application Development"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
            </div>
            <div className="p-8 flex flex-col flex-1">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-6 -mt-16 relative z-10 backdrop-blur-md">
                <Smartphone className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Application Development</h3>
              <p className="text-slate-400 leading-relaxed mb-8 flex-1 text-base">
                We build powerful native and cross-platform mobile applications that deliver seamless user experiences, flawless backend integrations, and unmatched performance.
              </p>
              <ul className="space-y-3 mt-auto pt-6 border-t border-sky-900/30">
                {['iOS / Android Apps', 'Cross-Platform', 'Mobile UI/UX Design', 'API Backends'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                    <CheckCircle2 className="w-5 h-5 text-sky-500 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

        </div>
      </section>

      {/* FINAL CTA */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
        className="py-32 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center relative z-10"
      >
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-8">
          Stop adapting to your software.
        </h2>
        <p className="text-slate-400 text-xl md:text-2xl mb-12 font-light">
          Let Techwell engineer robust custom solutions that seamlessly adapt to your unique business workflows instead.
        </p>
        <Button asChild size="lg" className="bg-white text-slate-950 hover:bg-slate-200 font-bold text-xl h-20 px-14 rounded-full shadow-[0_0_40px_-10px_rgba(255,255,255,0.2)] transition-all duration-300 group">
          <Link href={`/contact?service=Software Solutions`}>
            Consult Our Engineering Team
            <ArrowUpRight className="ml-3 w-8 h-8 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
        </Button>
      </motion.section>

    </div>
  )
}

