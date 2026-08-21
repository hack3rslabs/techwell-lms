"use client"

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, Loader2, AlertTriangle, X, ArrowRight, ShieldCheck, Lock, CheckCircle2, GraduationCap, Briefcase, Building2, Home } from 'lucide-react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { Suspense } from 'react'

function LoginForm() {
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
            const res = await login(email, password, trustDevice)
            if (res?.require2FA) {
                setTempToken(res.tempToken || '')
                setShow2FA(true)
            }
        } catch (err: any) {
            if (err.response?.status === 401) {
                setError('Invalid User ID or Password')
            } else {
                setError(err.response?.data?.message || err.message || 'An error occurred during login')
            }
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
            await verify2FA(twoFactorCode, tempToken, trustDevice)
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Verification failed')
        } finally {
            setIsLoading(false)
        }
    }

    // Clean animations
    const containerVariants: Variants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut", staggerChildren: 0.1 } },
        exit: { opacity: 0, y: -10, transition: { duration: 0.3 } }
    }
    
    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
            {/* Clean Corporate Background Pattern with subtle gradient glow */}
            <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -z-10 mix-blend-multiply dark:mix-blend-screen opacity-50"></div>
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] -z-10 mix-blend-multiply dark:mix-blend-screen opacity-50"></div>

            {/* Mobile Home Button */}
            <div className="lg:hidden absolute top-4 left-4 z-50">
                <Link href="/">
                    <Button variant="outline" size="sm" className="rounded-full bg-white dark:bg-slate-900 shadow-sm">
                        <Home className="w-4 h-4 mr-2" />
                        Home
                    </Button>
                </Link>
            </div>

            <div className="w-full max-w-6xl z-10 flex flex-col lg:flex-row items-center justify-between gap-12 p-6 lg:p-12 h-full min-h-screen">
                
                {/* Left Side: Professional Branding */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex-1 w-full max-w-lg hidden lg:flex flex-col justify-center"
                >
                    <Link href="/" className="mb-8 inline-flex items-center gap-4">
                        <div className="p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                            <Image src="/logo-new.png" alt="Techwell Icon" width={60} height={60} priority className="object-contain" />
                        </div>
                        <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Techwell</span>
                    </Link>

                    <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 leading-tight">
                        Empowering Your <br/>
                        <span className="text-primary">Career Journey</span>
                    </h1>
                    
                    <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 leading-relaxed max-w-md">
                        The ultimate platform bridging the gap between top-tier education, campus drives, and global enterprise recruitment.
                    </p>

                    <div className="space-y-4">
                        {[
                            { icon: GraduationCap, title: "Elite IT Training", desc: "Master technologies with industry experts" },
                            { icon: Briefcase, title: "Placement Assistance", desc: "Land your dream job at top MNCs" },
                            { icon: Building2, title: "Campus Drives", desc: "Connecting institutes with global enterprises" }
                        ].map((feature, idx) => (
                            <div 
                                key={idx}
                                className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
                            >
                                <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                                    <feature.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white">{feature.title}</h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Right Side: Clean Corporate Form */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="w-full max-w-md lg:max-w-[440px]"
                >
                    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-8 sm:p-10 rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50 relative overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/5">
                        
                        {/* Mobile Logo */}
                        <div className="lg:hidden flex flex-col items-center justify-center mb-6 gap-3">
                            <Link href="/" className="flex flex-col items-center gap-3">
                                <div className="p-2.5 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                                    <Image src="/logo-new.png" alt="Techwell Icon" width={56} height={56} priority className="object-contain" />
                                </div>
                                <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Techwell</span>
                            </Link>
                        </div>

                        <AnimatePresence mode="wait">
                            {show2FA ? (
                                <motion.div key="2fa" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                                    <div className="text-center space-y-2 mb-6">
                                        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                                            <ShieldCheck className="w-8 h-8 text-primary" />
                                        </div>
                                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Trust Validation</h2>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm px-2">Approve this sign in using your authenticator app.</p>
                                    </div>

                                    {error && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-3 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg text-center dark:bg-red-900/20 dark:border-red-900 dark:text-red-400">
                                            {error}
                                        </motion.div>
                                    )}

                                    <form onSubmit={handle2FASubmit} className="space-y-5">
                                        <motion.div variants={itemVariants} className="space-y-2">
                                            <label htmlFor="twoFactorCode" className="text-sm font-medium text-slate-700 dark:text-slate-300">Security Code</label>
                                            <Input
                                                id="twoFactorCode"
                                                type="text"
                                                placeholder="000 000"
                                                maxLength={6}
                                                value={twoFactorCode}
                                                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                required
                                                disabled={isLoading}
                                                className="h-14 text-center text-2xl tracking-[0.25em] font-mono bg-slate-50 dark:bg-slate-950 font-bold"
                                            />
                                        </motion.div>
                                        
                                        <motion.div variants={itemVariants}>
                                            <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer" onClick={() => setTrustDevice(!trustDevice)}>
                                                <div className={`flex items-center justify-center h-5 w-5 rounded transition-all duration-200 ${trustDevice ? 'bg-primary border-primary' : 'bg-white border border-slate-300 dark:bg-slate-800 dark:border-slate-600'}`}>
                                                    <CheckCircle2 className={`w-3.5 h-3.5 text-white transition-opacity ${trustDevice ? 'opacity-100' : 'opacity-0'}`} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-slate-900 dark:text-white">Trust this device</span>
                                                    <span className="text-xs text-slate-500">Skip 2FA for 30 days</span>
                                                </div>
                                                <Lock className="w-4 h-4 ml-auto text-slate-400" />
                                            </div>
                                        </motion.div>

                                        <motion.div variants={itemVariants} className="pt-2">
                                            <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isLoading || twoFactorCode.length !== 6}>
                                                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Authenticate'}
                                            </Button>
                                        </motion.div>

                                        <motion.div variants={itemVariants} className="text-center pt-2">
                                            <button type="button" onClick={() => setShow2FA(false)} className="text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 font-medium transition-colors">
                                                Cancel & Return
                                            </button>
                                        </motion.div>
                                    </form>
                                </motion.div>
                            ) : (
                                <motion.div key="login" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                                    <div className="text-center lg:text-left space-y-2 mb-6">
                                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Sign In</h2>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm">Unified access portal for Students, Employers, and Staff.</p>
                                    </div>

                                    {showIdleBanner && (
                                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2 p-3 text-sm font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg dark:bg-emerald-900/20 dark:border-emerald-900/50 dark:text-emerald-400">
                                            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                                            <span className="flex-1">Session expired due to inactivity.</span>
                                            <button onClick={() => setShowIdleBanner(false)} className="text-emerald-500 hover:text-emerald-600">
                                                <X className="h-4 w-4" />
                                            </button>
                                        </motion.div>
                                    )}

                                    {error && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-3 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg text-center dark:bg-red-900/20 dark:border-red-900 dark:text-red-400">
                                            {error}
                                        </motion.div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <motion.div variants={itemVariants} className="space-y-1.5">
                                            <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">Work Email</label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="name@company.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                disabled={isLoading}
                                                className="h-12 bg-slate-50 dark:bg-slate-950"
                                            />
                                        </motion.div>

                                        <motion.div variants={itemVariants} className="space-y-1.5">
                                            <div className="flex justify-between items-center">
                                                <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                                                <Link 
                                                    href={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ''}`} 
                                                    className="text-sm text-primary hover:text-primary/80 font-medium"
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
                                                    className="h-12 pr-10 bg-slate-50 dark:bg-slate-950"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </motion.div>

                                        <motion.div variants={itemVariants}>
                                            <div className="flex items-center space-x-2 mt-2 cursor-pointer" onClick={() => setTrustDevice(!trustDevice)}>
                                                <div className={`flex items-center justify-center h-4 w-4 rounded border transition-all ${trustDevice ? 'bg-primary border-primary' : 'bg-white border-slate-300 dark:bg-slate-800 dark:border-slate-600'}`}>
                                                    <CheckCircle2 className={`w-3 h-3 text-white transition-opacity ${trustDevice ? 'opacity-100' : 'opacity-0'}`} />
                                                </div>
                                                <span className="text-sm text-slate-600 dark:text-slate-400">Trust this device</span>
                                            </div>
                                        </motion.div>

                                        <motion.div variants={itemVariants} className="pt-2">
                                            <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isLoading}>
                                                {isLoading ? (
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                ) : (
                                                    <>
                                                        Sign In
                                                        <ArrowRight className="ml-2 w-4 h-4" />
                                                    </>
                                                )}
                                            </Button>
                                        </motion.div>
                                    </form>

                                    <motion.div variants={itemVariants} className="pt-4 text-center text-sm text-slate-600 dark:text-slate-400">
                                        System Access Request?{' '}
                                        <Link href="/register" className="text-primary font-medium hover:underline">
                                            Apply Here
                                        </Link>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
            <LoginForm />
        </Suspense>
    )
}
