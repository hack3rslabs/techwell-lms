"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import api from "@/lib/api"

interface SuccessStory {
    id: string;
    imagePath: string;
    url: string | null;
    altText: string | null;
    isActive: boolean;
    order: number;
}

export function Testimonials() {
    const [stories, setStories] = React.useState<SuccessStory[]>([])
    const [currentIndex, setCurrentIndex] = React.useState(0)
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
        const fetchStories = async () => {
            try {
                const res = await api.get('/success-stories')
                setStories(res.data || [])
            } catch (error) {
                console.error('Error fetching success stories:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchStories()
    }, [])

    const nextTestimonial = () => {
        setCurrentIndex((prev) => (prev + 1) % stories.length)
    }

    const prevTestimonial = () => {
        setCurrentIndex((prev) => (prev - 1 + stories.length) % stories.length)
    }

    if (isLoading) {
        return (
            <section className="bg-muted/30 py-16 md:py-20">
                <div className="container text-center text-muted-foreground animate-pulse">Loading Success Stories...</div>
            </section>
        )
    }

    // Fallback if no stories uploaded yet
    if (stories.length === 0) {
        return (
            <section className="bg-muted/30 py-16 md:py-20">
                <div className="container">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold md:text-4xl">Student Success Stories</h2>
                        <p className="mx-auto max-w-2xl text-base text-muted-foreground md:text-lg">
                            Join thousands of students who landed their target roles with Techwell.
                        </p>
                    </div>
                    <div className="text-center text-muted-foreground py-12">More success stories coming soon!</div>
                    <StatsSection />
                </div>
            </section>
        )
    }

    return (
        <section className="bg-muted/30 py-16 md:py-20">
            <div className="container">
                <div className="mb-12 text-center">
                    <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                        Student Success Stories
                    </h2>
                    <p className="mx-auto max-w-2xl text-base text-muted-foreground md:text-lg">
                        See what our students are saying about their journey and placements.
                    </p>
                </div>

                {/* Desktop Grid */}
                <div className="mb-8 hidden grid-cols-2 lg:grid-cols-3 gap-6 lg:grid">
                    {stories.slice(0, 6).map((story) => (
                        <StoryCard key={story.id} story={story} />
                    ))}
                </div>

                {/* Mobile Carousel */}
                <div className="lg:hidden">
                    <div className="relative">
                        <StoryCard story={stories[currentIndex]} />
                        <div className="mt-6 flex justify-center gap-4">
                            <Button variant="outline" size="icon" onClick={prevTestimonial}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="flex items-center gap-2">
                                {stories.map((_, idx) => (
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

                <StatsSection />
            </div>
        </section>
    )
}

function StatsSection() {
    return (
        <div className="mt-12 grid grid-cols-2 gap-6 rounded-3xl border border-primary/10 bg-primary/5 p-6 md:grid-cols-4 md:p-8">
            <Stat value="95%" label="Placement Rate" />
            <Stat value="10,000+" label="Students Trained" />
            <Stat value="500+" label="Hiring Partners" />
            <Stat value="4.9/5" label="Average Rating" />
        </div>
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

function StoryCard({ story }: { story: SuccessStory }) {
    const content = (
        <Card className="h-full border-border/70 bg-card/95 shadow-sm overflow-hidden group hover:border-primary/50 transition-colors cursor-pointer relative">
            <CardContent className="p-0 relative aspect-auto min-h-[250px] flex items-center justify-center bg-muted/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                    src={`${process.env.NEXT_PUBLIC_API_URL}${story.imagePath}`} 
                    alt={story.altText || "Student Review"}
                    className="w-full h-full object-contain"
                />
                {story.url && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="secondary" className="gap-2 font-semibold">
                            Read Full Review <ExternalLink className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    if (story.url) {
        return (
            <a href={story.url} target="_blank" rel="noreferrer" className="block">
                {content}
            </a>
        )
    }

    return content;
}
