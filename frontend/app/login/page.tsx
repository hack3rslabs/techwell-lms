"use client"

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, Loader2, AlertTriangle, X, ArrowRight, ShieldCheck, Zap, Briefcase } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { login, verify2FA, isAuthenticated, user } = useAuth()

    const [email, setEmail] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [showPassword, setShowPassword] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)
    const [error, setError] = React.useState('')
    const [showIdleBanner, setShowIdleBanner] = React.useState(false)
    
    // 2FA state
    const [show2FA, setShow2FA] = React.useState(false)
    const [tempToken, setTempToken] = React.useState('')
    const [twoFactorCode, setTwoFactorCode] = React.useState('')
    const [trustDevice, setTrustDevice] = React.useState(false)

    React.useEffect(() => {
        if (isAuthenticated && user) {
            if (user.role === 'STUDENT') {
                router.push('/dashboard')
            } else if (user.role === 'EMPLOYER') {
                router.push('/employer/dashboard')
            } else if (user.role === 'FRANCHISE_ADMIN') {
                router.push('/franchise-admin')
            } else {
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
            const res = await login(email, password)
            if (res?.require2FA) {
                setTempToken(res.tempToken || '')
                setShow2FA(true)
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'An error occurred during login')
        } finally {
            setIsLoading(false)
        }
    }

    const handle2FASubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (twoFactorCode.length !== 6) return
        
        setError('')
        setIsLoading(true)

        try {
            await verify2FA(tempToken, twoFactorCode, trustDevice)
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Verification failed')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full flex bg-background">
            {/* Left Side: Branding & Value Proposition (Hidden on Mobile) */}
            <div className="hidden lg:flex flex-col justify-between w-[45%] bg-slate-900 p-12 text-white relative overflow-hidden" style={{ backgroundImage: "url('/images/login-bg.png')", backgroundSize: "cover", backgroundPosition: "center" }}>
                {/* Overlay to ensure text readability */}
                <div className="absolute inset-0 bg-black/50 pointer-events-none" />
                
                {/* Abstract Background Accents */}
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl opacity-50 mix-blend-overlay pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-black/10 rounded-full blur-3xl opacity-50 mix-blend-overlay pointer-events-none" />
                
                <div className="relative z-10 flex items-center gap-3">
                    <Link href="/">
                        <div className="p-2">
                            <Image src="/logo-dark.png" alt="Techwell" width={140} height={40} priority className="object-contain" />
                        </div>
                    </Link>
                </div>

                <div className="relative z-10 space-y-10 max-w-lg mt-20">
                    <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">
                        Empowering Your Digital Transformation
                    </h1>
                    <p className="text-lg md:text-xl text-primary-foreground/80 leading-relaxed">
                        Access intelligent tools, powerful analytics, and seamless integrations in one unified enterprise workspace.
                    </p>

                    <div className="space-y-6 pt-8">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary-foreground/10 p-3 rounded-lg backdrop-blur-sm">
                                <Zap className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Lightning Fast</h3>
                                <p className="text-primary-foreground/70 text-sm">Optimized operations and workflows</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-primary-foreground/10 p-3 rounded-lg backdrop-blur-sm">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Enterprise Security</h3>
                                <p className="text-primary-foreground/70 text-sm">Bank-grade encryption and access controls</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-primary-foreground/10 p-3 rounded-lg backdrop-blur-sm">
                                <Briefcase className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Career Architecture</h3>
                                <p className="text-primary-foreground/70 text-sm">AI-driven hiring and skill building</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-sm text-primary-foreground/60 mt-20">
                    &copy; {new Date().getFullYear()} Techwell Inc. All rights reserved.
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-24 bg-background">
                
                {/* Mobile Logo (Visible only on small screens) */}
                <div className="lg:hidden mb-12">
                    <Link href="/">
                        <Image src="/logo-light.png" alt="Techwell" width={160} height={48} className="dark:hidden" priority />
                        <Image src="/logo-dark.png" alt="Techwell" width={160} height={48} className="hidden dark:block" priority />
                    </Link>
                </div>

                <div className="w-full max-w-md space-y-8">
                    <div className="space-y-2 text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight">
                            {show2FA ? 'Two-Factor Authentication' : 'Sign In'}
                        </h2>
                        <p className="text-muted-foreground text-sm lg:text-base">
                            {show2FA ? 'Enter the 6-digit code from your authenticator app.' : 'Enter your credentials to access your workspace.'}
                        </p>
                    </div>

                    {showIdleBanner && (
                        <div className="flex items-start gap-3 p-4 text-sm font-medium text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/40">
                            <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-500 mt-0.5" />
                            <span className="flex-1">Your session expired due to inactivity. Please sign in again.</span>
                            <button onClick={() => setShowIdleBanner(false)} className="text-amber-500 hover:text-amber-700 dark:hover:text-amber-300">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 text-sm font-medium text-destructive bg-destructive/10 rounded-xl border border-destructive/20">
                            {error}
                        </div>
                    )}

                    {show2FA ? (
                        <form onSubmit={handle2FASubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="twoFactorCode" className="text-sm font-medium">Authenticator Code</label>
                                <Input
                                    id="twoFactorCode"
                                    type="text"
                                    placeholder="000000"
                                    maxLength={6}
                                    value={twoFactorCode}
                                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    required
                                    disabled={isLoading}
                                    className="h-12 rounded-xl text-center text-xl tracking-[0.5em] font-mono focus-visible:ring-primary/30"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <input 
                                    type="checkbox" 
                                    id="trustDevice" 
                                    checked={trustDevice}
                                    onChange={(e) => setTrustDevice(e.target.checked)}
                                    className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                                />
                                <label htmlFor="trustDevice" className="text-sm font-medium text-muted-foreground">
                                    Trust this device for 30 days
                                </label>
                            </div>
                            <Button type="submit" className="w-full h-12 text-base font-semibold rounded-xl" disabled={isLoading || twoFactorCode.length !== 6}>
                                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Verify & Continue'}
                            </Button>
                            <div className="text-center">
                                <button type="button" onClick={() => setShow2FA(false)} className="text-sm text-primary hover:underline font-medium">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium">Work Email</label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="h-12 rounded-xl focus-visible:ring-primary/30"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label htmlFor="password" className="text-sm font-medium">Password</label>
                                    <Link 
                                        href={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ''}`} 
                                        className="text-sm text-primary hover:underline font-medium"
                                    >
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
                                        className="h-12 rounded-xl pr-12 focus-visible:ring-primary/30"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <Button type="submit" className="w-full h-12 text-base font-semibold rounded-xl mt-6 group" disabled={isLoading}>
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        Sign In
                                        <ArrowRight className="ml-2 w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </form>
                    )}

                    <div className="pt-8 text-center lg:text-left text-sm text-muted-foreground">
                        Don't have an account yet?{' '}
                        <Link href="/register" className="text-primary font-semibold hover:underline">
                            Request access
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
