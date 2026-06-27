"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { ShieldAlert, Loader2, KeyRound, Smartphone, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

export default function Setup2FAPage() {
    const [qrCodeUrl, setQrCodeUrl] = useState('')
    const [secret, setSecret] = useState('')
    const [code, setCode] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isVerifying, setIsVerifying] = useState(false)
    const router = useRouter()
    const { user, refreshUser } = useAuth()

    useEffect(() => {
        if (!user) {
            router.push('/login')
            return
        }

        const fetchSetup = async () => {
            try {
                const res = await authApi.setup2FA()
                setQrCodeUrl(res.data.qrCodeUrl)
                setSecret(res.data.secret)
            } catch (err: any) {
                toast.error(err.response?.data?.error || 'Failed to initialize 2FA setup')
            } finally {
                setIsLoading(false)
            }
        }

        fetchSetup()
    }, [user, router])

    const handleEnable = async () => {
        if (!code || code.length < 6) {
            toast.error('Please enter a valid 6-digit code')
            return
        }
        setIsVerifying(true)
        try {
            await authApi.enable2FA({ code })
            toast.success('Two-factor authentication enabled successfully!')
            await refreshUser()
            router.push('/onboarding')
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Invalid verification code')
        } finally {
            setIsVerifying(false)
        }
    }

    const handleSkip = () => {
        router.push('/onboarding')
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
            <Card className="w-full max-w-md border-muted shadow-xl backdrop-blur-sm bg-background/80">
                <CardHeader className="text-center pt-8 border-b pb-6">
                    <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <ShieldAlert className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
                        Secure Your Account
                    </CardTitle>
                    <CardDescription className="text-sm mt-2">
                        Set up Two-Factor Authentication (2FA) to add an extra layer of security to your Techwell account.
                    </CardDescription>
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                            <p className="text-sm text-muted-foreground">Generating secure keys...</p>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-start gap-4 text-sm">
                                <div className="bg-muted p-2 rounded-lg shrink-0">
                                    <Smartphone className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="font-semibold mb-1">Step 1: Get an Authenticator App</p>
                                    <p className="text-muted-foreground">Download Google Authenticator or Authy from your app store.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 text-sm">
                                <div className="bg-muted p-2 rounded-lg shrink-0">
                                    <KeyRound className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="font-semibold mb-2">Step 2: Scan the QR Code</p>
                                    <div className="bg-white p-4 rounded-xl border inline-block">
                                        {qrCodeUrl && (
                                            <Image 
                                                src={qrCodeUrl} 
                                                alt="2FA QR Code" 
                                                width={160} 
                                                height={160}
                                                className="w-40 h-40"
                                            />
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-3 font-mono bg-muted p-2 rounded break-all">
                                        Secret: {secret}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 text-sm">
                                <div className="bg-muted p-2 rounded-lg shrink-0">
                                    <ShieldAlert className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div className="w-full">
                                    <p className="font-semibold mb-2">Step 3: Enter the Code</p>
                                    <Input
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        placeholder="000000"
                                        maxLength={6}
                                        className="text-center tracking-[0.5em] text-lg font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex flex-col gap-3 border-t pt-6 pb-8 bg-muted/20">
                    <Button 
                        onClick={handleEnable} 
                        disabled={isLoading || isVerifying || code.length !== 6} 
                        className="w-full"
                    >
                        {isVerifying ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</> : 'Enable 2FA'}
                    </Button>
                    <Button 
                        variant="ghost" 
                        onClick={handleSkip} 
                        disabled={isLoading || isVerifying}
                        className="w-full text-muted-foreground hover:text-foreground"
                    >
                        Skip for now <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
