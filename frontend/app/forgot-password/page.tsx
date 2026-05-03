"use client"

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ArrowLeft, Mail, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function ForgotPasswordPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [email, setEmail] = React.useState(searchParams.get('email') || '')
    const [otp, setOtp] = React.useState('')
    const [newPassword, setNewPassword] = React.useState('')
    const [confirmPassword, setConfirmPassword] = React.useState('')
    const [step, setStep] = React.useState<"email" | "otp" | "reset" | "success">("email")
    const [isLoading, setIsLoading] = React.useState(false)
    const [error, setError] = React.useState('')
    const [message, setMessage] = React.useState('')

    // If email is already provided, we can potentially skip the email entry step 
    // but we still want to show it as "display only" per user request.
    React.useEffect(() => {
        const emailFromQuery = searchParams.get('email')
        if (emailFromQuery) {
            setEmail(emailFromQuery)
        }
    }, [searchParams])

    const handleSendOtp = async () => {
        if (!email) {
            setError('Please enter your email address')
            return
        }
        setError('')
        setIsLoading(true)
        try {
            await axios.post(`${API_URL}/auth/forgot-password`, { email })
            setStep("otp")
            setMessage('OTP has been sent to your email')
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to send OTP. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleVerifyOtp = async () => {
        if (!otp) {
            setError('Please enter the OTP')
            return
        }
        setError('')
        setIsLoading(true)
        try {
            await axios.post(`${API_URL}/auth/verify-reset-otp`, { email, otp })
            setStep("reset")
            setMessage('OTP verified successfully')
        } catch (err: any) {
            setError(err.response?.data?.error || 'Invalid OTP. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match')
            return
        }
        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters')
            return
        }
        setError('')
        setIsLoading(true)
        try {
            await axios.post(`${API_URL}/auth/reset-password`, { email, otp, newPassword })
            setStep("success")
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to reset password. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8 bg-gradient-to-br from-background via-background to-primary/5">
            <div className="w-full max-w-md space-y-6">
                <div className="flex flex-col items-center mb-8">
                    <Link href="/">
                        <Image src="/logo-light.png" alt="TechWell" width={160} height={48} className="dark:hidden" priority />
                        <Image src="/logo-dark.png" alt="TechWell" width={160} height={48} className="hidden dark:block" priority />
                    </Link>
                </div>

                <Card className="border-muted shadow-2xl backdrop-blur-sm bg-background/90 rounded-2xl overflow-hidden">
                    <div className="h-2 bg-primary w-full" />
                    <CardHeader className="text-center pt-8 pb-4">
                        <CardTitle className="text-2xl font-bold tracking-tight">
                            {step === "email" && "Reset Password"}
                            {step === "otp" && "Verify OTP"}
                            {step === "reset" && "Create New Password"}
                            {step === "success" && "Success!"}
                        </CardTitle>
                        <CardDescription className="text-sm">
                            {step === "email" && "We'll send a code to your email address"}
                            {step === "otp" && `Enter the 6-digit code sent to ${email}`}
                            {step === "reset" && "Choose a strong password for your account"}
                            {step === "success" && "Your password has been updated successfully"}
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="px-8 pb-10">
                        {error && (
                            <div className="mb-6 p-4 text-sm font-medium text-red-500 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/30 animate-in fade-in zoom-in duration-300">
                                {error}
                            </div>
                        )}
                        
                        {message && step !== "success" && (
                            <div className="mb-6 p-4 text-sm font-medium text-primary bg-primary/5 rounded-xl border border-primary/10 animate-in fade-in zoom-in duration-300">
                                {message}
                            </div>
                        )}

                        {step === "email" && (
                            <div className="space-y-6">
                                <div className="space-y-2.5">
                                    <label htmlFor="email" className="text-sm font-semibold ml-1">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="name@company.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={isLoading || !!searchParams.get('email')}
                                            className="h-12 rounded-xl pl-12 focus:ring-primary/20 bg-muted/30"
                                        />
                                    </div>
                                </div>
                                <Button 
                                    onClick={handleSendOtp} 
                                    className="w-full h-12 text-base font-bold rounded-xl transition-all" 
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Send OTP"}
                                </Button>
                            </div>
                        )}

                        {step === "otp" && (
                            <div className="space-y-6">
                                <div className="space-y-2.5">
                                    <label htmlFor="otp" className="text-sm font-semibold ml-1 text-center block">
                                        Verification Code
                                    </label>
                                    <div className="relative">
                                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            id="otp"
                                            type="text"
                                            placeholder="123456"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            maxLength={6}
                                            required
                                            disabled={isLoading}
                                            className="h-14 rounded-xl pl-12 text-center text-2xl tracking-[0.5em] font-mono focus:ring-primary/20"
                                        />
                                    </div>
                                </div>
                                <Button 
                                    onClick={handleVerifyOtp} 
                                    className="w-full h-12 text-base font-bold rounded-xl transition-all" 
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Verify OTP"}
                                </Button>
                                <button 
                                    onClick={handleSendOtp}
                                    className="w-full text-sm text-primary hover:underline font-medium"
                                    disabled={isLoading}
                                >
                                    Resend Code
                                </button>
                            </div>
                        )}

                        {step === "reset" && (
                            <div className="space-y-5">
                                <div className="space-y-2.5">
                                    <label htmlFor="newPassword" className="text-sm font-semibold ml-1">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            id="newPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            disabled={isLoading}
                                            className="h-12 rounded-xl pl-12 focus:ring-primary/20"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2.5">
                                    <label htmlFor="confirmPassword" className="text-sm font-semibold ml-1">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            disabled={isLoading}
                                            className="h-12 rounded-xl pl-12 focus:ring-primary/20"
                                        />
                                    </div>
                                </div>
                                <Button 
                                    onClick={handleResetPassword} 
                                    className="w-full h-12 text-base font-bold rounded-xl transition-all" 
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Reset Password"}
                                </Button>
                            </div>
                        )}

                        {step === "success" && (
                            <div className="text-center space-y-6 py-4">
                                <div className="flex justify-center">
                                    <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="h-12 w-12 text-primary animate-in zoom-in duration-500" />
                                    </div>
                                </div>
                                <p className="text-muted-foreground">
                                    You can now log in to your account with your new password.
                                </p>
                                <Button 
                                    asChild 
                                    className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20"
                                >
                                    <Link href="/login">Go to Login</Link>
                                </Button>
                            </div>
                        )}

                        {step !== "success" && (
                            <div className="mt-8 pt-6 border-t border-muted/60 text-center">
                                <Link href="/login" className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-2 group transition-colors">
                                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                                    Back to login
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
