"use client"

import Link from 'next/link'
import { Check, Zap, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth-context'

export function PricingSection() {
    const { isAuthenticated, isLoading } = useAuth()

    if (isLoading || isAuthenticated) return null

    return (
        <section className="py-16 bg-muted/30">
            <div className="container">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Choose the plan that fits your learning goals
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Starter Plan */}
                    <Card className="relative hover:shadow-lg transition-shadow">
                        <CardHeader className="text-center">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                <Zap className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle className="text-xl">Starter Plan</CardTitle>
                            <CardDescription>Perfect for beginners</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <div className="mb-6">
                                <span className="text-4xl font-bold">₹0</span>
                                <span className="text-muted-foreground">/month</span>
                            </div>
                            <ul className="space-y-3 text-left">
                                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>2 AI mock interviews</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>Access to basic courses</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>Standard feedback reports</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>Community access</span>
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Link href="/register" className="w-full">
                                <Button className="w-full" variant="outline">Start for Free</Button>
                            </Link>
                        </CardFooter>
                    </Card>

                    {/* Pro Plan */}
                    <Card className="relative border-primary shadow-xl scale-105 z-10 bg-background">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full">
                            Most Popular
                        </div>
                        <CardHeader className="text-center">
                            <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
                                <Zap className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <CardTitle className="text-xl">Pro Plan</CardTitle>
                            <CardDescription>Serious career growth</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <div className="mb-6">
                                <span className="text-4xl font-bold">₹999</span>
                                <span className="text-muted-foreground">/month</span>
                            </div>
                            <ul className="space-y-3 text-left">
                                <li className="flex items-center gap-2 text-sm">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span className="font-medium">Unlimited AI interviews</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>All premium courses</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>Advanced analytics</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>Priority support</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>Professional Certificates</span>
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Link href="/register" className="w-full">
                                <Button className="w-full shadow-lg shadow-primary/20">Upgrade to Pro</Button>
                            </Link>
                        </CardFooter>
                    </Card>

                    {/* Enterprise Plan */}
                    <Card className="relative hover:shadow-lg transition-shadow">
                        <CardHeader className="text-center">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                <Crown className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle className="text-xl">Enterprise</CardTitle>
                            <CardDescription>For universities & teams</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <div className="mb-6">
                                <span className="text-3xl font-bold">Custom</span>
                                <span className="text-muted-foreground"> Plan</span>
                            </div>
                            <ul className="space-y-3 text-left">
                                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>Everything in Pro</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>Custom branding</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>SSO & LMS integration</span>
                                </li>
                                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>Dedicated account manager</span>
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Link href="/contact" className="w-full">
                                <Button className="w-full" variant="outline">Contact Sales</Button>
                            </Link>
                        </CardFooter>
                    </Card>
                </div>

                <div className="text-center mt-8">
                    <Link href="/pricing" className="text-sm text-primary hover:underline">
                        View detailed pricing comparison →
                    </Link>
                </div>
            </div>
        </section>
    )
}
