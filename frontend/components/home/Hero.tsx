"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { GraduationCap, Video, Building2, Handshake, ArrowRight, PlayCircle, School } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import api from "@/lib/api"

export function Hero() {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [isVideoOpen, setIsVideoOpen] = useState(false)
    const [dynamicSlides, setDynamicSlides] = useState<any[]>([])

    const slides = [
        {
            id: 1,
            title: "Automated Course Training",
            subtitle: "Live Instructor-Led Training",
            image: "/images/hero/ai_training_robot.png",
            color: "from-primary to-blue-700"
        },
        {
            id: 2,
            title: "Apply Jobs Platform",
            subtitle: "Guaranteed Placement Pipeline",
            image: "/images/hero/ai_job_agent.png",
            color: "from-primary to-blue-700"
        },
        {
            id: 3,
            title: "Software & IT Solutions",
            subtitle: "Enterprise Software & Consulting",
            image: "/images/hero/ai_software_hologram.png",
            color: "from-primary to-blue-700"
        }
    ]

    useEffect(() => {
        // Fetch dynamic banners from admin
        api.post('/promotions/deliver', { zones: ['HOME_HERO'] })
            .then(res => {
                if (res.data?.data?.HOME_HERO?.length > 0) {
                    const mapped = res.data.data.HOME_HERO.map((promo: any, idx: number) => ({
                        id: promo.id,
                        title: promo.title,
                        subtitle: promo.subtitle || promo.description,
                        image: promo.imageUrl || slides[idx % slides.length].image,
                        color: slides[idx % slides.length].color, 
                        ctaText: promo.ctaText || "Learn More",
                        redirectUrl: promo.redirectUrl
                    }))
                    setDynamicSlides(mapped)
                }
            })
            .catch(err => console.error("Failed to load banners:", err))
    }, [])

    const activeSlides = dynamicSlides.length > 0 ? dynamicSlides : slides;

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % activeSlides.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [activeSlides.length])

    return (
        <div className="relative bg-background flex flex-col justify-start pt-24 lg:pt-32 pb-16 border-b border-border">
            {/* Corporate Grid Background */}
            <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-30 blur-[100px]"></div>
            </div>

            <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16 mb-16">

                    {/* Left Column: Hero Text */}
                    <div className="flex-1 text-center lg:text-left z-20 flex flex-col justify-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentSlide}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.4 }}
                            >
                                 <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-6 leading-tight lg:leading-[1.15]">
                                     Powering Your <br />
                                     <span className={`text-transparent bg-clip-text bg-gradient-to-r ${activeSlides[currentSlide].color}`}>
                                         {currentSlide === 0 && "IT Skills & Training"}
                                         {currentSlide === 1 && "Career Placement"}
                                         {currentSlide === 2 && "Software Solutions"}
                                     </span>
                                     <br /> with {currentSlide === 0 ? "Live Trainers" : currentSlide === 1 ? "Top Recruiters" : "Tech Innovation"}
                                 </h1>

                                 <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                                     {currentSlide === 0 && "Learn full-stack engineering, cloud architectures, and databases. Build skills in live instructor-led batches simplified with smart AI tools."}
                                     {currentSlide === 1 && "Prepare with AI mock interview simulators, build professional ATS resumes, and land opportunities with our 500+ global hiring partners."}
                                     {currentSlide === 2 && "Empower your business with premium custom software engineering, CRM, HRMS, and IT consulting services tailored for growth."}
                                 </p>

                                <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 mb-14">
                                    <Link href={activeSlides[currentSlide].redirectUrl || "/register"} passHref>
                                        <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base rounded-lg shadow-lg hover:shadow-primary/20 transition-all bg-primary hover:bg-primary/90 text-primary-foreground font-medium border-none">
                                            {activeSlides[currentSlide].ctaText || "Start Free Trial"}
                                            <ArrowRight className="ml-2 w-4 h-4" />
                                        </Button>
                                    </Link>

                                    <Button
                                        size="lg"
                                        variant="outline"
                                        onClick={() => setIsVideoOpen(true)}
                                        className="w-full sm:w-auto h-14 px-8 text-base rounded-lg gap-2 border-border bg-background hover:bg-muted transition-all font-medium text-foreground"
                                    >
                                        <PlayCircle className="w-5 h-5 text-primary" />
                                        Watch Demo
                                    </Button>
                                </div>

                                <div className="flex items-center justify-center lg:justify-start gap-10 opacity-90">
                                    <div className="text-left">
                                        <div className="text-3xl font-bold text-foreground mb-1">95%</div>
                                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Placement Rate</div>
                                    </div>
                                    <div className="w-px h-10 bg-border"></div>
                                    <div className="text-left">
                                        <div className="text-3xl font-bold text-foreground mb-1">500+</div>
                                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Hiring Partners</div>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Right Column: Dynamic Hero Carousel */}
                    <div className="flex flex-1 justify-center relative w-full max-w-[650px] mt-8 lg:mt-0">
                        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-border shadow-xl bg-card">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentSlide}
                                        initial={{ opacity: 0, scale: 1.05 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="absolute inset-0"
                                    >
                                        <Image
                                            src={activeSlides[currentSlide].image}
                                            alt={activeSlides[currentSlide].title}
                                            fill
                                            className="object-cover"
                                            priority
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                                        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                                            <motion.div
                                                initial={{ y: 15, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 bg-gradient-to-r ${activeSlides[currentSlide].color}`}>
                                                    FEATURED
                                                </div>
                                                <h3 className="text-2xl sm:text-3xl font-bold mb-2 text-white">{activeSlides[currentSlide].title}</h3>
                                                <p className="text-white/80 text-sm sm:text-base">{activeSlides[currentSlide].subtitle}</p>
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>

                                {/* Carousel Indicators */}
                                <div className="absolute bottom-6 right-6 flex gap-2 z-10">
                                    {activeSlides.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentSlide(idx)}
                                            aria-label={`Go to slide ${idx + 1}`}
                                            className={cn(
                                                "w-2 h-2 rounded-full transition-all duration-300",
                                                currentSlide === idx ? "w-6 bg-white" : "bg-white/40 hover:bg-white/60"
                                            )}
                                        />
                                    ))}
                                </div>
                        </div>
                    </div>
                </div>

                {/* Premium Feature Boxes - Redesigned Corporate */}
                <div className="mt-16">
                    <h2 className="text-sm font-semibold text-center mb-8 text-muted-foreground tracking-widest uppercase">Explore Our Ecosystem</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
                        {[
                            { title: "Courses", desc: "Comprehensive learning management system with premium courses.", icon: GraduationCap, href: "/courses" },
                            { title: "Projects Market", desc: "Final year projects with source code and documentation.", icon: Building2, href: "/projects" },
                            { title: "Job Portal", desc: "Connect with top employers and find your dream job.", icon: Handshake, href: "/jobs" },
                            { title: "AI Interviews", desc: "Practice with AI-driven mock interviews and get feedback.", icon: Video, href: "/interviews" },
                            { title: "Resume Builder", desc: "Create ATS-friendly resumes with our smart builder.", icon: School, href: "/resume-builder" },
                            { title: "For Colleges", desc: "Partner with us to empower your students.", icon: Building2, href: "/colleges" },
                            { title: "Campus to Career", desc: "Bridge the gap between academic learning and industry demands.", icon: GraduationCap, href: "https://campustest.techwell.co.in", external: true },
                            { title: "Software & IT Solutions", desc: "Custom enterprise software development, CRM/ERP solutions.", icon: Building2, href: "/contact?type=it-solutions" }
                        ].map((item, i) => (
                            <Link key={i} href={item.href} target={item.external ? "_blank" : undefined} rel={item.external ? "noopener noreferrer" : undefined}>
                                <motion.div
                                    whileHover={{ y: -3 }}
                                    className="group h-full rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-sm"
                                >
                                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                        <item.icon className="h-5 w-5" />
                                    </div>
                                    <h3 className="mb-1.5 text-base font-bold text-foreground">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Video Demo Modal */}
            <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
                <DialogContent className="sm:max-w-[900px] p-0 bg-black border-none overflow-hidden rounded-2xl">
                    <DialogTitle className="sr-only">Product Demo Video</DialogTitle>
                    <DialogDescription className="sr-only">
                        Watch a demonstration of our platform features.
                    </DialogDescription>

                    <div className="aspect-video w-full bg-black flex items-center justify-center relative">
                        {isVideoOpen && (
                            <iframe
                                src="https://www.youtube.com/embed/Fq5kgzzXWco?autoplay=1&rel=0"
                                title="Techwell Platform Demo"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full"
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
