"use client"

import * as React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { userApi, uploadApi, authApi, gdprApi } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User as UserIcon, Mail, Phone, Save, Loader2, Shield, Camera, Crown, ShieldCheck, ShieldAlert, KeyRound, Copy, Check, Trash2, Bell } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface ExtendedUser {
    id: string
    name: string
    email: string
    role: string
    phone?: string
    avatar?: string
    systemRole?: { name: string }
    plan?: string
    twoFactorEnabled?: boolean
}

export default function ProfilePage() {
    const router = useRouter()
    const { user, isAuthenticated, isLoading: authLoading, refreshUser, logout } = useAuth()
    const currentUser = user as ExtendedUser | null

    const [isEditing, setIsEditing] = React.useState(false)
    const [isSaving, setIsSaving] = React.useState(false)
    const [isUploading, setIsUploading] = React.useState(false)
    const [formData, setFormData] = React.useState({
        name: '',
        phone: '',
        avatar: '',
    })

    const [show2FAModal, setShow2FAModal] = React.useState(false)
    const [qrCodeUrl, setQrCodeUrl] = React.useState('')
    const [secretKey, setSecretKey] = React.useState('')
    const [verificationCode, setVerificationCode] = React.useState('')
    const [is2FASettingUp, setIs2FASettingUp] = React.useState(false)
    const [is2FAEnabling, setIs2FAEnabling] = React.useState(false)
    const [copied, setCopied] = React.useState(false)

    // GDPR State
    const [gdprPrefs, setGdprPrefs] = React.useState({
        subscribedToNewsletter: true,
        deleteRequested: false
    })
    const [isUpdatingGdpr, setIsUpdatingGdpr] = React.useState(false)

    React.useEffect(() => {
        if (currentUser) {
            gdprApi.getPreferences().then(res => {
                if (res.data.data) {
                    setGdprPrefs({
                        subscribedToNewsletter: res.data.data.subscribedToNewsletter,
                        deleteRequested: res.data.data.deleteRequested
                    })
                }
            }).catch(console.error)
        }
    }, [currentUser])

    const handleToggleNewsletter = async () => {
        setIsUpdatingGdpr(true)
        try {
            const newValue = !gdprPrefs.subscribedToNewsletter
            await gdprApi.updatePreferences({ subscribedToNewsletter: newValue })
            setGdprPrefs(prev => ({ ...prev, subscribedToNewsletter: newValue }))
            toast.success(newValue ? 'Subscribed to newsletters!' : 'Unsubscribed from newsletters.')
        } catch (error: any) {
            toast.error('Failed to update preferences')
        } finally {
            setIsUpdatingGdpr(false)
        }
    }

    const handleRequestDeletion = async () => {
        if (!confirm('Are you absolutely sure you want to request account deletion? This action cannot be undone and will permanently delete your data.')) return
        try {
            await gdprApi.requestDeletion()
            setGdprPrefs(prev => ({ ...prev, deleteRequested: true }))
            toast.success('Account deletion requested successfully.')
        } catch (error: any) {
            toast.error('Failed to request account deletion')
        }
    }

    const handleCopySecret = () => {
        navigator.clipboard.writeText(secretKey)
        setCopied(true)
        toast.success('Secret key copied!')
        setTimeout(() => setCopied(false), 2000)
    }

    const handleSetup2FA = async () => {
        setIs2FASettingUp(true)
        try {
            const res = await authApi.setup2FA()
            setSecretKey(res.data.secret)
            setQrCodeUrl(res.data.qrCodeUrl)
            setShow2FAModal(true)
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to initiate 2FA setup')
        } finally {
            setIs2FASettingUp(false)
        }
    }

    const handleEnable2FA = async () => {
        if (!verificationCode) {
            toast.error('Please enter the 6-digit code')
            return
        }
        setIs2FAEnabling(true)
        try {
            await authApi.enable2FA({ code: verificationCode })
            toast.success('Two-Factor Authentication enabled successfully!')
            setShow2FAModal(false)
            setVerificationCode('')
            await refreshUser()
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Invalid verification code')
        } finally {
            setIs2FAEnabling(false)
        }
    }

    const handleDisable2FA = async () => {
        if (!confirm('Are you sure you want to disable Two-Factor Authentication? This will make your account less secure.')) {
            return
        }
        try {
            await authApi.disable2FA()
            toast.success('Two-Factor Authentication disabled successfully!')
            await refreshUser()
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to disable 2FA')
        }
    }

    const fileInputRef = React.useRef<HTMLInputElement>(null)

    React.useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login')
        }
    }, [authLoading, isAuthenticated, router])

    React.useEffect(() => {
        if (currentUser) {
            setFormData({
                name: currentUser.name || '',
                phone: currentUser.phone || '',
                avatar: currentUser.avatar || '',
            })
        }
    }, [currentUser])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        try {
            await userApi.updateMe(formData)
            await refreshUser()
            setIsEditing(false)
            toast.success('Profile updated successfully!')
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to update profile')
        } finally {
            setIsSaving(false)
        }
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB')
            return
        }

        setIsUploading(true)
        const uploadFormData = new FormData()
        uploadFormData.append('file', file)

        try {
            const res = await uploadApi.upload(uploadFormData)
            const fileUrl = res.data.url

            // Immediately update the profile with the new avatar URL
            const updatedData = { ...formData, avatar: fileUrl }
            setFormData(updatedData)

            // Also save to backend immediately
            await userApi.updateMe({ ...updatedData })
            await refreshUser()

            toast.success('Profile picture updated!')
        } catch (error: any) {
            console.error(error)
            toast.error('Failed to upload image')
        } finally {
            setIsUploading(false)
        }
    }

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'SUPER_ADMIN': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            case 'ADMIN': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
            case 'INSTRUCTOR': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
        }
    }

    const getPlanBadge = (plan?: string) => {
        if (plan === 'PRO') {
            return (
                <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 shadow-sm ml-2 font-bold px-2 py-0.5 text-[10px] tracking-wider">
                    <Crown className="w-3 h-3 mr-1 fill-white" /> PRO
                </Badge>
            )
        }
        if (plan === 'ENTERPRISE') {
            return (
                <Badge className="bg-gradient-to-r from-slate-700 to-slate-900 text-white border-0 shadow-sm ml-2">
                    ENTERPRISE
                </Badge>
            )
        }
        return (
            <Badge variant="outline" className="ml-2 text-[10px] text-gray-500 font-medium">
                FREE
            </Badge>
        )
    }

    if (authLoading || !currentUser) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="container py-10 max-w-3xl animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Account Settings</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Card */}
                <Card className="col-span-1 md:col-span-3 bg-white border-gray-200 shadow-sm rounded-xl overflow-hidden">
                    <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                        <div className="absolute bottom-4 right-4">
                            {!isEditing && (
                                <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)} className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">
                                    Edit Profile
                                </Button>
                            )}
                        </div>
                    </div>
                    <CardContent className="px-8 pb-8 pt-0 relative">
                        <div className="flex flex-col md:flex-row items-center md:items-end -mt-12 mb-6 gap-6">
                            <div className="relative group">
                                <div className="h-24 w-24 rounded-full border-4 border-white bg-white shadow-md overflow-hidden flex items-center justify-center relative">
                                    {formData.avatar ? (
                                        <Image src={formData.avatar} alt="Profile" width={96} height={96} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                                            <UserIcon className="h-10 w-10 text-gray-400" />
                                        </div>
                                    )}
                                    {isUploading && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <Loader2 className="h-6 w-6 text-white animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <Button
                                    size="icon"
                                    variant="secondary"
                                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md border-2 border-white"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                >
                                    <Camera className="h-4 w-4 text-gray-600" />
                                </Button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    aria-label="Upload profile picture"
                                />
                            </div>

                            <div className="text-center md:text-left flex-1 mb-2">
                                <div className="flex items-center justify-center md:justify-start gap-2">
                                    <h2 className="text-2xl font-bold text-gray-900">{currentUser.name}</h2>
                                    {getPlanBadge(currentUser.plan)}
                                </div>
                                <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500 mt-1">
                                    <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${getRoleBadgeColor(currentUser.role)}`}>
                                        {currentUser.systemRole?.name || currentUser.role}
                                    </span>
                                    <span>•</span>
                                    <span>{currentUser.email}</span>
                                </div>
                            </div>
                        </div>

                        {isEditing ? (
                            <form onSubmit={handleSave} className="grid gap-6 max-w-xl">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Full Name</label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="max-w-md"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+91 9876543210"
                                        className="max-w-md"
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Save Changes
                                            </>
                                        )}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mt-8">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact Information</label>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-700">{currentUser.email}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</label>
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <Phone className="h-5 w-5 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-700">{currentUser.phone || 'Not provided'}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!isEditing && (
                            <div className="mt-8 pt-8 border-t border-gray-100 flex justify-between items-center">
                                <p className="text-xs text-gray-400">Member since {new Date().getFullYear()}</p>
                                <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={logout}>
                                    Sign Out
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Two-Factor Authentication Card */}
                <Card className="col-span-1 md:col-span-3 bg-white border-gray-200 shadow-sm rounded-xl overflow-hidden mt-6">
                    <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                <Shield className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-bold text-gray-900">Two-Factor Authentication (2FA)</CardTitle>
                                <CardDescription className="text-xs">
                                    Secure your account by requiring a secondary verification code from Google Authenticator.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-3">
                                {currentUser.twoFactorEnabled ? (
                                    <div className="mt-0.5 text-emerald-600">
                                        <ShieldCheck className="h-6 w-6" />
                                    </div>
                                ) : (
                                    <div className="mt-0.5 text-amber-500">
                                        <ShieldAlert className="h-6 w-6" />
                                    </div>
                                )}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900">
                                        Status: {currentUser.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                                    </h4>
                                    <p className="text-xs text-gray-500 max-w-md mt-1">
                                        {currentUser.twoFactorEnabled 
                                            ? 'Your account is protected with two-factor authentication. Each time you sign in, you will be prompted for a secure code from your authenticator app.' 
                                            : 'Two-factor authentication is not configured for your account. We highly recommend turning it on to protect your educational records, progress, and payment credentials.'
                                        }
                                    </p>
                                </div>
                            </div>
                            <div className="flex-shrink-0 self-end sm:self-center">
                                {currentUser.twoFactorEnabled ? (
                                    <Button 
                                        variant="destructive"
                                        onClick={handleDisable2FA}
                                        className="h-10 px-4 text-xs font-semibold rounded-lg shadow-sm"
                                    >
                                        Disable 2FA
                                    </Button>
                                ) : (
                                    <Button 
                                        onClick={handleSetup2FA}
                                        disabled={is2FASettingUp}
                                        className="h-10 px-4 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
                                    >
                                        {is2FASettingUp ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Setting up...
                                            </>
                                        ) : (
                                            'Enable 2FA'
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* GDPR & Privacy Card */}
                <Card className="col-span-1 md:col-span-3 bg-white border-gray-200 shadow-sm rounded-xl overflow-hidden mt-6">
                    <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                <Shield className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-bold text-gray-900">Privacy & Data (GDPR)</CardTitle>
                                <CardDescription className="text-xs">
                                    Manage your communication preferences and account data.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid gap-6">
                            {/* Newsletter Setting */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                        <Bell className="h-4 w-4 text-gray-500" />
                                        Newsletters & Updates
                                    </h4>
                                    <p className="text-xs text-gray-500 max-w-md mt-1">
                                        Receive emails about new courses, blog posts, and educational updates.
                                    </p>
                                </div>
                                <div>
                                    <Button
                                        variant={gdprPrefs.subscribedToNewsletter ? "default" : "outline"}
                                        onClick={handleToggleNewsletter}
                                        disabled={isUpdatingGdpr}
                                        className={gdprPrefs.subscribedToNewsletter ? "bg-blue-600 hover:bg-blue-700" : ""}
                                    >
                                        {gdprPrefs.subscribedToNewsletter ? 'Subscribed' : 'Unsubscribed'}
                                    </Button>
                                </div>
                            </div>

                            {/* Account Deletion */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h4 className="text-sm font-semibold text-red-600 flex items-center gap-2">
                                        <Trash2 className="h-4 w-4" />
                                        Delete Account
                                    </h4>
                                    <p className="text-xs text-gray-500 max-w-md mt-1">
                                        {gdprPrefs.deleteRequested 
                                            ? "Your account deletion request is currently being processed by administrators. This process typically takes up to 3 business days." 
                                            : "Permanently delete your account, enrollments, and all associated personal data. Please note that data deletion requests take up to 3 business days to be fully processed."}
                                    </p>
                                </div>
                                <div>
                                    <Button
                                        variant="destructive"
                                        onClick={handleRequestDeletion}
                                        disabled={gdprPrefs.deleteRequested}
                                        className="h-10 px-4 text-xs font-semibold rounded-lg shadow-sm"
                                    >
                                        {gdprPrefs.deleteRequested ? 'Deletion Requested' : 'Request Deletion'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 2FA Setup Dialog Modal */}
                <Dialog open={show2FAModal} onOpenChange={setShow2FAModal}>
                    <DialogContent className="max-w-md bg-white border border-gray-200 shadow-2xl rounded-2xl p-6 overflow-hidden">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-gray-900">
                                <KeyRound className="h-5 w-5 text-indigo-600" />
                                Configure Authenticator App
                            </DialogTitle>
                            <DialogDescription className="text-xs text-gray-500">
                                Link your account to Google Authenticator, Duo, or Authy to start generating secure temporary login codes.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 my-4">
                            {/* Step 1 */}
                            <div className="space-y-1">
                                <span className="inline-flex items-center justify-center bg-indigo-50 text-indigo-700 text-[10px] font-bold h-5 px-2 rounded-full uppercase">Step 1</span>
                                <p className="text-xs text-gray-600">
                                    Open your authenticator app (e.g., Google Authenticator, Authy, Microsoft Authenticator).
                                </p>
                            </div>

                            {/* Step 2 */}
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <span className="inline-flex items-center justify-center bg-indigo-50 text-indigo-700 text-[10px] font-bold h-5 px-2 rounded-full uppercase">Step 2</span>
                                    <p className="text-xs text-gray-600">
                                        Scan the QR code below using your phone camera, or manually input the secret key.
                                    </p>
                                </div>
                                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 border border-gray-100 rounded-xl">
                                    {qrCodeUrl && (
                                        <Image
                                            src={qrCodeUrl}
                                            alt="Scan QR Code to sync TOTP app"
                                            width={180}
                                            height={180}
                                            className="rounded-lg shadow-sm border border-white"
                                        />
                                    )}
                                    <div className="mt-3 text-center w-full max-w-[280px]">
                                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Secret Key</p>
                                        <div className="flex items-center justify-between gap-2 bg-white border border-gray-200 rounded-lg p-2 mt-1 select-all font-mono text-xs">
                                            <span className="truncate text-gray-700 text-center flex-1">{secretKey}</span>
                                            <button 
                                                onClick={handleCopySecret}
                                                className="text-gray-400 hover:text-indigo-600 transition-colors p-1"
                                                title="Copy Secret Key"
                                                aria-label="Copy secret key"
                                            >
                                                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <span className="inline-flex items-center justify-center bg-indigo-50 text-indigo-700 text-[10px] font-bold h-5 px-2 rounded-full uppercase">Step 3</span>
                                    <p className="text-xs text-gray-600">
                                        Enter the 6-digit code shown in your authenticator app to verify setup.
                                    </p>
                                </div>
                                <div className="max-w-[180px]">
                                    <Input
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="000 000"
                                        className="h-10 text-center tracking-[0.25em] font-mono text-lg rounded-lg border-gray-200 focus:border-indigo-500"
                                        maxLength={6}
                                        aria-label="6-digit verification code"
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="border-t border-gray-100 pt-4 flex gap-2">
                            <Button 
                                variant="outline" 
                                onClick={() => {
                                    setShow2FAModal(false)
                                    setVerificationCode('')
                                }}
                                className="h-10 text-xs font-semibold rounded-lg"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleEnable2FA}
                                disabled={is2FAEnabling || verificationCode.length !== 6}
                                className="h-10 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                            >
                                {is2FAEnabling ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    'Verify and Enable'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
