"use client"

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, Loader2, Check, X, Mail, ArrowRight, ShieldCheck, Zap, Briefcase } from 'lucide-react'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'

export default function RegisterPage() {
    const router = useRouter()
    const { register, verifyOtp, resendOtp, isAuthenticated } = useAuth()

    const [step, setStep] = React.useState<'form' | 'otp'>('form')
    const [otpValue, setOtpValue] = React.useState('')
    const [timeLeft, setTimeLeft] = React.useState(0)

    const [name, setName] = React.useState('')
    const [email, setEmail] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [confirmPassword, setConfirmPassword] = React.useState('')
    const [dob, setDob] = React.useState('')
    const [qualification, setQualification] = React.useState('')
    const [college, setCollege] = React.useState('')
    const [referredByCode, setReferredByCode] = React.useState('')
    const [intent, setIntent] = React.useState('COURSE')
    const [showPassword, setShowPassword] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)
    const [error, setError] = React.useState('')

    React.useEffect(() => {
        if (isAuthenticated) {
            router.push('/dashboard')
        }
    }, [isAuthenticated, router])

    const passwordChecks = {
        length: password.length >= 8,
        match: password === confirmPassword && confirmPassword.length > 0,
        uppercase: /[A-Z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password),
    }

    React.useEffect(() => {
        if (timeLeft > 0 && step === 'otp') {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerId);
        }
    }, [timeLeft, step]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!passwordChecks.length || !passwordChecks.uppercase || !passwordChecks.number || !passwordChecks.special) {
            setError('Please meet all password requirements')
            return
        }

        if (!passwordChecks.match) {
            setError('Passwords do not match')
            return
        }

        setIsLoading(true)

        try {
            await register(email, password, name, undefined, dob, qualification, college, referredByCode, intent)
            setStep('otp')
            setTimeLeft(60) // 60 seconds before resend is allowed
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        
        if (otpValue.length !== 6) {
            setError('Please enter the 6-digit OTP')
            return
        }

        setIsLoading(true)
        try {
            await verifyOtp(email, otpValue)
            router.push('/dashboard')
        } catch (err: any) {
            setError(err.message || 'Invalid OTP.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleResendOtp = async () => {
        setError('')
        try {
            await resendOtp(email)
            setTimeLeft(60)
            setOtpValue('')
        } catch (err: any) {
            setError(err.message || 'Failed to resend OTP.')
        }
    }

    return (
        <div className="min-h-screen w-full flex bg-background">
            {/* Left Side: Branding & Value Proposition (Hidden on Mobile) */}
            <div className="hidden lg:flex flex-col justify-between w-[45%] bg-primary p-12 text-primary-foreground relative overflow-hidden">
                {/* Abstract Background Accents */}
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl opacity-50 mix-blend-overlay" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-black/10 rounded-full blur-3xl opacity-50 mix-blend-overlay" />
                
                <div className="relative z-10 flex items-center gap-3">
                    <Link href="/">
                        <div className="bg-white p-2 rounded-xl">
                            <Image src="/logo-dark.png" alt="Techwell" width={140} height={40} priority />
                        </div>
                    </Link>
                </div>

                <div className="relative z-10 space-y-10 max-w-lg mt-20">
                    <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">
                        {step === 'otp' ? 'Secure Your Identity' : 'Accelerate Your Career Today'}
                    </h1>
                    <p className="text-lg md:text-xl text-primary-foreground/80 leading-relaxed">
                        {step === 'otp' 
                            ? 'Enterprise-grade security ensuring your data remains protected.' 
                            : 'Join 10,000+ students and professionals in the most advanced tech ecosystem.'}
                    </p>

                    <div className="space-y-6 pt-8">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary-foreground/10 p-3 rounded-lg backdrop-blur-sm">
                                <Zap className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Adaptive Learning</h3>
                                <p className="text-primary-foreground/70 text-sm">Personalized paths for rapid growth</p>
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
                                <h3 className="font-semibold text-lg">Direct Placements</h3>
                                <p className="text-primary-foreground/70 text-sm">Exclusive hiring partners & mock interviews</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-sm text-primary-foreground/60 mt-20">
                    &copy; {new Date().getFullYear()} Techwell Inc. All rights reserved.
                </div>
            </div>

            {/* Right Side: Registration / OTP Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-24 bg-background overflow-y-auto">
                
                {/* Mobile Logo (Visible only on small screens) */}
                <div className="lg:hidden mb-12">
                    <Link href="/">
                        <Image src="/logo-light.png" alt="Techwell" width={160} height={48} className="dark:hidden" priority />
                        <Image src="/logo-dark.png" alt="Techwell" width={160} height={48} className="hidden dark:block" priority />
                    </Link>
                </div>

                <div className="w-full max-w-md space-y-8">
                    {step === 'otp' ? (
                        <>
                            <div className="space-y-2 text-center lg:text-left">
                                <div className="mx-auto lg:mx-0 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                                    <Mail className="w-8 h-8 text-primary" />
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight">Verify Email</h2>
                                <p className="text-muted-foreground text-sm lg:text-base">
                                    We've sent a 6-digit code to <span className="font-semibold text-foreground">{email}</span>
                                </p>
                            </div>

                            {error && (
                                <div className="p-4 text-sm font-medium text-destructive bg-destructive/10 rounded-xl border border-destructive/20">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleVerifyOtp} className="space-y-6">
                                <div className="flex justify-center lg:justify-start">
                                    <InputOTP maxLength={6} value={otpValue} onChange={setOtpValue} disabled={isLoading}>
                                        <InputOTPGroup className="gap-2">
                                            <InputOTPSlot index={0} className="w-12 h-14 text-lg border-2" />
                                            <InputOTPSlot index={1} className="w-12 h-14 text-lg border-2" />
                                            <InputOTPSlot index={2} className="w-12 h-14 text-lg border-2" />
                                            <InputOTPSlot index={3} className="w-12 h-14 text-lg border-2" />
                                            <InputOTPSlot index={4} className="w-12 h-14 text-lg border-2" />
                                            <InputOTPSlot index={5} className="w-12 h-14 text-lg border-2" />
                                        </InputOTPGroup>
                                    </InputOTP>
                                </div>

                                <Button type="submit" className="w-full h-12 text-base font-semibold rounded-xl mt-6 group" disabled={isLoading || otpValue.length !== 6}>
                                    {isLoading ? (
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    ) : (
                                        <>
                                            Verify Code
                                            <ArrowRight className="ml-2 w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </Button>
                            </form>

                            <div className="pt-6 border-t border-muted/60 text-center text-sm">
                                <div className="text-muted-foreground mb-4">Didn't receive the code?</div>
                                {timeLeft > 0 ? (
                                    <div className="font-medium text-foreground">
                                        Resend code in <span className="text-primary">{timeLeft}s</span>
                                    </div>
                                ) : (
                                    <Button variant="outline" className="w-full rounded-xl" onClick={handleResendOtp} disabled={isLoading}>
                                        Resend Code
                                    </Button>
                                )}
                                <div className="mt-6 text-sm">
                                    <button type="button" onClick={() => setStep('form')} className="text-primary hover:underline font-medium">
                                        &larr; Back to registration
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="space-y-2 text-center lg:text-left">
                                <h2 className="text-3xl font-bold tracking-tight">Create Account</h2>
                                <p className="text-muted-foreground text-sm lg:text-base">
                                    Start your journey with Techwell today.
                                </p>
                            </div>

                            {error && (
                                <div className="p-4 text-sm font-medium text-destructive bg-destructive/10 rounded-xl border border-destructive/20">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                                        <Input
                                            id="name"
                                            type="text"
                                            placeholder="John Doe"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                            disabled={isLoading}
                                            className="h-12 rounded-xl focus-visible:ring-primary/30"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={isLoading}
                                            className="h-12 rounded-xl focus-visible:ring-primary/30"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="dob" className="text-sm font-medium">Date of Birth</label>
                                        <Input
                                            id="dob"
                                            type="date"
                                            value={dob}
                                            onChange={(e) => setDob(e.target.value)}
                                            required
                                            disabled={isLoading}
                                            className="h-12 rounded-xl focus-visible:ring-primary/30"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="qualification" className="text-sm font-medium">Qualification</label>
                                        <Input
                                            id="qualification"
                                            type="text"
                                            placeholder="e.g. B.Tech"
                                            value={qualification}
                                            onChange={(e) => setQualification(e.target.value)}
                                            required
                                            disabled={isLoading}
                                            className="h-12 rounded-xl focus-visible:ring-primary/30"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="college" className="text-sm font-medium">College / University</label>
                                        <Input
                                            id="college"
                                            type="text"
                                            placeholder="Enter your college name"
                                            value={college}
                                            onChange={(e) => setCollege(e.target.value)}
                                            required
                                            disabled={isLoading}
                                            className="h-12 rounded-xl focus-visible:ring-primary/30"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="intent" className="text-sm font-medium">What brings you here?</label>
                                        <select
                                            id="intent"
                                            value={intent}
                                            onChange={(e) => setIntent(e.target.value)}
                                            disabled={isLoading}
                                            className="flex h-12 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <option value="COURSE">Learn Courses</option>
                                            <option value="RESUME">Build my Resume</option>
                                            <option value="INTERVIEW">Practice Mock Interviews</option>
                                            <option value="ALL">All of the above</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="referredByCode" className="text-sm font-medium">
                                        Referral Code <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
                                    </label>
                                    <Input
                                        id="referredByCode"
                                        type="text"
                                        placeholder="Enter code if you have one"
                                        value={referredByCode}
                                        onChange={(e) => setReferredByCode(e.target.value)}
                                        disabled={isLoading}
                                        className="h-12 rounded-xl focus-visible:ring-primary/30"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="password" className="text-sm font-medium">Password</label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                disabled={isLoading}
                                                className="h-12 rounded-xl pr-10 focus-visible:ring-primary/30"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-1.5 mt-2">
                                            <Requirement check={passwordChecks.length} text="8+ Chars" />
                                            <Requirement check={passwordChecks.uppercase} text="Uppercase" />
                                            <Requirement check={passwordChecks.number} text="Number" />
                                            <Requirement check={passwordChecks.special} text="Special" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
                                        <Input
                                            id="confirmPassword"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            disabled={isLoading}
                                            className="h-12 rounded-xl focus-visible:ring-primary/30"
                                        />
                                        {confirmPassword && (
                                            <div className="flex items-center gap-1.5 text-xs mt-2">
                                                {passwordChecks.match ? (
                                                    <Check className="h-3.5 w-3.5 text-green-500" />
                                                ) : (
                                                    <X className="h-3.5 w-3.5 text-red-500" />
                                                )}
                                                <span className={passwordChecks.match ? 'text-green-500 font-medium' : 'text-red-500 font-medium'}>
                                                    {passwordChecks.match ? 'Passwords match' : 'Passwords do not match'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Button type="submit" className="w-full h-12 text-base font-semibold rounded-xl mt-6 group" disabled={isLoading}>
                                    {isLoading ? (
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    ) : (
                                        <>
                                            Create Account
                                            <ArrowRight className="ml-2 w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </Button>
                            </form>

                            <div className="pt-8 text-center lg:text-left text-sm text-muted-foreground">
                                Already have an account?{' '}
                                <Link href="/login" className="text-primary font-semibold hover:underline">
                                    Sign in instead
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

function Requirement({ check, text }: { check: boolean; text: string }) {
    return (
        <div className="flex items-center gap-1.5 py-1 px-2 rounded-lg bg-muted/30 border border-muted/50 transition-colors">
            {check ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
                <div className="h-1 w-1 rounded-full bg-muted-foreground/40 ml-1.5 mr-1" />
            )}
            <span className={`text-[10px] sm:text-xs font-medium leading-none ${check ? 'text-green-600' : 'text-muted-foreground'}`}>
                {text}
            </span>
        </div>
    )
}
