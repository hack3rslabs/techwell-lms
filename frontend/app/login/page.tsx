"use client"

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, Loader2, AlertTriangle, X, ArrowRight, ShieldCheck, Zap, Sparkles, Lock, CheckCircle2, GraduationCap, Briefcase, Building2, Home } from 'lucide-react'
import { motion, AnimatePresence, Variants } from 'framer-motion'

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

    // Animation variants
    const containerVariants: Variants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 } },
        exit: { opacity: 0, scale: 0.9, filter: 'blur(10px)', transition: { duration: 0.4 } }
    }
    
    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, type: 'spring', stiffness: 100 } }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-950 text-white font-sans">
            {/* Ultra Premium 3D Animated Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {/* 3D Floating Orbs */}
                <motion.div 
                    animate={{ 
                        rotate: [0, 90, 180, 270, 360],
                        scale: [1, 1.2, 1, 1.1, 1],
                        x: [0, 50, -50, 20, 0],
                        y: [0, -50, 50, -20, 0]
                    }} 
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[10%] -right-[5%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-indigo-500/40 via-purple-500/20 to-transparent blur-[120px] opacity-80 mix-blend-screen"
                />
                <motion.div 
                    animate={{ 
                        rotate: [360, 270, 180, 90, 0],
                        scale: [1, 1.3, 0.9, 1.2, 1],
                        x: [0, -60, 40, -30, 0],
                        y: [0, 60, -40, 30, 0]
                    }} 
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-[10%] -left-[5%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tr from-cyan-500/30 via-emerald-500/20 to-transparent blur-[120px] opacity-80 mix-blend-screen"
                />
                <motion.div 
                    animate={{ 
                        y: [0, -30, 0],
                        opacity: [0.3, 0.6, 0.3]
                    }} 
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[30%] left-[40%] w-[30vw] h-[30vw] rounded-full bg-gradient-to-r from-pink-500/20 to-rose-500/20 blur-[100px] mix-blend-screen"
                />
            </div>

            {/* Grid overlay for tech feel */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

            {/* Mobile Home Button */}
            <div className="lg:hidden absolute top-4 left-4 z-50">
                <Link href="/home">
                    <Button variant="outline" size="sm" className="rounded-full bg-white/10 backdrop-blur-xl border-white/20 hover:bg-white/20 text-white">
                        <Home className="w-4 h-4 mr-2" />
                        Home
                    </Button>
                </Link>
            </div>

            <div className="w-full max-w-7xl z-10 flex flex-col lg:flex-row items-center justify-between gap-12 p-6 lg:p-12 h-full min-h-screen">
                
                {/* Left Side: 3D Trust & Branding Elements */}
                <motion.div 
                    initial={{ opacity: 0, x: -60, rotateY: -15 }}
                    animate={{ opacity: 1, x: 0, rotateY: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    style={{ perspective: 1000 }}
                    className="hidden lg:flex flex-col flex-1"
                >
                    <Link href="/">
                        <div className="p-3 mb-10 bg-white/10 backdrop-blur-xl rounded-2xl inline-flex shadow-[0_8px_32px_rgba(0,0,0,0.37)] border border-white/20 hover:bg-white/15 transition-all cursor-pointer items-center gap-3">
                            <Image src="/logo-dark.png" alt="Techwell" width={160} height={45} priority className="object-contain drop-shadow-xl" />
                        </div>
                    </Link>

                    <h1 className="text-6xl xl:text-7xl font-black leading-[1.1] tracking-tight mb-8">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-white drop-shadow-sm">Welcome to</span>
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 via-purple-400 to-cyan-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">Techwell Hub</span>
                    </h1>
                    
                    <p className="text-xl text-indigo-100/80 leading-relaxed mb-12 max-w-xl font-medium">
                        Empower your career with world-class IT training, guaranteed placements, and seamless campus hiring solutions.
                    </p>

                    <div className="space-y-5 relative">
                        {/* Decorative line */}
                        <div className="absolute left-[27px] top-8 bottom-8 w-px bg-gradient-to-b from-indigo-500/50 via-purple-500/50 to-transparent"></div>

                        {[
                            { icon: GraduationCap, title: "Elite IT Training", desc: "Master technologies with industry experts", color: "text-emerald-400", bg: "bg-emerald-400/10" },
                            { icon: Briefcase, title: "100% Placement", desc: "Land your dream job at top MNCs", color: "text-amber-400", bg: "bg-amber-400/10" },
                            { icon: Building2, title: "Campus Drives", desc: "Connecting institutes with global enterprises", color: "text-pink-400", bg: "bg-pink-400/10" }
                        ].map((feature, idx) => (
                            <motion.div 
                                key={idx}
                                whileHover={{ scale: 1.02, x: 10, backgroundColor: "rgba(255,255,255,0.08)" }}
                                className="flex items-center gap-5 p-4 rounded-2xl backdrop-blur-md border border-white/5 shadow-lg relative overflow-hidden group transition-all"
                            >
                                <div className={`p-4 rounded-xl relative z-10 backdrop-blur-xl border border-white/10 ${feature.bg}`}>
                                    <feature.icon className={`w-6 h-6 ${feature.color} drop-shadow-[0_0_8px_currentColor]`} />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="font-bold text-lg text-white group-hover:text-indigo-200 transition-colors">{feature.title}</h3>
                                    <p className="text-indigo-200/60 text-sm font-medium">{feature.desc}</p>
                                </div>
                                {/* Hover glow effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Right Side: Ultra Glassmorphic Form */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
                    style={{ perspective: 1000 }}
                    className="w-full max-w-md lg:max-w-[460px]"
                >
                    {/* The 3D Glass Card */}
                    <div className="bg-[#0f172a]/60 backdrop-blur-[40px] p-8 sm:p-12 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.2)] border border-slate-700/50 relative overflow-hidden group">
                        
                        {/* Dynamic border gradient */}
                        <div className="absolute -inset-[1px] bg-gradient-to-br from-indigo-500/30 via-purple-500/0 to-cyan-500/30 rounded-[2.5rem] -z-10 opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>

                        {/* Mobile Logo */}
                        <div className="lg:hidden flex justify-center mb-10">
                            <Link href="/">
                                <div className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.37)] border border-white/20">
                                    <Image src="/logo-dark.png" alt="Techwell" width={140} height={40} priority />
                                </div>
                            </Link>
                        </div>

                        <AnimatePresence mode="wait">
                            {show2FA ? (
                                <motion.div key="2fa" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-7 relative z-10">
                                    <div className="text-center space-y-3 mb-8">
                                        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(52,211,153,0.2)] border border-emerald-400/30">
                                            <ShieldCheck className="w-10 h-10 text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                                        </div>
                                        <h2 className="text-3xl font-black tracking-tight text-white">Trust Validation</h2>
                                        <p className="text-indigo-200/70 text-sm font-medium px-4">Approve this sign in using your authenticator app.</p>
                                    </div>

                                    {error && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 text-sm font-bold text-rose-200 bg-rose-500/20 backdrop-blur-xl rounded-2xl border border-rose-500/40 text-center shadow-[0_0_20px_rgba(244,63,94,0.2)]">
                                            {error}
                                        </motion.div>
                                    )}

                                    <form onSubmit={handle2FASubmit} className="space-y-6">
                                        <motion.div variants={itemVariants} className="space-y-3">
                                            <label htmlFor="twoFactorCode" className="text-sm font-bold text-indigo-100/90 pl-1 uppercase tracking-wider text-[11px]">Security Code</label>
                                            <div className="relative group/input">
                                                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-2xl blur opacity-30 group-focus-within/input:opacity-60 transition duration-500"></div>
                                                <Input
                                                    id="twoFactorCode"
                                                    type="text"
                                                    placeholder="000 000"
                                                    maxLength={6}
                                                    value={twoFactorCode}
                                                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                    required
                                                    disabled={isLoading}
                                                    className="relative h-16 rounded-2xl text-center text-3xl tracking-[0.5em] font-mono bg-slate-900/80 border-slate-700 text-emerald-400 focus-visible:ring-emerald-400/50 shadow-inner placeholder:text-slate-600 font-bold"
                                                />
                                            </div>
                                        </motion.div>
                                        
                                        <motion.div variants={itemVariants} className="relative group/trust">
                                            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-20 group-hover/trust:opacity-40 transition duration-500"></div>
                                            <div className="relative flex items-center space-x-4 p-4 bg-slate-900/80 rounded-2xl border border-slate-700/50 cursor-pointer" onClick={() => setTrustDevice(!trustDevice)}>
                                                <div className={`flex items-center justify-center h-6 w-6 rounded-lg border-2 transition-all duration-300 ${trustDevice ? 'bg-indigo-500 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-slate-800 border-slate-600'}`}>
                                                    <CheckCircle2 className={`w-4 h-4 text-white transition-opacity duration-300 ${trustDevice ? 'opacity-100' : 'opacity-0'}`} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-white">Trust this device</span>
                                                    <span className="text-[10px] text-indigo-200/60 uppercase tracking-wider font-semibold">Skip 2FA for 30 days</span>
                                                </div>
                                                <Lock className="w-5 h-5 ml-auto text-indigo-400/50" />
                                            </div>
                                        </motion.div>

                                        <motion.div variants={itemVariants} className="pt-2">
                                            <Button type="submit" className="relative w-full h-14 text-lg font-black rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white shadow-[0_10px_20px_-10px_rgba(52,211,153,0.5)] transition-all active:scale-[0.98] border-none" disabled={isLoading || twoFactorCode.length !== 6}>
                                                {isLoading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : 'Authenticate System'}
                                            </Button>
                                        </motion.div>

                                        <motion.div variants={itemVariants} className="text-center pt-4">
                                            <button type="button" onClick={() => setShow2FA(false)} className="text-sm text-indigo-300/60 hover:text-white transition-colors font-semibold uppercase tracking-wider text-[11px]">
                                                Cancel & Return
                                            </button>
                                        </motion.div>
                                    </form>
                                </motion.div>
                            ) : (
                                <motion.div key="login" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-7 relative z-10">
                                    <div className="text-center lg:text-left space-y-3 mb-8">
                                        <h2 className="text-4xl font-black tracking-tight text-white drop-shadow-md">Sign In</h2>
                                        <p className="text-indigo-200/70 text-sm font-medium">Unified access portal for Students, Employers, Colleges, and Staff.</p>
                                    </div>

                                    {showIdleBanner && (
                                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3 p-4 text-sm font-bold text-amber-100 bg-amber-500/20 backdrop-blur-xl rounded-2xl border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                                            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-400" />
                                            <span className="flex-1">Session expired due to inactivity.</span>
                                            <button onClick={() => setShowIdleBanner(false)} className="text-amber-400 hover:text-amber-300 transition-colors">
                                                <X className="h-4 w-4" />
                                            </button>
                                        </motion.div>
                                    )}

                                    {error && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 text-sm font-bold text-rose-200 bg-rose-500/20 backdrop-blur-xl rounded-2xl border border-rose-500/40 text-center shadow-[0_0_20px_rgba(244,63,94,0.2)]">
                                            {error}
                                        </motion.div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <motion.div variants={itemVariants} className="space-y-2 relative group/input">
                                            <label htmlFor="email" className="text-sm font-bold text-indigo-100/90 pl-1 uppercase tracking-wider text-[11px]">Work Email</label>
                                            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-20 group-focus-within/input:opacity-50 transition duration-500"></div>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="name@company.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                disabled={isLoading}
                                                className="relative h-14 rounded-2xl bg-slate-900/80 border-slate-700/50 text-white focus-visible:ring-indigo-500/50 shadow-inner px-4 text-base placeholder:text-slate-500 transition-all font-medium"
                                            />
                                        </motion.div>

                                        <motion.div variants={itemVariants} className="space-y-2 relative group/input">
                                            <div className="flex justify-between items-center pl-1 pr-1">
                                                <label htmlFor="password" className="text-sm font-bold text-indigo-100/90 uppercase tracking-wider text-[11px]">Password</label>
                                                <Link 
                                                    href={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ''}`} 
                                                    className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-all font-semibold tracking-wide hover:underline underline-offset-4 decoration-cyan-400/30"
                                                >
                                                    Forgot password?
                                                </Link>
                                            </div>
                                            <div className="relative">
                                                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-20 group-focus-within/input:opacity-50 transition duration-500"></div>
                                                <Input
                                                    id="password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="••••••••"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                    disabled={isLoading}
                                                    className="relative h-14 rounded-2xl bg-slate-900/80 border-slate-700/50 text-white focus-visible:ring-indigo-500/50 shadow-inner px-4 pr-12 text-base placeholder:text-slate-500 transition-all font-medium"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 top-[26px] -translate-y-1/2 text-slate-400 hover:text-indigo-300 transition-colors p-1"
                                                >
                                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                </button>
                                            </div>
                                        </motion.div>

                                        {/* Trust this device checkbox on initial login form as well */}
                                        <motion.div variants={itemVariants} className="relative group/trust mt-2">
                                            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-10 group-hover/trust:opacity-20 transition duration-500"></div>
                                            <div className="relative flex items-center space-x-3 p-3 bg-slate-900/40 rounded-2xl border border-slate-800 cursor-pointer" onClick={() => setTrustDevice(!trustDevice)}>
                                                <div className={`flex items-center justify-center h-5 w-5 rounded border-2 transition-all duration-300 ${trustDevice ? 'bg-indigo-500 border-indigo-500' : 'bg-slate-800 border-slate-600'}`}>
                                                    <CheckCircle2 className={`w-3 h-3 text-white transition-opacity duration-300 ${trustDevice ? 'opacity-100' : 'opacity-0'}`} />
                                                </div>
                                                <span className="text-sm font-semibold text-indigo-200/80">Trust this device</span>
                                            </div>
                                        </motion.div>

                                        <motion.div variants={itemVariants} className="pt-2">
                                            <Button type="submit" className="relative w-full h-14 text-lg font-black rounded-2xl bg-white hover:bg-slate-100 text-slate-900 shadow-[0_10px_30px_-10px_rgba(255,255,255,0.3)] transition-all group active:scale-[0.98] border-none overflow-hidden" disabled={isLoading}>
                                                <span className="relative z-10 flex items-center justify-center">
                                                    {isLoading ? (
                                                        <Loader2 className="mr-2 h-6 w-6 animate-spin text-indigo-600" />
                                                    ) : (
                                                        <>
                                                            Login
                                                            <ArrowRight className="ml-2 w-5 h-5 opacity-80 group-hover:translate-x-1.5 transition-transform" />
                                                        </>
                                                    )}
                                                </span>
                                                {/* Button hover gradient effect */}
                                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-cyan-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            </Button>
                                        </motion.div>
                                    </form>

                                    <motion.div variants={itemVariants} className="pt-6 text-center text-[12px] font-semibold text-slate-400 uppercase tracking-wider">
                                        System Access Request?{' '}
                                        <Link href="/register" className="text-indigo-400 font-black hover:text-white transition-colors ml-1">
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
