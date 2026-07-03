"use client"

import * as React from 'react'
import Link from 'next/link'
import { Check, X, Zap, Crown, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

const plans = [
    {
        name: 'Starter',
        icon: Zap,
        price: '₹0',
        period: 'forever',
        description: 'Get started with basic features',
        features: [
            { text: '3 free courses', included: true },
            { text: '2 AI mock interviews/month', included: true },
            { text: 'Standard feedback reports', included: true },
            { text: 'Community access', included: true },
            { text: 'Advanced analytics', included: false },
            { text: 'Priority support', included: false },
            { text: 'Professional Certificate', included: false },
        ],
        cta: 'Get Started',
        popular: false,
    },
    {
        name: 'Pro',
        icon: Crown,
        price: '₹999',
        period: '/month',
        description: 'Best for serious learners',
        features: [
            { text: 'All courses included', included: true },
            { text: 'Unlimited AI interviews', included: true },
            { text: 'Advanced feedback reports', included: true },
            { text: 'Community access', included: true },
            { text: 'Advanced analytics', included: true },
            { text: 'Priority support', included: true },
            { text: 'Digital certificate', included: true },
        ],
        cta: 'Start Pro Trial',
        popular: true,
    },
    {
        name: 'Enterprise',
        icon: Rocket,
        price: 'Custom',
        period: '',
        description: 'For teams and organizations',
        features: [
            { text: 'Everything in Pro', included: true },
            { text: 'Custom branding', included: true },
            { text: 'Dedicated account manager', included: true },
            { text: 'API access', included: true },
            { text: 'SSO integration', included: true },
            { text: 'Custom reporting', included: true },
            { text: 'On-site training', included: true },
        ],
        cta: 'Contact Sales',
        popular: false,
    },
]

const faqs = [
    { q: 'Can I cancel anytime?', a: 'Yes, you can cancel your subscription at any time. No questions asked.' },
    { q: 'Is there a free trial?', a: 'Pro plan comes with a 7-day free trial. No credit card required.' },
    { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, UPI, Net Banking, and Wallets.' },
    { q: 'Can I switch plans later?', a: 'Absolutely! You can upgrade or downgrade your plan at any time.' },
]

export default function PricingPage() {
    return (
        <div className="min-h-screen py-20">
            <div className="container">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
                    <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                        Choose the plan that fits your learning goals. Upgrade anytime.
                    </p>
                </div>

                {/* Plans */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {plans.map((plan, idx) => (
                        <Card
                            key={idx}
                            className={`relative flex flex-col ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                                    Most Popular
                                </div>
                            )}
                            <CardHeader className="text-center">
                                <div className={`h-12 w-12 rounded-full mx-auto mb-4 flex items-center justify-center ${plan.popular ? 'bg-primary text-primary-foreground' : 'bg-primary/10'
                                    }`}>
                                    <plan.icon className={`h-6 w-6 ${plan.popular ? '' : 'text-primary'}`} />
                                </div>
                                <CardTitle className="text-xl">{plan.name}</CardTitle>
                                <CardDescription>{plan.description}</CardDescription>
                                <div className="mt-4">
                                    <span className="text-4xl font-bold">{plan.price}</span>
                                    <span className="text-muted-foreground">{plan.period}</span>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <ul className="space-y-3">
                                    {plan.features.map((feature, fidx) => (
                                        <li key={fidx} className="flex items-center gap-3 text-sm">
                                            {feature.included ? (
                                                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                            ) : (
                                                <X className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
                                            )}
                                            <span className={feature.included ? '' : 'text-muted-foreground/50'}>
                                                {feature.text}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Link href="/register" className="w-full">
                                    <Button
                                        className="w-full"
                                        variant={plan.popular ? 'default' : 'outline'}
                                        size="lg"
                                    >
                                        {plan.cta}
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {/* FAQs */}
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <Card key={idx}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">{faq.q}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">{faq.a}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center mt-16">
                    <p className="text-muted-foreground mb-4">
                        Still have questions?
                    </p>
                    <Link href="/contact">
                        <Button variant="outline">Contact Us</Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
