"use client"

import * as React from 'react'
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const testimonials = [
    {
        id: 1,
        name: 'Priya Sharma',
        role: 'SDE at Google',
        company: 'google',
        image: null,
        rating: 5,
        quote: "TechWell's AI interviews helped me crack Google in just 3 months! The STAR method feedback was incredibly valuable.",
        package: '₹45 LPA',
    },
    {
        id: 2,
        name: 'Rahul Verma',
        role: 'Software Engineer at Microsoft',
        company: 'microsoft',
        image: null,
        rating: 5,
        quote: 'The multi-panel interviews simulated exactly what I faced in my real interviews. Highly recommend!',
        package: '₹38 LPA',
    },
    {
        id: 3,
        name: 'Ananya Patel',
        role: 'Frontend Developer at Amazon',
        company: 'amazon',
        image: null,
        rating: 5,
        quote: 'The adaptive learning platform helped me identify and improve my weak areas. Got placed in my dream company!',
        package: '₹32 LPA',
    },
    {
        id: 4,
        name: 'Vikram Singh',
        role: 'Data Scientist at Meta',
        company: 'meta',
        image: null,
        rating: 5,
        quote: 'Best investment I made in my career. The AI feedback is incredibly accurate and helpful.',
        package: '₹50 LPA',
    },
    {
        id: 5,
        name: 'Sneha Reddy',
        role: 'Backend Engineer at Flipkart',
        company: 'flipkart',
        image: null,
        rating: 5,
        quote: 'From zero confidence to cracking multiple offers. TechWell transformed my interview preparation.',
        package: '₹28 LPA',
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
        <section className="py-5 bg-muted/30">
            <div className="container">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Student Success Stories
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Join thousands of students who landed their dream jobs with TechWell
                    </p>
                </div>

                {/* Desktop Grid */}
                <div className="hidden lg:grid grid-cols-3 gap-6 mb-8">
                    {testimonials.slice(0, 3).map((testimonial) => (
                        <TestimonialCard key={testimonial.id} testimonial={testimonial} />
                    ))}
                </div>

                {/* Mobile Carousel */}
                <div className="lg:hidden">
                    <div className="relative">
                        <TestimonialCard testimonial={testimonials[currentIndex]} />
                        <div className="flex justify-center gap-4 mt-6">
                            <Button variant="outline" size="icon" onClick={prevTestimonial}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="flex items-center gap-2">
                                {testimonials.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`h-2 w-2 rounded-full transition-colors ${idx === currentIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                                            }`}
                                    />
                                ))}
                            </div>
                            <Button variant="outline" size="icon" onClick={nextTestimonial}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Stats Banner */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 p-6 bg-primary/5 rounded-2xl">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-primary">95%</div>
                        <div className="text-sm text-muted-foreground">Placement Rate</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-primary">10,000+</div>
                        <div className="text-sm text-muted-foreground">Students Trained</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-primary">500+</div>
                        <div className="text-sm text-muted-foreground">Hiring Partners</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-primary">4.9/5</div>
                        <div className="text-sm text-muted-foreground">Average Rating</div>
                    </div>
                </div>
            </div>
        </section>
    )
}

function TestimonialCard({ testimonial }: { testimonial: typeof testimonials[0] }) {
    return (
        <Card className="h-full">
            <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                </div>
                <Quote className="h-8 w-8 text-primary/20 mb-2" />
                <p className="text-muted-foreground mb-6 italic">&quot;{testimonial.quote}&quot;</p>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center font-semibold text-primary">
                            {testimonial.name.charAt(0)}
                        </div>
                        <div>
                            <p className="font-medium text-sm">{testimonial.name}</p>
                            <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                        </div>
                    </div>
                    {testimonial.package && (
                        <div className="text-right">
                            <p className="text-sm font-bold text-green-600">{testimonial.package}</p>
                            <p className="text-xs text-muted-foreground">Package</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
