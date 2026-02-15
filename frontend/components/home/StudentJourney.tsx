"use client"
import { Rocket, BookOpen, Award, Briefcase, ArrowRight, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useState } from "react"

const steps = [
    {
        number: "1",
        title: "Enroll & Start",
        description: "Choose your course and begin your learning journey with demo classes",
        icon: Rocket,
        color: "text-blue-600",
        bgColor: "bg-blue-100 dark:bg-blue-900/30",
        borderColor: "border-blue-200 dark:border-blue-800",
        href: "/courses"
    },
    {
        number: "2",
        title: "Learn & Practice",
        description: "Attend live classes, complete assignments, and work on real projects",
        icon: BookOpen,
        color: "text-purple-600",
        bgColor: "bg-purple-100 dark:bg-purple-900/30",
        borderColor: "border-purple-200 dark:border-purple-800",
        href: "/interviews"
    },
    {
        number: "3",
        title: "Get Certified",
        description: "Complete assessments and receive industry-recognized certification",
        icon: Award,
        color: "text-orange-600",
        bgColor: "bg-orange-100 dark:bg-orange-900/30",
        borderColor: "border-orange-200 dark:border-orange-800",
        href: "/dashboard?tab=certificates",
        protected: true
    },
    {
        number: "4",
        title: "Land Your Job",
        description: "Get placement support, attend interviews, and start your career",
        icon: Briefcase,
        color: "text-green-600",
        bgColor: "bg-green-100 dark:bg-green-900/30",
        borderColor: "border-green-200 dark:border-green-800",
        href: "/dashboard?tab=applications",
        protected: true
    },
]

export function StudentJourney() {
    const router = useRouter()
    const { isAuthenticated, isLoading: authLoading } = useAuth()
    const [loadingStep, setLoadingStep] = useState<number | null>(null)

    const handleStepClick = (stepIndex: number, href: string, isProtected?: boolean) => {
        if (isProtected && !isAuthenticated) {
            router.push(`/login?redirect=${encodeURIComponent(href)}`)
            return
        }

        setLoadingStep(stepIndex)
        router.push(href)
    }

    return (
        <section className="py-16 bg-background relative overflow-hidden">
            <div className="container px-4 text-center">
                <div className="max-w-3xl mx-auto mb-20 pointer-events-none">
                    <h2 className="text-4xl font-bold tracking-tight mb-6">
                        Your Path to <span className="text-primary italic">Success</span>
                    </h2>
                    <div className="w-24 h-1 bg-primary mx-auto rounded-full mb-6" />
                    <p className="text-lg text-muted-foreground">
                        A simple, proven 4-step process designed to take you from beginner to professional.
                    </p>
                </div>

                <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden lg:block absolute top-[2.5rem] left-[12%] right-[12%] h-1 bg-gradient-to-r from-muted via-muted-foreground/20 to-muted -z-10 rounded-full" />

                    {steps.map((step, index) => (
                        <div key={index} className="relative group">
                            {/* Arrow for Desktop (except last item) */}
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute -right-6 top-8 transform -translate-y-1/2 z-0 text-muted-foreground/30">
                                    <ArrowRight className="w-8 h-8" />
                                </div>
                            )}

                            <Card
                                className={cn(
                                    "relative h-full transition-all duration-300 hover:shadow-xl border-2 cursor-pointer",
                                    "hover:-translate-y-2 active:scale-[0.98]",
                                    step.borderColor,
                                    loadingStep === index && "opacity-70"
                                )}
                                onClick={() => handleStepClick(index, step.href, step.protected)}
                            >
                                <CardContent className="pt-10 pb-10 px-6 flex flex-col items-center text-center">
                                    {/* Step Number Badge */}
                                    <div className={cn(
                                        "absolute -top-6 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-sm border-2 border-background",
                                        step.bgColor,
                                        step.color
                                    )}>
                                        {loadingStep === index ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            step.number
                                        )}
                                    </div>

                                    <div className={cn(
                                        "mb-6 p-5 rounded-2xl bg-secondary/30",
                                        "group-hover:scale-110 group-hover:bg-secondary/50 transition-all duration-300"
                                    )}>
                                        <step.icon className={cn("w-10 h-10", step.color)} />
                                    </div>

                                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                                        {step.title}
                                    </h3>
                                    <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                                        {step.description}
                                    </p>

                                    <div className="mt-6 flex items-center text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                        GET STARTED <ArrowRight className="ml-1 h-3 w-3" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
