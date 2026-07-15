"use client"

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft, CheckCircle2, ShieldCheck, Zap, Briefcase, FileText, Video } from 'lucide-react'

export default function UpgradeHubPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const upgradeModule = searchParams.get('module') || 'resume'
    const { user, isLoading: authLoading } = useAuth()
    const [isUpgrading, setIsUpgrading] = React.useState(false)
    const [success, setSuccess] = React.useState(false)

    React.useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login')
        }
    }, [authLoading, user, router])

    const handleUpgrade = async () => {
        setIsUpgrading(true)
        try {
            await api.post('/users/upgrade-test', { module: upgradeModule })
            setSuccess(true)
            setTimeout(() => {
                router.push(`/dashboard?tab=${upgradeModule === 'resume' ? 'resume' : 'interviews'}`)
                window.location.reload() // Force reload to refresh user context
            }, 2000)
        } catch (error) {
            alert('Failed to upgrade. Please try again.')
            setIsUpgrading(false)
        }
    }

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const plans = {
        resume: {
            title: 'AI Resume Builder Access',
            description: 'Unlock unlimited ATS resume builder access, downloads, and AI enhancement.',
            price: '₹4,999',
            icon: FileText,
            features: [
                'Unlimited PDF Downloads',
                'AI-Powered Content Enhancement',
                'ATS Optimization Score',
                'Multiple Premium Templates'
            ]
        },
        interview: {
            title: 'AI Mock Interview Pro',
            description: 'Practice with an AI recruiter and get detailed analytics and feedback.',
            price: '₹7,999',
            icon: Video,
            features: [
                'Unlimited AI Mock Interviews',
                'Role-specific Scenarios',
                'Real-time Feedback & Scoring',
                'Video Recording Analysis'
            ]
        }
    }

    const currentPlan = plans[upgradeModule as keyof typeof plans] || plans.resume
    const Icon = currentPlan.icon

    if (success) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <h1 className="text-4xl font-bold text-foreground mb-4">Upgrade Successful!</h1>
                <p className="text-lg text-muted-foreground max-w-md mx-auto">
                    Your account has been upgraded. Redirecting you to your dashboard...
                </p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[20%] right-[-5%] w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container py-12 relative z-10 max-w-4xl mx-auto">
                <Button variant="ghost" onClick={() => router.back()} className="mb-8">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>

                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Upgrade Your Access</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Take your career to the next level with our premium tools and features.
                    </p>
                </div>

                <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 opacity-50 pointer-events-none"></div>
                    
                    <div className="flex flex-col md:flex-row gap-12 relative z-10">
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-4 bg-primary/10 rounded-2xl">
                                    <Icon className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-foreground">{currentPlan.title}</h2>
                                    <div className="text-primary font-semibold text-xl mt-1">{currentPlan.price} <span className="text-sm text-muted-foreground font-normal">/ lifetime</span></div>
                                </div>
                            </div>
                            <p className="text-muted-foreground mb-8 text-lg">
                                {currentPlan.description}
                            </p>
                            
                            <ul className="space-y-4 mb-8">
                                {currentPlan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <div className="mt-1 bg-primary/20 rounded-full p-1">
                                            <CheckCircle2 className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="text-foreground">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        <div className="flex-1 flex flex-col justify-center bg-muted/50 rounded-2xl p-8 text-center border border-border/50">
                            <div className="mb-6">
                                <ShieldCheck className="h-12 w-12 text-primary mx-auto mb-4" />
                                <h3 className="font-bold text-xl mb-2">Test Site Mode</h3>
                                <p className="text-sm text-muted-foreground">Since this site is in test mode, you can unlock this feature for free to test the functionality.</p>
                            </div>
                            <Button 
                                size="lg" 
                                className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                                onClick={handleUpgrade}
                                disabled={isUpgrading}
                            >
                                {isUpgrading ? (
                                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</>
                                ) : (
                                    <><Zap className="mr-2 h-5 w-5" /> Unlock Access Now</>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
