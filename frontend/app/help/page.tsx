"use client"

import * as React from 'react'
import Link from 'next/link'
import { Search, Book, Video, MessageSquare, Users, HelpCircle, ChevronRight, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const helpCategories = [
    { icon: Book, title: 'Getting Started', description: 'Learn the basics of TechWell', articles: 12 },
    { icon: Video, title: 'Courses & Learning', description: 'How to access and complete courses', articles: 18 },
    { icon: Users, title: 'AI Interviews', description: 'Prepare and take mock interviews', articles: 15 },
    { icon: MessageSquare, title: 'Account & Billing', description: 'Manage your subscription', articles: 10 },
]

const popularArticles = [
    { id: '1', title: 'How to reset my password?', category: 'Account & Billing' },
    { id: '2', title: 'Downloading course certificates', category: 'Courses & Learning' },
    { id: '3', title: 'Scheduling your first AI interview', category: 'AI Interviews' },
    { id: '4', title: 'Understanding interview feedback reports', category: 'AI Interviews' },
    { id: '5', title: 'Upgrading to Pro plan', category: 'Account & Billing' },
    { id: '6', title: 'Course progress not saving?', category: 'Courses & Learning' },
]

const faqs = [
    { q: 'Is TechWell free to use?', a: 'Yes! TechWell offers a free tier with access to 3 courses and 2 AI mock interviews per month. Premium plans unlock unlimited access.' },
    { q: 'How realistic are the AI interviews?', a: 'Our AI interviews simulate real interview scenarios with industry-specific questions. Many users report the experience is very close to actual tech interviews.' },
    { q: 'Can I get a refund?', a: 'Yes, we offer a 7-day money-back guarantee on all paid plans. Contact support for assistance.' },
    { q: 'How do I contact support?', a: 'You can reach us via email at support@techwell.co.in or through the contact form on our website. We typically respond within 24 hours.' },
]

export default function HelpPage() {
    const [searchQuery, setSearchQuery] = React.useState('')

    return (
        <div className="min-h-screen py-12">
            <div className="container">
                {/* Header */}
                <div className="text-center mb-12 max-w-2xl mx-auto">
                    <h1 className="text-4xl font-bold mb-4">How can we help?</h1>
                    <p className="text-lg text-muted-foreground mb-8">
                        Search our knowledge base or browse categories below
                    </p>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search for help articles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 h-12 text-lg"
                        />
                    </div>
                </div>

                {/* Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {helpCategories.map((category, idx) => (
                        <Card key={idx} className="hover:shadow-lg transition-shadow cursor-pointer group">
                            <CardHeader className="text-center">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                                    <category.icon className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle className="text-lg">{category.title}</CardTitle>
                                <CardDescription>{category.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="text-center">
                                <span className="text-sm text-muted-foreground">{category.articles} articles</span>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Popular Articles */}
                    <div>
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <Book className="h-5 w-5 text-primary" />
                            Popular Articles
                        </h2>
                        <Card>
                            <CardContent className="p-0">
                                {popularArticles.map((article, idx) => (
                                    <Link
                                        key={article.id}
                                        href="#"
                                        className={`flex items-center justify-between p-4 hover:bg-muted/50 transition-colors ${idx !== popularArticles.length - 1 ? 'border-b' : ''
                                            }`}
                                    >
                                        <div>
                                            <p className="font-medium text-sm">{article.title}</p>
                                            <p className="text-xs text-muted-foreground">{article.category}</p>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    </Link>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* FAQs */}
                    <div>
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <HelpCircle className="h-5 w-5 text-primary" />
                            Frequently Asked Questions
                        </h2>
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
                </div>

                {/* Contact CTA */}
                <Card className="mt-12 bg-muted/50">
                    <CardContent className="py-8 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h3 className="text-xl font-semibold mb-2">Still need help?</h3>
                            <p className="text-muted-foreground">
                                Our support team is here to assist you. We typically respond within 24 hours.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Link href="/contact">
                                <Button>
                                    Contact Support
                                    <ExternalLink className="h-4 w-4 ml-2" />
                                </Button>
                            </Link>
                            <Button variant="outline">
                                Live Chat
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
