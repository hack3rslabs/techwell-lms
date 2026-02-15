"use client";

import { useRef } from "react";
import {
    Brain,
    Award,
    Trophy,
    BarChart3,
    GraduationCap,
    Sparkles,
    Target,
    Rocket
} from 'lucide-react';
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

const features = [
    {
        icon: Brain,
        title: "AI-Powered Personalization",
        description: "Our adaptive AI analyzes your learning style in real-time, tailoring every lesson and quiz to your optimal pace.",
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
        borderColor: "group-hover:border-blue-500/50",
        gradient: "from-blue-500/20 to-transparent",
        colSpan: "md:col-span-2",
        delay: 0.1
    },
    {
        icon: Award,
        title: "Fortune 500 Mentors",
        description: "Learn directly from seniors at Google, Microsoft, and Amazon who guide your career path.",
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
        borderColor: "group-hover:border-purple-500/50",
        gradient: "from-purple-500/20 to-transparent",
        colSpan: "md:col-span-1",
        delay: 0.2
    },
    {
        icon: BarChart3,
        title: "Instant AI Feedback",
        description: "Get actionable code reviews and speech analysis instantly to improve faster.",
        color: "text-pink-500",
        bgColor: "bg-pink-500/10",
        borderColor: "group-hover:border-pink-500/50",
        gradient: "from-pink-500/20 to-transparent",
        colSpan: "md:col-span-1",
        delay: 0.3
    },
    {
        icon: Trophy,
        title: "95% Placement Rate",
        description: "Our dedicated placement cell works 24/7 to connect you with 500+ hiring partners until you sign that offer letter.",
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/10",
        borderColor: "group-hover:border-yellow-500/50",
        gradient: "from-yellow-500/20 to-transparent",
        colSpan: "md:col-span-2",
        delay: 0.4
    },
    {
        icon: GraduationCap,
        title: "Global Certification",
        description: "Resume-boosting credentials recognized worldwide upon course completion.",
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
        borderColor: "group-hover:border-orange-500/50",
        gradient: "from-orange-500/20 to-transparent",
        colSpan: "md:col-span-1",
        delay: 0.5
    },
    {
        icon: Rocket,
        title: "Career Acceleration",
        description: "Fast-track your career growth with our specialized career development modules.",
        color: "text-green-500",
        bgColor: "bg-green-500/10",
        borderColor: "group-hover:border-green-500/50",
        gradient: "from-green-500/20 to-transparent",
        colSpan: "md:col-span-1",
        delay: 0.6
    },
    {
        icon: Target,
        title: "Focused Learning Paths",
        description: "Curated learning paths designed to help you master specific skills and technologies.",
        color: "text-cyan-500",
        bgColor: "bg-cyan-500/10",
        borderColor: "group-hover:border-cyan-500/50",
        gradient: "from-cyan-500/20 to-transparent",
        colSpan: "md:col-span-1",
        delay: 0.7
    }
];

export function WhyChooseSection() {
    const containerRef = useRef(null);
    const isInView = useInView(containerRef, { once: true, margin: "-100px" });

    return (
        <section className="py-32 relative overflow-hidden bg-background">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="container relative z-10 mx-auto px-4" ref={containerRef}>
                <div className="text-center mb-20 max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                            Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">TechWell?</span>
                        </h2>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            We don&apos;t just teach technology; we build your entire career ecosystem with AI-driven personalization and industry-leading mentorship.
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                            transition={{ duration: 0.5, delay: feature.delay }}
                            className={cn(
                                "group relative overflow-hidden rounded-3xl border border-border/50 bg-card/40 backdrop-blur-xl p-8 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1",
                                feature.colSpan,
                                feature.borderColor
                            )}
                        >
                            <div className={cn(
                                "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                                feature.gradient
                            )} />

                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div className="flex items-start justify-between mb-8">
                                    <div className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
                                        feature.bgColor,
                                        feature.color
                                    )}>
                                        <feature.icon className="w-7 h-7" />
                                    </div>
                                    <div className={cn(
                                        "opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-x-4 group-hover:translate-x-0",
                                        feature.color
                                    )}>
                                        <Sparkles className="w-5 h-5 fill-current" />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-2xl font-bold mb-3 tracking-tight group-hover:text-primary transition-colors">
                                        {feature.title}
                                    </h3>
                                    <p className="text-muted-foreground text-lg leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
