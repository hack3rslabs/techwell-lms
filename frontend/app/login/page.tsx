"use client"

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Loader2, AlertTriangle, X } from 'lucide-react'
import { LoginCharacter } from '@/components/auth/LoginCharacter'

export default function LoginPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { login, isAuthenticated, user } = useAuth()

    const [email, setEmail] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [showPassword, setShowPassword] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)
    const [error, setError] = React.useState('')
    const [charState, setCharState] = React.useState<"normal" | "shy" | "peeking">("normal")
    const [showIdleBanner, setShowIdleBanner] = React.useState(false)

    React.useEffect(() => {
        if (isAuthenticated && user) {
            if (user.role === 'STUDENT') {
                router.push('/dashboard')
            } else {
                // SUPER_ADMIN, ADMIN, STAFF, INSTRUCTOR, INSTITUTE_ADMIN, EMPLOYER, etc.
                router.push('/admin')
            }
        }
    }, [isAuthenticated, user, router])

    React.useEffect(() => {
        if (searchParams.get('reason') === 'idle') {
            setShowIdleBanner(true)
        }
    }, [searchParams])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            await login(email, password)
            // Relies on useEffect to handle role-based redirection
        } catch (err: unknown) {
            const errorMessage = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Login failed. Please try again.'
            setError(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    // Character animation logic
    const handlePasswordFocus = () => {
        if (showPassword) setCharState("peeking")
        else setCharState("shy")
    }

    const handlePasswordBlur = () => {
        setCharState("normal")
    }

    React.useEffect(() => {
        if (charState === "shy" && showPassword) {
            setCharState("peeking")
        } else if (charState === "peeking" && !showPassword) {
            setCharState("shy")
        }
    }, [showPassword, charState])

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8 bg-gradient-to-br from-background via-background to-primary/5">
            <div className="w-full max-w-5xl space-y-6">
                <div className="flex flex-col items-center mb-8">
                    <Link href="/">
                        <Image src="/logo-light.png" alt="TechWell" width={160} height={48} className="dark:hidden" priority />
                        <Image src="/logo-dark.png" alt="TechWell" width={160} height={48} className="hidden dark:block" priority />
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left Side: Animated Character & Brand Message */}
                    <div className="hidden lg:flex flex-col items-center justify-center p-12 bg-primary/5 rounded-[3rem] border border-primary/10 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/20 transition-colors" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full -ml-16 -mb-16 blur-3xl group-hover:bg-primary/20 transition-colors" />

                        <LoginCharacter state={charState} />

                        <div className="text-center mt-12 space-y-4 relative z-10">
                            <h2 className="text-3xl font-extrabold text-primary tracking-tight">Secure Your Future</h2>
                            <p className="text-muted-foreground text-lg max-w-[320px] leading-relaxed">
                                Join the ecosystem of innovation and professional growth with TechWell.
                            </p>
                            <div className="pt-4 flex justify-center gap-2">
                                <div className="h-1.5 w-8 rounded-full bg-primary/40" />
                                <div className="h-1.5 w-1.5 rounded-full bg-primary/20" />
                                <div className="h-1.5 w-1.5 rounded-full bg-primary/20" />
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Login Form */}
                    <div className="flex flex-col space-y-8">
                        {/* Mobile Character View */}
                        <div className="lg:hidden scale-75 transform -mb-8">
                            <LoginCharacter state={charState} />
                        </div>

                        <Card className="border-muted shadow-2xl backdrop-blur-sm bg-background/90 rounded-2xl">
                            <CardHeader className="text-center pt-10 pb-6">
                                <CardTitle className="text-3xl font-bold tracking-tight">Welcome Back</CardTitle>
                                <CardDescription className="text-base">Sign in to your TechWell account</CardDescription>
                            </CardHeader>
                            <CardContent className="px-8 pb-10">
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* Idle session expired banner */}
                                {showIdleBanner && (
                                    <div
                                        role="alert"
                                        className="flex items-start gap-3 p-4 text-sm font-medium text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/40 animate-in fade-in slide-in-from-top-2 duration-300"
                                    >
                                        <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-500" />
                                        <span className="flex-1">
                                            You were automatically logged out due to inactivity.
                                            Please sign in again to continue.
                                        </span>
                                        <button
                                            aria-label="Dismiss"
                                            onClick={() => setShowIdleBanner(false)}
                                            className="text-amber-500 hover:text-amber-700 dark:hover:text-amber-300 transition-colors flex-shrink-0"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}

                                {error && (
                                        <div className="p-4 text-sm font-medium text-red-500 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/30 animate-in fade-in zoom-in duration-300">
                                            {error}
                                        </div>
                                    )}

                                    <div className="space-y-2.5">
                                        <label htmlFor="email" className="text-sm font-semibold ml-1">
                                            Email Address
                                        </label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="name@company.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={isLoading}
                                            onFocus={() => setCharState("normal")}
                                            className="h-12 rounded-xl focus:ring-primary/20"
                                        />
                                    </div>

                                    <div className="space-y-2.5">
                                        <div className="flex justify-between items-center ml-1">
                                            <label htmlFor="password" className="text-sm font-semibold">
                                                Password
                                            </label>
                                            <Link href="/forgot-password" className="text-xs text-primary hover:underline font-medium">
                                                Forgot password?
                                            </Link>
                                        </div>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                disabled={isLoading}
                                                className="h-12 rounded-xl pr-12 focus:ring-primary/20"
                                                onFocus={handlePasswordFocus}
                                                onBlur={handlePasswordBlur}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-1"
                                            >
                                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <Button type="submit" className="w-full h-14 text-lg font-bold shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-primary/25 rounded-xl transition-all active:scale-[0.98]" disabled={isLoading}>
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Verifying Identity...
                                            </>
                                        ) : (
                                            'Sign In'
                                        )}
                                    </Button>
                                </form>

                                <div className="mt-8 pt-6 border-t border-muted/60 text-center text-sm">
                                    <span className="text-muted-foreground">New to TechWell? </span>
                                    <Link href="/register" className="text-primary hover:underline font-bold">
                                        Create a free account
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

