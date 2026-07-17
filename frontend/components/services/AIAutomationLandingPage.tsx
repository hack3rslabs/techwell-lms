"use client";
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bot, ArrowUpRight, Cpu, Network, Sparkles, Workflow } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AIAutomationLandingPage({ data }: { data: any }) {
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
    <div className="min-h-screen bg-[#050505] text-slate-300 font-sans selection:bg-purple-500/30">
      
      {/* 1. IMMERSIVE HERO SECTION */}
      <section className="relative w-full h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden border-b border-purple-900/30">
        <Image 
          src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=2000" // Neural network / AI abstract
          alt="Enterprise AI Automation"
          fill
          className="object-cover opacity-30 mix-blend-screen"
          unoptimized
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/50 via-[#050505]/80 to-[#050505]" />
        
        {/* Animated Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />

        <motion.div 
          initial="hidden" animate="visible" variants={containerVariants}
          className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center"
        >
          <motion.div variants={itemVariants}>
            <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20 font-bold tracking-[0.2em] uppercase mb-8 px-5 py-2 shadow-sm backdrop-blur-md">
              <Sparkles className="w-4 h-4 mr-2 inline" /> Next-Gen Intelligence
            </Badge>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-8 text-white drop-shadow-xl leading-tight">
            Cognitive <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">Automation.</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-slate-400 text-lg md:text-2xl max-w-3xl mx-auto leading-relaxed font-light mb-12">
            Unlock unprecedented operational velocity with custom AI Agents, RAG (Retrieval-Augmented Generation) pipelines, and intelligent workflow automations.
          </motion.p>

          <motion.div variants={itemVariants}>
            <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-lg h-16 px-10 rounded-full shadow-[0_0_40px_-10px_rgba(168,85,247,0.5)] transition-all duration-300 group">
              <Link href={`/contact?service=AI Automation`}>
                Automate Your Workflows
                <ArrowUpRight className="ml-2 w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* STATS STRIP */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
        className="border-b border-purple-900/30 bg-[#0a0514]/50 backdrop-blur-xl relative z-20 -mt-8 mx-4 md:mx-auto max-w-6xl rounded-3xl p-8 shadow-2xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-purple-900/50">
          <div className="px-4">
            <div className="text-4xl font-black text-white mb-2">10x</div>
            <div className="text-purple-400 font-medium tracking-wide uppercase text-sm">Productivity Multiplier</div>
          </div>
          <div className="px-4 pt-8 md:pt-0">
            <div className="text-4xl font-black text-white mb-2">Zero</div>
            <div className="text-purple-400 font-medium tracking-wide uppercase text-sm">Human Error Rates</div>
          </div>
          <div className="px-4 pt-8 md:pt-0">
            <div className="text-4xl font-black text-white mb-2">24/7</div>
            <div className="text-purple-400 font-medium tracking-wide uppercase text-sm">Autonomous Operation</div>
          </div>
        </div>
      </motion.section>

      {/* SERVICES 3-COLUMN GRID */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">Enterprise AI Capabilities</h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto font-light leading-relaxed">
            We don't just use AI; we weave advanced cognitive models directly into your business processes to automate complex decision-making.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* 1. CUSTOM RAG PIPELINES */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-[#0b0514] rounded-[2.5rem] overflow-hidden border border-purple-900/30 flex flex-col group hover:border-purple-500/50 transition-all duration-500 shadow-[0_0_40px_-15px_rgba(168,85,247,0.1)] hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.2)]"
          >
            <div className="relative h-72 w-full overflow-hidden">
              <Image 
                src="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800" // Data structures / AI
                alt="Custom RAG Pipelines"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0514] via-transparent to-transparent" />
            </div>
            <div className="p-10 flex flex-col flex-1">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 -mt-16 relative z-10 backdrop-blur-md">
                <Network className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Custom RAG Pipelines</h3>
              <p className="text-slate-400 leading-relaxed mb-8 flex-1 text-lg">
                Stop hallucinating. We build Retrieval-Augmented Generation systems that securely index your proprietary company data, allowing your AI to answer complex queries with perfect, cited accuracy.
              </p>
              <ul className="space-y-4 mt-auto pt-8 border-t border-purple-900/30">
                {['Secure Enterprise Data Ingestion', 'Semantic Vector Search Integration', 'Highly Accurate Knowledge Retrieval'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                    <Sparkles className="w-5 h-5 text-purple-500 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* 2. AUTONOMOUS AGENTS */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-[#0b0514] rounded-[2.5rem] overflow-hidden border border-purple-900/30 flex flex-col group hover:border-purple-500/50 transition-all duration-500 shadow-[0_0_40px_-15px_rgba(168,85,247,0.1)] hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.2)]"
          >
            <div className="relative h-72 w-full overflow-hidden">
              <Image 
                src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800" // Robot/Agent
                alt="Autonomous Agents"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0514] via-transparent to-transparent" />
            </div>
            <div className="p-10 flex flex-col flex-1">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 -mt-16 relative z-10 backdrop-blur-md">
                <Bot className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Autonomous AI Agents</h3>
              <p className="text-slate-400 leading-relaxed mb-8 flex-1 text-lg">
                Deploy smart agents that can think, plan, and execute multi-step tasks across your software stack. From drafting emails to researching competitors, let the machine do the heavy lifting.
              </p>
              <ul className="space-y-4 mt-auto pt-8 border-t border-purple-900/30">
                {['Multi-Step Task Execution', 'Context-Aware Decision Making', 'Tool Use (Browsing, APIs)'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                    <Sparkles className="w-5 h-5 text-purple-500 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* 3. WORKFLOW AUTOMATION (n8n/Zapier) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-[#0b0514] rounded-[2.5rem] overflow-hidden border border-purple-900/30 flex flex-col group hover:border-purple-500/50 transition-all duration-500 shadow-[0_0_40px_-15px_rgba(168,85,247,0.1)] hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.2)]"
          >
            <div className="relative h-72 w-full overflow-hidden">
              <Image 
                src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800" // Circuitry/Workflow
                alt="Workflow Automation"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0514] via-transparent to-transparent" />
            </div>
            <div className="p-10 flex flex-col flex-1">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 -mt-16 relative z-10 backdrop-blur-md">
                <Workflow className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Intelligent Workflow Automation</h3>
              <p className="text-slate-400 leading-relaxed mb-8 flex-1 text-lg">
                We connect disparate tools using advanced integration engines like n8n, weaving AI models directly into your logic chains to automate customer support, lead routing, and data entry.
              </p>
              <ul className="space-y-4 mt-auto pt-8 border-t border-purple-900/30">
                {['Complex n8n/Zapier Integrations', 'AI-Powered Logic Gates', 'Zero-Touch Data Processing'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                    <Sparkles className="w-5 h-5 text-purple-500 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* 4. LLM FINE-TUNING & DEPLOYMENT */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-[#0b0514] rounded-[2.5rem] overflow-hidden border border-purple-900/30 flex flex-col group hover:border-purple-500/50 transition-all duration-500 shadow-[0_0_40px_-15px_rgba(168,85,247,0.1)] hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.2)]"
          >
            <div className="relative h-72 w-full overflow-hidden">
              <Image 
                src="https://images.unsplash.com/photo-1555255707-c07966088b7b?auto=format&fit=crop&q=80&w=800" // Server / Compute
                alt="LLM Fine Tuning"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0514] via-transparent to-transparent" />
            </div>
            <div className="p-10 flex flex-col flex-1">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 -mt-16 relative z-10 backdrop-blur-md">
                <Cpu className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">LLM Fine-Tuning & Deployment</h3>
              <p className="text-slate-400 leading-relaxed mb-8 flex-1 text-lg">
                Need an AI that speaks in your brand's exact tone of voice? We fine-tune open-source models (like LLaMA 3) or commercial APIs to perfectly align with your specific enterprise requirements.
              </p>
              <ul className="space-y-4 mt-auto pt-8 border-t border-purple-900/30">
                {['Custom Model Fine-Tuning', 'Private Local Deployments', 'Strict Data Sovereignty'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                    <Sparkles className="w-5 h-5 text-purple-500 shrink-0" /> {item}
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
          Ready to automate your future?
        </h2>
        <p className="text-slate-400 text-xl md:text-2xl mb-12 font-light">
          Let Techwell engineer the autonomous systems of tomorrow for your business today, liberating your human talent.
        </p>
        <Button asChild size="lg" className="bg-white text-slate-950 hover:bg-slate-200 font-bold text-xl h-20 px-14 rounded-full shadow-[0_0_40px_-10px_rgba(255,255,255,0.2)] transition-all duration-300 group">
          <Link href={`/contact?service=AI Automation`}>
            Consult an AI Architect
            <ArrowUpRight className="ml-3 w-8 h-8 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
        </Button>
      </motion.section>

    </div>
  )
}
