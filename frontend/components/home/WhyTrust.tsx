"use client"

import {
    Landmark,
    Cpu,
    Briefcase,
    Users,
    Video,
    Rocket,
    GraduationCap,
    Calendar,
    UserCheck,
    LifeBuoy,
    Zap,
    Globe
} from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"

const features = [
    {
        icon: Landmark,
        title: "Government Verified",
        description: "Official PMEGP/KVIC supported enterprise recognized by the Ministry of MSME.",
        color: "text-blue-500",
        bg: "bg-blue-50 dark:bg-blue-900/10",
        tag: "Legitimacy"
    },
    {
        icon: GraduationCap,
        title: "Industry Experts",
        description: "Learn from industry professionals who teach real-world skills directly from the field.",
        color: "text-green-500",
        bg: "bg-green-50 dark:bg-green-900/10",
        tag: "Trainers"
    },
    {
        icon: Calendar,
        title: "10+ Years Experience",
        description: "A decade of excellence in professional training and industry leadership.",
        color: "text-orange-500",
        bg: "bg-orange-50 dark:bg-orange-900/10",
        tag: "Legacy"
    },
    {
        icon: Users,
        title: "Global Community",
        description: "Join a vibrant ecosystem of learners and mentors for lifelong networking.",
        color: "text-purple-500",
        bg: "bg-purple-50 dark:bg-purple-900/10",
        tag: "Network"
    },
    {
        icon: UserCheck,
        title: "Expert HR Training",
        description: "Learn from expert HRs on how to successfully crack complex interviews.",
        color: "text-indigo-500",
        bg: "bg-indigo-50 dark:bg-indigo-900/10",
        tag: "Placement"
    },
    {
        icon: LifeBuoy,
        title: "Dedicated Support",
        description: "End-to-end support from our team and HRs until you get successfully hired.",
        color: "text-pink-500",
        bg: "bg-pink-50 dark:bg-pink-900/10",
        tag: "Support"
    },
    {
        icon: Zap,
        title: "Skill Optimization",
        description: "Master technical, communication, and corporate skills for global competence.",
        color: "text-amber-500",
        bg: "bg-amber-50 dark:bg-amber-900/10",
        tag: "Growth"
    },
    {
        icon: Globe,
        title: "World Wide Presence",
        description: "Our reach is global, connecting professionals and students across continents.",
        color: "text-cyan-500",
        bg: "bg-cyan-50 dark:bg-cyan-900/10",
        tag: "Global"
    },
    {
        icon: Cpu,
        title: "Proprietary AI Engine",
        description: "Experience the future of learning with our real-time AI behavioral analysis.",
        color: "text-purple-500",
        bg: "bg-purple-50 dark:bg-purple-900/10",
        tag: "Innovation"
    },
    {
        icon: Briefcase,
        title: "Direct Placement",
        description: "Zero brokerage placement cell connecting you with 500+ hiring partners.",
        color: "text-indigo-500",
        bg: "bg-indigo-50 dark:bg-indigo-900/10",
        tag: "Career"
    },
    {
        icon: Video,
        title: "High-Fidelity Training",
        description: "High-production masterclasses from industry veterans on corporate trends.",
        color: "text-amber-500",
        bg: "bg-amber-50 dark:bg-amber-900/10",
        tag: "Learning"
    },
    {
        icon: Rocket,
        title: "Project-First Approach",
        description: "Master theory by building 10+ real-world projects for your portfolio.",
        color: "text-cyan-500",
        bg: "bg-cyan-50 dark:bg-cyan-900/10",
        tag: "Practical"
    }
]

export function WhyTrust() {
    return (
        <section className="py-24 bg-muted/30">
            <div className="container px-4">
                <div className="max-w-3xl mx-auto text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text"
                    >
                        Why Techwell is the <span className="text-primary italic">Absolute Choice</span>
                    </motion.h2>
                    <motion.div
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        transition={{ duration: 0.8 }}
                        className="w-24 h-1.5 bg-primary mx-auto rounded-full mb-8"
                    />
                    <p className="text-xl text-muted-foreground leading-relaxed">
                        Don&apos;t just take another course. Join a government-verified ecosystem
                        designed to <span className="text-foreground font-semibold">guarantee your professional evolution.</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="group relative border-none shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1.5 bg-background overflow-hidden h-full">
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <CardContent className="p-5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3 duration-500`}>
                                            <feature.icon className={`h-6 w-6 ${feature.color}`} />
                                        </div>
                                        <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50 border px-2 py-0.5 rounded-full">
                                            {feature.tag}
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors leading-tight">
                                        {feature.title}
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed text-xs mb-0 line-clamp-3">
                                        {feature.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
