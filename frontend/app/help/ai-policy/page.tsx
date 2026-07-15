"use client"

import Link from 'next/link'
import { Bot, ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function AIPolicyPage() {
    return (
        <div className="min-h-screen py-20">
            <div className="container max-w-4xl">
                <div className="flex items-center gap-4 mb-12">
                    <div className="h-14 w-14 rounded-xl bg-violet-500/20 flex items-center justify-center">
                        <Bot className="h-7 w-7 text-violet-500" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold">AI Services & AI Interview Policy</h1>
                        <p className="text-muted-foreground">Effective Date: [Current Date]</p>
                    </div>
                </div>

                <div className="space-y-8">
                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <span className="h-8 w-8 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-500 text-sm font-bold">1</span>
                                AI-Generated Feedback & Decisions
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Our platform utilizes Artificial Intelligence (AI) to evaluate interview responses and provide feedback. While we strive for high accuracy, the AI is a tool meant to simulate real-world scenarios and assist learning. Techwell does not guarantee 100% accuracy of the AI's feedback, nor should it be the sole basis for critical hiring decisions without human review.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <span className="h-8 w-8 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-500 text-sm font-bold">2</span>
                                Bias & Fairness
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We actively monitor our AI systems for biases based on accent, vocabulary, or demographic factors. If you believe your assessment was unfair due to AI misinterpretation, you may request a manual review by contacting our support team.
                            </p>
                        </CardContent>
                    </Card>

                    <div className="mt-12 text-center">
                        <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline">
                            <ArrowLeft className="h-4 w-4" /> Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
