"use client"

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Eye, EyeOff, Loader2, Check, X, Mail } from 'lucide-react'
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
            await register(email, password, name, dob, qualification, college)
            setStep('otp')
            setTimeLeft(60) // 60 seconds before resend is allowed
        } catch (err: unknown) {
            const errorMessage = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Registration failed. Please try again.'
            setError(errorMessage)
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
        } catch (err: unknown) {
            const errorMessage = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Custom invalid OTP.'
            setError(errorMessage)
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
        } catch (err: unknown) {
            const errorMessage = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to resend OTP.'
            setError(errorMessage)
        }
    }

    if (step === 'otp') {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-background via-background to-primary/5">
                <div className="w-full max-w-md space-y-6">
                    <div className="flex justify-center">
                        <Link href="/">
                            <Image src="/logo-light.png" alt="TechWell" width={160} height={48} className="dark:hidden" priority />
                            <Image src="/logo-dark.png" alt="TechWell" width={160} height={48} className="hidden dark:block" priority />
                        </Link>
                    </div>
                    <Card className="border-muted shadow-xl backdrop-blur-sm bg-background/80">
                        <CardHeader className="text-center pt-8">
                            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                <Mail className="w-8 h-8 text-primary" />
                            </div>
                            <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
                            <CardDescription className="text-base mt-2">
                                We&apos;ve sent a 6-digit code to <br />
                                <span className="font-semibold text-foreground">{email}</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-8 pb-8">
                            <form onSubmit={handleVerifyOtp} className="space-y-6">
                                {error && (
                                    <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/20 rounded-lg animate-in fade-in zoom-in duration-300">
                                        {error}
                                    </div>
                                )}
                                
                                <div className="flex justify-center flex-col items-center gap-4">
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

                                <Button type="submit" className="w-full h-12 text-base font-semibold shadow-lg transition-all" disabled={isLoading || otpValue.length !== 6}>
                                    {isLoading ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</>
                                    ) : 'Verify Code'}
                                </Button>
                            </form>
                        </CardContent>
                        <CardFooter className="flex flex-col border-t border-border px-8 py-6">
                            <div className="text-sm text-muted-foreground mb-4">
                                Didn&apos;t receive the code?
                            </div>
                            {timeLeft > 0 ? (
                                <div className="text-sm font-medium text-foreground">
                                    Resend code in <span className="text-primary">{timeLeft}s</span>
                                </div>
                            ) : (
                                <Button variant="outline" className="w-full" onClick={handleResendOtp} disabled={isLoading}>
                                    Resend Code
                                </Button>
                            )}
                            <div className="mt-6 text-sm">
                                <button type="button" onClick={() => setStep('form')} className="text-primary hover:underline font-medium flex items-center gap-1">
                                    &larr; Back to registration
                                </button>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-background via-background to-primary/5">
            <div className="w-full max-w-xl space-y-6">
                <div className="flex justify-center">
                    <Link href="/">
                        <Image src="/logo-light.png" alt="TechWell" width={160} height={48} className="dark:hidden" priority />
                        <Image src="/logo-dark.png" alt="TechWell" width={160} height={48} className="hidden dark:block" priority />
                    </Link>
                </div>
                <Card className="border-muted shadow-xl backdrop-blur-sm bg-background/80">
                    <CardHeader className="text-center pt-8">
                        <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
                        <CardDescription>Join TechWell and start your journey</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 px-10">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/20 rounded-lg animate-in fade-in zoom-in duration-300">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-medium">
                                        Full Name
                                    </label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium">
                                        Email
                                    </label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="dob" className="text-sm font-medium">
                                        Date of Birth
                                    </label>
                                    <Input
                                        id="dob"
                                        type="date"
                                        value={dob}
                                        onChange={(e) => setDob(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="qualification" className="text-sm font-medium">
                                        Highest Qualification
                                    </label>
                                    <Input
                                        id="qualification"
                                        type="text"
                                        placeholder="e.g. B.Tech, MCA"
                                        value={qualification}
                                        onChange={(e) => setQualification(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="college" className="text-sm font-medium">
                                    College / University Name
                                </label>
                                <Input
                                    id="college"
                                    type="text"
                                    placeholder="Enter your college name"
                                    value={college}
                                    onChange={(e) => setCollege(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label htmlFor="password" className="text-sm font-medium">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={isLoading}
                                            className="pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>

                                    {/* Password Suggestions/Requirements Grid */}
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        <Requirement check={passwordChecks.length} text="8+ Characters" />
                                        <Requirement check={passwordChecks.uppercase} text="Uppercase" />
                                        <Requirement check={passwordChecks.number} text="Number" />
                                        <Requirement check={passwordChecks.special} text="Special Char" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label htmlFor="confirmPassword" className="text-sm font-medium">
                                        Confirm Password
                                    </label>
                                    <Input
                                        id="confirmPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                    {confirmPassword && (
                                        <div className="flex items-center gap-2 text-[10px] mt-1">
                                            {passwordChecks.match ? (
                                                <Check className="h-3 w-3 text-green-500" />
                                            ) : (
                                                <X className="h-3 w-3 text-red-500" />
                                            )}
                                            <span className={passwordChecks.match ? 'text-green-500' : 'text-red-500 font-medium'}>
                                                {passwordChecks.match ? 'Passwords match' : 'Passwords do not match'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Button type="submit" className="w-full py-6 text-lg font-semibold shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98]" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Creating Account...
                                    </>
                                ) : (
                                    'Create Account'
                                )}
                            </Button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-muted/60 text-center text-sm">
                            <span className="text-muted-foreground">Already have an account? </span>
                            <Link href="/login" className="text-primary hover:underline font-bold">
                                Sign in instead
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function Requirement({ check, text }: { check: boolean; text: string }) {
    return (
        <div className="flex items-center gap-1.5 py-1 px-2 rounded-md bg-muted/30 border border-muted/50 transition-colors">
            {check ? (
                <Check className="h-3 w-3 text-green-500" />
            ) : (
                <div className="h-1 w-1 rounded-full bg-muted-foreground/40 ml-1 mr-1" />
            )}
            <span className={`text-[10px] font-medium leading-none ${check ? 'text-green-600' : 'text-muted-foreground'}`}>
                {text}
            </span>
        </div>
    )
}

