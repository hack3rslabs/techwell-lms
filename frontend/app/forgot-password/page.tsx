"use client"

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, ArrowRight, ShieldCheck, MailCheck, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import api from '@/lib/api'

export default function ForgotPasswordPage() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [email, setEmail] = React.useState(searchParams.get('email') || '')
    const [isLoading, setIsLoading] = React.useState(false)
    const [error, setError] = React.useState('')
    const [success, setSuccess] = React.useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            const res = await api.post('/auth/forgot-password', { email })
            if (res.data.success || res.status === 200) {
                setSuccess(true)
            } else {
                setError(res.data.message || 'Failed to send reset link')
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.response?.data?.error || 'An error occurred while sending the reset link')
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
            {/* Ultra Premium 3D Animated Background (Consistent with Login) */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
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
            </div>

            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

            <div className="w-full max-w-7xl z-10 flex flex-col lg:flex-row items-center justify-center gap-12 p-6 lg:p-12 h-full min-h-screen">
                
                {/* Right Side: Ultra Glassmorphic Form (Centered for Forgot Password) */}
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
                        <div className="flex justify-center mb-10">
                            <Link href="/">
                                <div className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.37)] border border-white/20">
                                    <Image src="/logo-dark.png" alt="Techwell" width={140} height={40} priority />
                                </div>
                            </Link>
                        </div>

                        <AnimatePresence mode="wait">
                            {success ? (
                                <motion.div key="success" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-7 relative z-10">
                                    <div className="text-center space-y-3 mb-8">
                                        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(52,211,153,0.2)] border border-emerald-400/30">
                                            <MailCheck className="w-10 h-10 text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                                        </div>
                                        <h2 className="text-3xl font-black tracking-tight text-white">Check Your Email</h2>
                                        <p className="text-indigo-200/70 text-sm font-medium px-4">
                                            We've sent password reset instructions to <br/><strong className="text-white">{email}</strong>
                                        </p>
                                    </div>
                                    <motion.div variants={itemVariants} className="pt-2 text-center">
                                        <Link href="/login" className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-wider">
                                            Back to Login
                                        </Link>
                                    </motion.div>
                                </motion.div>
                            ) : (
                                <motion.div key="forgot" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-7 relative z-10">
                                    <div className="text-center space-y-3 mb-8">
                                        <h2 className="text-3xl font-black tracking-tight text-white drop-shadow-md">Reset Password</h2>
                                        <p className="text-indigo-200/70 text-sm font-medium">Enter your email to receive reset instructions.</p>
                                    </div>

                                    {error && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 text-sm font-bold text-rose-200 bg-rose-500/20 backdrop-blur-xl rounded-2xl border border-rose-500/40 text-center shadow-[0_0_20px_rgba(244,63,94,0.2)] flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 shrink-0" />
                                            <span className="flex-1 text-left">{error}</span>
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

                                        <motion.div variants={itemVariants} className="pt-4">
                                            <Button type="submit" className="relative w-full h-14 text-lg font-black rounded-2xl bg-white hover:bg-slate-100 text-slate-900 shadow-[0_10px_30px_-10px_rgba(255,255,255,0.3)] transition-all group active:scale-[0.98] border-none overflow-hidden" disabled={isLoading}>
                                                <span className="relative z-10 flex items-center justify-center">
                                                    {isLoading ? (
                                                        <Loader2 className="mr-2 h-6 w-6 animate-spin text-indigo-600" />
                                                    ) : (
                                                        <>
                                                            Send Reset Link
                                                            <ArrowRight className="ml-2 w-5 h-5 opacity-80 group-hover:translate-x-1.5 transition-transform" />
                                                        </>
                                                    )}
                                                </span>
                                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-cyan-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            </Button>
                                        </motion.div>
                                    </form>

                                    <motion.div variants={itemVariants} className="pt-6 text-center text-[12px] font-semibold text-slate-400 uppercase tracking-wider">
                                        Remember your password?{' '}
                                        <Link href="/login" className="text-indigo-400 font-black hover:text-white transition-colors ml-1">
                                            Login Here
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
