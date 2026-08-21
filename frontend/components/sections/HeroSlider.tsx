"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import api from '@/lib/api'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Sparkles, ArrowRight, Building2, ShieldCheck, 
  Globe2, Code2, Users, Cpu, GraduationCap, Laptop, Briefcase, Database, Target, TrendingUp, Store, Handshake, Gift
} from 'lucide-react'

const ICON_MAP: Record<string, any> = {
  Sparkles, Target, Building2, TrendingUp, Store, GraduationCap
};

const SLIDES = [
  {
    id: 1,
    badgeIcon: <Sparkles className="w-4 h-4 mr-2 text-sky-400" />,
    badgeText: "Tech and Career Hub",
    titleLine1: "Build",
    titleLine1Highlight: "Careers.",
    titleLine2: "Grow",
    titleLine2Highlight: "Business.",
    titleGradient1: "from-sky-400 via-sky-300 to-emerald-300",
    titleGradient2: "from-emerald-300 via-emerald-400 to-sky-400",
    description: "Techwell offers IT training, placement help, and software solutions to boost your career and business.",
    primaryCtaText: "Start Your Career",
    primaryCtaLink: "/courses",
    secondaryCtaText: "Enterprise Solutions",
    secondaryCtaLink: "/contact?type=it-solutions",
    secondaryCtaIcon: <Building2 className="mr-2 w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />,
    abstractCenterIcon: <Globe2 className="w-10 h-10 text-sky-400" />,
    abstractCenterTitle: "Techwell Hub",
    abstractCenterDesc: "The centralized ecosystem for careers and IT infrastructure.",
    abstractTopRightIcon: <Code2 className="w-5 h-5 text-sky-400" />,
    abstractTopRightText: "SaaS Solutions",
    abstractBottomLeftIcon: <Users className="w-5 h-5 text-emerald-400" />,
    abstractBottomLeftText: "Placement Hub",
    abstractBgGlow1: "bg-sky-600/20",
    abstractBgGlow2: "bg-emerald-500/10",
    image: "/images/hero/ai_training_robot.png",
  },
  {
    id: 2,
    badgeIcon: <GraduationCap className="w-4 h-4 mr-2 text-emerald-400" />,
    badgeText: "Get Hired Faster",
    titleLine1: "Learn",
    titleLine1Highlight: "IT Skills.",
    titleLine2: "Get",
    titleLine2Highlight: "Top Jobs.",
    titleGradient1: "from-emerald-400 via-emerald-300 to-sky-300",
    titleGradient2: "from-sky-300 via-sky-400 to-emerald-400",
    description: "Learn from experts, build real projects, and prepare for interviews to land a job at top companies.",
    primaryCtaText: "Explore Courses",
    primaryCtaLink: "/courses",
    secondaryCtaText: "View Placements",
    secondaryCtaLink: "/jobs",
    secondaryCtaIcon: <Briefcase className="mr-2 w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />,
    abstractCenterIcon: <GraduationCap className="w-10 h-10 text-emerald-400" />,
    abstractCenterTitle: "Learning Hub",
    abstractCenterDesc: "Hands-on projects, rigorous curriculum, and expert mentorship.",
    abstractTopRightIcon: <Laptop className="w-5 h-5 text-sky-400" />,
    abstractTopRightText: "Skills Practice",
    abstractBottomLeftIcon: <Users className="w-5 h-5 text-sky-400" />,
    abstractBottomLeftText: "500+ Hiring Partners",
    abstractBgGlow1: "bg-emerald-600/20",
    abstractBgGlow2: "bg-sky-500/10",
    image: "/images/hero/ai_job_agent.png",
  },
  {
    id: 3,
    badgeIcon: <Building2 className="w-4 h-4 mr-2 text-sky-400" />,
    badgeText: "Software for Business",
    titleLine1: "Custom",
    titleLine1Highlight: "Software.",
    titleLine2: "Strong",
    titleLine2Highlight: "IT Systems.",
    titleGradient1: "from-sky-400 via-emerald-400 to-sky-500",
    titleGradient2: "from-sky-400 via-sky-500 to-emerald-500",
    description: "We build custom software, manage your cloud, and keep your business secure.",
    primaryCtaText: "Consult Engineers",
    primaryCtaLink: "/contact?type=it-solutions",
    secondaryCtaText: "View Services",
    secondaryCtaLink: "/services",
    secondaryCtaIcon: <ShieldCheck className="mr-2 w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />,
    abstractCenterIcon: <Database className="w-10 h-10 text-emerald-400" />,
    abstractCenterTitle: "Enterprise Core",
    abstractCenterDesc: "Scalable databases, microservices, and secure infrastructure.",
    abstractTopRightIcon: <ShieldCheck className="w-5 h-5 text-sky-400" />,
    abstractTopRightText: "Cybersecurity",
    abstractBottomLeftIcon: <Cpu className="w-5 h-5 text-sky-400" />,
    abstractBottomLeftText: "Cloud Infra",
    abstractBgGlow1: "bg-sky-600/20",
    abstractBgGlow2: "bg-emerald-500/10",
    image: "/images/hero/ai_software_hologram.png",
  },
  {
    id: 4,
    badgeIcon: <Target className="w-4 h-4 mr-2 text-emerald-400" />,
    badgeText: "College Hiring Drives",
    titleLine1: "Hire",
    titleLine1Highlight: "Students.",
    titleLine2: "Grow",
    titleLine2Highlight: "Faster.",
    titleGradient1: "from-emerald-400 via-sky-400 to-emerald-500",
    titleGradient2: "from-sky-400 via-emerald-400 to-sky-500",
    description: "We help colleges and companies connect. Host hiring events and find the best new talent easily.",
    primaryCtaText: "Host a Drive",
    primaryCtaLink: "/contact?type=campus-drive",
    secondaryCtaText: "For Institutes",
    secondaryCtaLink: "/institutes",
    secondaryCtaIcon: <Building2 className="mr-2 w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />,
    abstractCenterIcon: <Target className="w-10 h-10 text-emerald-400" />,
    abstractCenterTitle: "Hiring Hub",
    abstractCenterDesc: "Streamlined recruitment processes and vast talent pools.",
    abstractTopRightIcon: <Users className="w-5 h-5 text-sky-400" />,
    abstractTopRightText: "Scale Recruiting",
    abstractBottomLeftIcon: <ShieldCheck className="w-5 h-5 text-sky-400" />,
    abstractBottomLeftText: "Verified Profiles",
    abstractBgGlow1: "bg-emerald-600/20",
    abstractBgGlow2: "bg-sky-500/10",
    image: "/images/hero/campus_hiring_drive.png",
  },
  {
    id: 5,
    badgeIcon: <TrendingUp className="w-4 h-4 mr-2 text-sky-400" />,
    badgeText: "Career Training",
    titleLine1: "Expert",
    titleLine1Highlight: "Training.",
    titleLine2: "Job",
    titleLine2Highlight: "Placement.",
    titleGradient1: "from-sky-400 via-sky-500 to-emerald-400",
    titleGradient2: "from-emerald-400 via-emerald-500 to-sky-400",
    description: "Turn your knowledge into real skills. Our training gets you ready for the job market.",
    primaryCtaText: "Start Training",
    primaryCtaLink: "/courses",
    secondaryCtaText: "Success Stories",
    secondaryCtaLink: "/success-stories",
    secondaryCtaIcon: <Briefcase className="mr-2 w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />,
    abstractCenterIcon: <TrendingUp className="w-10 h-10 text-sky-400" />,
    abstractCenterTitle: "Career Accelerator",
    abstractCenterDesc: "Mock interviews, portfolio building, and direct corporate links.",
    abstractTopRightIcon: <Laptop className="w-5 h-5 text-sky-400" />,
    abstractTopRightText: "Live Projects",
    abstractBottomLeftIcon: <GraduationCap className="w-5 h-5 text-emerald-400" />,
    abstractBottomLeftText: "Industry Ready",
    abstractBgGlow1: "bg-sky-600/20",
    abstractBgGlow2: "bg-emerald-500/10",
    image: "/images/hero/student_corporate_placement.png",
  },
  {
    id: 6,
    badgeIcon: <Store className="w-4 h-4 mr-2 text-emerald-400" />,
    badgeText: "Start a Franchise",
    titleLine1: "Grow",
    titleLine1Highlight: "Together.",
    titleLine2: "Expand",
    titleLine2Highlight: "Globally.",
    titleGradient1: "from-emerald-400 via-sky-400 to-emerald-500",
    titleGradient2: "from-emerald-400 via-emerald-500 to-sky-400",
    description: "Partner with us to start your own IT and training center. Get full support and grow your business.",
    primaryCtaText: "Become a Partner",
    primaryCtaLink: "/franchise-request",
    secondaryCtaText: "Learn More",
    secondaryCtaLink: "/about",
    secondaryCtaIcon: <Handshake className="mr-2 w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />,
    abstractCenterIcon: <Store className="w-10 h-10 text-emerald-400" />,
    abstractCenterTitle: "Global Network",
    abstractCenterDesc: "Join a fast-growing tech franchise with proven ROI.",
    abstractTopRightIcon: <Globe2 className="w-5 h-5 text-emerald-400" />,
    abstractTopRightText: "Worldwide Reach",
    abstractBottomLeftIcon: <Handshake className="w-5 h-5 text-sky-400" />,
    abstractBottomLeftText: "Full Support",
    abstractBgGlow1: "bg-sky-600/20",
    abstractBgGlow2: "bg-emerald-500/10",
    image: "/images/hero/franchise_opportunity.png",
  }
]

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [heroAd, setHeroAd] = useState<any>(null)
  const [slides, setSlides] = useState<any[]>(SLIDES)

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 6000) // 6 seconds per slide
    return () => clearInterval(timer)
  }, [slides.length])

  useEffect(() => {
    api.get('/ads/active').then(res => {
      const ads = res.data?.ads || [];
      const hAd = ads.find((a: any) => a.position === 'HERO_CTA');
      if (hAd) setHeroAd(hAd);
    }).catch(console.error);

    api.get('/main-banners/active').then(res => {
      const banners = res.data?.data?.banners || [];
      if (banners.length > 0) {
        const mapped = banners.map((b: any, idx: number) => {
          const defaultTheme = SLIDES[idx % SLIDES.length];
          const IconComponent = ICON_MAP[b.badgeIcon] || Sparkles;
          return {
            ...defaultTheme,
            id: b.id,
            badgeIcon: <IconComponent className="w-4 h-4 mr-2" style={{ color: "currentColor" }} />,
            badgeText: b.badgeText || defaultTheme.badgeText,
            titleLine1: b.titleLine1 || defaultTheme.titleLine1,
            titleLine1Highlight: b.titleLine1Highlight || defaultTheme.titleLine1Highlight,
            titleLine2: b.titleLine2 || defaultTheme.titleLine2,
            titleLine2Highlight: b.titleLine2Highlight || defaultTheme.titleLine2Highlight,
            description: b.description || defaultTheme.description,
            primaryCtaText: b.primaryCtaText || defaultTheme.primaryCtaText,
            primaryCtaLink: b.primaryCtaLink || defaultTheme.primaryCtaLink,
            secondaryCtaText: b.secondaryCtaText || defaultTheme.secondaryCtaText,
            secondaryCtaLink: b.secondaryCtaLink || defaultTheme.secondaryCtaLink,
            image: b.image || defaultTheme.image,
          };
        });
        setSlides(mapped);
      }
    }).catch(console.error);
  }, []);

  if (slides.length === 0) return null;
  const slide = slides[currentSlide]

  return (
    <section className="relative min-h-[92vh] flex items-center pt-28 pb-20 bg-[#030712] text-white overflow-hidden">
      {/* Immersive Background Images */}
      {slides.map((s, idx) => (
        <div 
          key={`bg-${s.id}`}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}
        >
          <Image src={s.image} alt={s.titleLine1} fill className="object-cover opacity-60" priority={idx === 0} />
          {/* Overlays for readability and premium feel */}
          <div className="absolute inset-0 bg-slate-950/70 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-900/30" />
        </div>
      ))}

      {/* Animated Background Gradients & Grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f46e510_1px,transparent_1px),linear-gradient(to_bottom,#4f46e510_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] z-0" />
      
      {/* Dynamic Glows based on slide */}
      <div className={`absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] ${slide.abstractBgGlow1} rounded-full blur-[120px] pointer-events-none transition-colors duration-1000 z-0`} />
      <div className={`absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] ${slide.abstractBgGlow2} rounded-full blur-[100px] pointer-events-none transition-colors duration-1000 z-0`} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('/images/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay z-0" />
      
      <div className="container max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10 px-4 sm:px-6 lg:px-8">
        
        {/* Left Content (Text) */}
        <div className="lg:col-span-8 space-y-10 text-left relative min-h-[400px]">
          {slides.map((s, idx) => (
            <div 
              key={s.id} 
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100 translate-y-0 z-20 relative' : 'opacity-0 translate-y-8 absolute pointer-events-none z-0'}`}
            >
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="bg-white/10 hover:bg-white/20 text-white border-white/20 px-4 py-2 rounded-full backdrop-blur-md transition-all shadow-lg">
                  {s.badgeIcon}
                  <span className="text-xs sm:text-sm font-semibold tracking-wide uppercase drop-shadow-md">{s.badgeText}</span>
                </Badge>

                {/* 10 Years of Trust Badge */}
                <Badge className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/30 px-4 py-2 rounded-full backdrop-blur-md transition-all shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] flex items-center cursor-default">
                  <ShieldCheck className="w-4 h-4 mr-2 text-emerald-400" />
                  <span className="text-xs sm:text-sm font-bold tracking-wide uppercase drop-shadow-md">10 Years of Trust</span>
                </Badge>
              </div>
              
              <h1 className="mt-8 text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-black tracking-tight leading-[1.05] drop-shadow-xl">
                {s.titleLine1} <span className={`text-transparent bg-clip-text bg-gradient-to-r ${s.titleGradient1}`}>{s.titleLine1Highlight}</span><br />
                {s.titleLine2} <span className={`text-transparent bg-clip-text bg-gradient-to-r ${s.titleGradient2}`}>{s.titleLine2Highlight}</span>
              </h1>
              
              <p className="mt-8 text-slate-200 text-lg sm:text-xl leading-relaxed max-w-2xl font-medium drop-shadow-lg">
                {s.description}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-5 pt-8">
                <Button asChild size="lg" className="bg-white text-slate-950 hover:bg-slate-200 font-bold text-base h-14 px-8 rounded-full shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] transition-all duration-300 group">
                  <Link href={s.primaryCtaLink}>
                    {s.primaryCtaText}
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="bg-slate-900/40 border-slate-600 text-white hover:bg-slate-800 hover:text-white font-bold text-base h-14 px-8 rounded-full backdrop-blur-md shadow-lg transition-all duration-300 group">
                  <Link href={s.secondaryCtaLink}>
                    {s.secondaryCtaIcon}
                    {s.secondaryCtaText}
                  </Link>
                </Button>
              </div>
            </div>
          ))}

          {/* Trust Bar */}
          <div className="absolute bottom-0 left-0 right-0 pt-10 flex flex-wrap items-center gap-x-8 gap-y-4 text-sm font-medium text-slate-300 border-t border-slate-700/50 mt-16">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-400" />
              <span className="drop-shadow-md"><strong className="text-white">10,000+</strong> Students Placed</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-600 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="drop-shadow-md"><strong className="text-white">50+</strong> IT Solutions Delivered</span>
            </div>
          </div>
        </div>
        
        {/* Right Abstract Visuals */}
        <div className="lg:col-span-4 relative hidden lg:block h-[500px]">
          {slides.map((s, idx) => (
             <div 
               key={s.id} 
               className={`absolute inset-0 flex flex-col items-end justify-center transition-all duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-95 translate-x-12 pointer-events-none'}`}
             >
                {/* Floating Abstract Element - Center */}
                <div className="w-64 bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl z-30 animate-[float_6s_ease-in-out_infinite] transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 mb-4 border border-white/10">
                     {s.abstractCenterIcon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{s.abstractCenterTitle}</h3>
                  <p className="text-sm text-slate-300 line-clamp-3">{s.abstractCenterDesc}</p>
                </div>

                {/* Floating Top Right */}
                <div className="absolute top-[10%] right-[-10%] w-56 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl z-20 animate-[float_8s_ease-in-out_infinite_1s]">
                  <div className="flex items-center gap-3 mb-2">
                    {s.abstractTopRightIcon}
                    <span className="text-sm font-semibold text-white">{s.abstractTopRightText}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-white/30 rounded-full animate-[pulse_2s_ease-in-out_infinite]"></div>
                  </div>
                </div>

                {/* Floating Bottom Left */}
                <div className="absolute bottom-[10%] right-[30%] w-60 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl z-40 animate-[float_7s_ease-in-out_infinite_2s]">
                  <div className="flex items-center gap-3 mb-3">
                    {s.abstractBottomLeftIcon}
                    <span className="text-sm font-semibold text-white">{s.abstractBottomLeftText}</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-2 w-8 bg-emerald-500/50 rounded-full"></div>
                    <div className="h-2 w-6 bg-sky-500/50 rounded-full"></div>
                    <div className="h-2 w-10 bg-sky-400/50 rounded-full"></div>
                  </div>
                </div>
             </div>
          ))}
          
          <style // deepcode ignore DOMXSS: Sanitized by React
dangerouslySetInnerHTML={{__html: `
            @keyframes float {
              0% { transform: translateY(0px); }
              50% { transform: translateY(-15px); }
              100% { transform: translateY(0px); }
            }
          `}} />
        </div>
      </div>

      {/* Slider Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-30">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-white w-8' : 'bg-white/30 hover:bg-white/50'}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
      {/* Floating Dynamic CTA */}
      {heroAd ? (
        <a 
          href={heroAd.targetUrl || '#'} 
          target="_blank" rel="noopener noreferrer"
          onClick={() => api.post(`/ads/${heroAd.id}/click`).catch(console.error)}
          className="absolute bottom-20 right-6 md:bottom-12 md:right-12 z-50 flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-sky-500 to-emerald-500 rounded-full shadow-lg hover:scale-110 transition-all duration-300 group cursor-pointer overflow-hidden border-2 border-white/20"
          title={heroAd.title}
        >
          <div className="absolute inset-0 rounded-full border-2 border-white/40 animate-ping opacity-75"></div>
          {heroAd.imageUrl ? (
             <img src={heroAd.imageUrl} alt={heroAd.title} className="w-full h-full object-cover rounded-full" />
          ) : (
             <Gift className="w-8 h-8 text-white drop-shadow-md group-hover:animate-pulse" />
          )}
        </a>
      ) : (
        <Link 
          href="/offers" 
          className="absolute bottom-20 right-6 md:bottom-12 md:right-12 z-50 flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-emerald-500 to-sky-400 rounded-full shadow-lg hover:scale-110 hover:rotate-12 transition-all duration-300 animate-bounce group"
          aria-label="View Special Offers"
        >
          <div className="absolute inset-0 rounded-full border-2 border-white/40 animate-ping opacity-75"></div>
          <Gift className="w-8 h-8 text-white drop-shadow-md group-hover:animate-pulse" />
        </Link>
      )}
    </section>
  )
}
