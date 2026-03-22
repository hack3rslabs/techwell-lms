"use client"

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CTASection() {
    return (
        <section className="py-24 bg-gradient-to-br from-primary via-primary to-purple-700 text-primary-foreground relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] opacity-20 pointer-events-none" />
            <div className="container text-center">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                    Don&apos;t Just Dream. <span className="underline decoration-secondary italic">Launch.</span>
                </h2>
                <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Join over 15,000 students who have already secured their futures.
                    <span className="block font-semibold mt-2">Start your 7-day masterclass trial today.</span>
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/register">
                        <Button size="lg" variant="secondary" className="text-lg px-8">
                            Start Your Free Trial
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                    <Link href="/contact">
                        <Button size="lg" variant="outline" className="text-lg px-8 border-white/30 text-white hover:bg-white/10">
                            Schedule a Demo
                        </Button>
                    </Link>
                </div>
                <p className="text-sm opacity-70 mt-6">
                    No credit card required • Cancel anytime
                </p>
            </div>
        </section>
    )
}
