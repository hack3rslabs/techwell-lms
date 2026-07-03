"use client"

import * as React from "react"
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const testimonials = [
    {
        id: 1,
        name: "Priya Sharma",
        role: "SDE at Google",
        company: "google",
        image: null,
        rating: 5,
        quote: "Techwell's AI interviews helped me crack Google in just 3 months. The STAR method feedback was incredibly valuable.",
        package: "INR 45 LPA",
    },
    {
        id: 2,
        name: "Rahul Verma",
        role: "Software Engineer at Microsoft",
        company: "microsoft",
        image: null,
        rating: 5,
        quote: "The multi-panel interviews simulated exactly what I faced in my real interviews. Highly recommend.",
        package: "INR 38 LPA",
    },
    {
        id: 3,
        name: "Ananya Patel",
        role: "Frontend Developer at Amazon",
        company: "amazon",
        image: null,
        rating: 5,
        quote: "The adaptive learning platform helped me identify and improve my weak areas. I got placed in my dream company.",
        package: "INR 32 LPA",
    },
    {
        id: 4,
        name: "Vikram Singh",
        role: "Data Scientist at Meta",
        company: "meta",
        image: null,
        rating: 5,
        quote: "Best investment I made in my career. The AI feedback is accurate, specific, and useful.",
        package: "INR 50 LPA",
    },
    {
        id: 5,
        name: "Sneha Reddy",
        role: "Backend Engineer at Flipkart",
        company: "flipkart",
        image: null,
        rating: 5,
        quote: "From zero confidence to multiple offers. Techwell transformed how I prepared for interviews.",
        package: "INR 28 LPA",
    },
]

export function Testimonials() {
    const [currentIndex, setCurrentIndex] = React.useState(0)

    const nextTestimonial = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }

    const prevTestimonial = () => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    }

    return (
        <section className="bg-muted/30 py-16 md:py-20">
            <div className="container">
                <div className="mb-12 text-center">
                    <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                        Student Success Stories
                    </h2>
                    <p className="mx-auto max-w-2xl text-base text-muted-foreground md:text-lg">
                        Join thousands of students who landed their target roles with Techwell.
                    </p>
                </div>

                <div className="mb-8 hidden grid-cols-3 gap-6 lg:grid">
                    {testimonials.slice(0, 3).map((testimonial) => (
                        <TestimonialCard key={testimonial.id} testimonial={testimonial} />
                    ))}
                </div>

                <div className="lg:hidden">
                    <div className="relative">
                        <TestimonialCard testimonial={testimonials[currentIndex]} />
                        <div className="mt-6 flex justify-center gap-4">
                            <Button variant="outline" size="icon" onClick={prevTestimonial}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="flex items-center gap-2">
                                {testimonials.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`h-2 w-2 rounded-full transition-colors ${idx === currentIndex ? "bg-primary" : "bg-muted-foreground/30"}`}
                                    />
                                ))}
                            </div>
                            <Button variant="outline" size="icon" onClick={nextTestimonial}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="mt-12 grid grid-cols-2 gap-6 rounded-3xl border border-primary/10 bg-primary/5 p-6 md:grid-cols-4 md:p-8">
                    <Stat value="95%" label="Placement Rate" />
                    <Stat value="10,000+" label="Students Trained" />
                    <Stat value="500+" label="Hiring Partners" />
                    <Stat value="4.9/5" label="Average Rating" />
                </div>
            </div>
        </section>
    )
}

function Stat({ value, label }: { value: string; label: string }) {
    return (
        <div className="text-center">
            <div className="text-3xl font-bold text-primary">{value}</div>
            <div className="text-sm text-muted-foreground">{label}</div>
        </div>
    )
}

function TestimonialCard({ testimonial }: { testimonial: typeof testimonials[0] }) {
    return (
        <Card className="h-full border-border/70 bg-card/95 shadow-sm">
            <CardContent className="pt-6">
                <div className="mb-4 flex items-center gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                </div>
                <Quote className="mb-2 h-8 w-8 text-primary/20" />
                <p className="mb-6 text-sm leading-6 text-muted-foreground italic md:text-base">
                    &quot;{testimonial.quote}&quot;
                </p>
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-cyan-500/20 font-semibold text-primary">
                            {testimonial.name.charAt(0)}
                        </div>
                        <div>
                            <p className="text-sm font-medium">{testimonial.name}</p>
                            <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-bold text-green-600">{testimonial.package}</p>
                        <p className="text-xs text-muted-foreground">Package</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
