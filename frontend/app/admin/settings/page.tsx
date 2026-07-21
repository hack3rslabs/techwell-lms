"use client"

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Loader2, Camera, Upload, User, QrCode, Shield } from 'lucide-react'
import api from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

export default function SettingsPage() {
    const { hasPermission } = useAuth()
    interface UserProfile {
        name: string
        email: string
        phone?: string
        avatar?: string
        role: string
    }
    const [user, setUser] = React.useState<UserProfile | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)
    const [isSaving, setIsSaving] = React.useState(false)

    // Profile Form
    const [formData, setFormData] = React.useState({
        name: '',
        phone: '',
    })
    const [avatarFile, setAvatarFile] = React.useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null)

    // System Settings State
    
    // 2FA State
    const [qrCodeUrl, setQrCodeUrl] = React.useState<string | null>(null)
    const [twoFaCode, setTwoFaCode] = React.useState('')
    const [is2FaEnabled, setIs2FaEnabled] = React.useState(false)

    const [systemSettings, setSystemSettings] = React.useState({
        platformName: '',
        supportEmail: '',
        primaryColor: '#2563eb',
        isMaintenanceMode: false,
        isTestMode: false,
        showAffiliate: false,
        affiliateUrl: '',
        affiliateTitle: ''
    })

    async function fetchProfile() {
        try {
            const [userRes, settingsRes] = await Promise.all([
                api.get('/users/me'),
                api.get('/settings') // Requires permissions, handles 403 gracefully if not admin
            ])

            setUser(userRes.data)
            setFormData({
                name: userRes.data.name || '',
                phone: userRes.data.phone || ''
            })
            setIs2FaEnabled(userRes.data.twoFactorEnabled || false)
            setAvatarPreview(userRes.data.avatar ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${userRes.data.avatar}` : null)

            if (settingsRes.data) {
                setSystemSettings(settingsRes.data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }


    React.useEffect(() => {
        fetchProfile()
    }, [])


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setAvatarFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    
    const handleSetup2FA = async () => {
        try {
            const res = await api.post('/auth/2fa/setup')
            setQrCodeUrl(res.data.data.qrCodeUrl)
        } catch (error) {
            console.error(error)
            alert('Failed to setup 2FA')
        }
    }

    const handleEnable2FA = async () => {
        try {
            await api.post('/auth/2fa/enable', { token: twoFaCode })
            setIs2FaEnabled(true)
            setQrCodeUrl(null)
            setTwoFaCode('')
            alert('2FA enabled successfully!')
        } catch (error) {
            console.error(error)
            alert('Invalid 2FA code')
        }
    }

    const handleSaveProfile = async () => {
        setIsSaving(true)
        try {
            // 1. Update Details
            await api.put('/users/profile', formData)

            // 2. Upload Avatar if changed
            if (avatarFile) {
                const uploadData = new FormData()
                uploadData.append('avatar', avatarFile)
                await api.post('/users/profile-image', uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
            }

            alert('Profile updated successfully!')
            fetchProfile() // Refresh
        } catch (error) {
            console.error(error)
            alert('Failed to update profile.')
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
                <p className="text-muted-foreground">Manage your profile and preferences.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Profile Card */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Personal Profile</CardTitle>
                        <CardDescription>Update your photo and personal details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            {/* Avatar Section */}
                            <div className="flex flex-col items-center gap-4">
                                <Avatar className="h-32 w-32 border-2 border-muted">
                                    <AvatarImage src={avatarPreview || ''} className="object-cover" />
                                    <AvatarFallback className="text-4xl bg-muted">
                                        {user?.name?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="relative">
                                    <input
                                        type="file"
                                        id="avatar-upload"
                                        className="hidden"
                                        accept="image/jpeg,image/png,image/jpg"
                                        onChange={handleFileChange}
                                    />
                                    <Button variant="outline" size="sm" className="cursor-pointer" asChild>
                                        <label htmlFor="avatar-upload">
                                            <Camera className="mr-2 h-4 w-4" />
                                            Change Photo
                                        </label>
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    JPG, JPEG or PNG. Max 5MB.
                                </p>
                            </div>

                            {/* Details Section */}
                            <div className="flex-1 space-y-4 w-full max-w-lg">
                                <div className="grid gap-2">
                                    <Label>Full Name</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Email Address</Label>
                                    <Input value={user?.email} disabled className="bg-muted/50" />
                                    <p className="text-[0.8rem] text-muted-foreground">Email cannot be changed.</p>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Phone Number</Label>
                                    <Input
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+91..."
                                    />
                                </div>

                                <div className="pt-4">
                                    <Button onClick={handleSaveProfile} disabled={isSaving}>
                                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                
                {/* Security Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-indigo-500" />
                            Security Settings
                        </CardTitle>
                        <CardDescription>Secure your account with Two-Factor Authentication.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between border p-4 rounded-lg">
                            <div className="space-y-0.5">
                                <Label className="text-base font-semibold">Two-Factor Authentication (2FA)</Label>
                                <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {is2FaEnabled ? (
                                    <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">Enabled</span>
                                ) : (
                                    <Button onClick={handleSetup2FA} variant="outline" size="sm">Setup 2FA</Button>
                                )}
                            </div>
                        </div>

                        {qrCodeUrl && !is2FaEnabled && (
                            <div className="mt-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-top-2">
                                <div className="text-center">
                                    <h4 className="font-semibold text-sm">Scan QR Code</h4>
                                    <p className="text-xs text-muted-foreground">Use Google Authenticator or Authy to scan this code.</p>
                                </div>
                                <div className="bg-white p-2 rounded-xl shadow-sm border">
                                    <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                                </div>
                                <div className="w-full max-w-xs space-y-2">
                                    <Label className="text-xs">Enter 6-digit code</Label>
                                    <div className="flex gap-2">
                                        <Input 
                                            value={twoFaCode}
                                            onChange={(e) => setTwoFaCode(e.target.value)}
                                            placeholder="000000"
                                            maxLength={6}
                                            className="text-center tracking-widest font-mono font-bold"
                                        />
                                        <Button onClick={handleEnable2FA} disabled={twoFaCode.length !== 6}>Verify</Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Platform Settings */}
                {hasPermission('SETTINGS') ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Platform Configuration</CardTitle>
                            <CardDescription>System-wide branding and settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Platform Name</Label>
                                <Input
                                    value={systemSettings.platformName}
                                    onChange={e => setSystemSettings({ ...systemSettings, platformName: e.target.value })}
                                    disabled={!hasPermission('SETTINGS', 'update')}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Support Email</Label>
                                <Input
                                    value={systemSettings.supportEmail}
                                    onChange={e => setSystemSettings({ ...systemSettings, supportEmail: e.target.value })}
                                    disabled={!hasPermission('SETTINGS', 'update')}
                                />
                            </div>

                            <div className="flex items-center justify-between border p-4 rounded-lg mt-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Enable Affiliate Link in Footer</Label>
                                    <p className="text-sm text-muted-foreground">Show an affiliate link in the website footer.</p>
                                </div>
                                <Switch
                                    checked={systemSettings.showAffiliate}
                                    onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, showAffiliate: checked })}
                                    disabled={!hasPermission('SETTINGS', 'update')}
                                />
                            </div>
                            
                            {systemSettings.showAffiliate && (
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <div className="grid gap-2">
                                        <Label>Affiliate Link Title</Label>
                                        <Input
                                            placeholder="e.g. Become an Affiliate"
                                            value={systemSettings.affiliateTitle || ''}
                                            onChange={e => setSystemSettings({ ...systemSettings, affiliateTitle: e.target.value })}
                                            disabled={!hasPermission('SETTINGS', 'update')}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Affiliate Link URL</Label>
                                        <Input
                                            placeholder="e.g. https://affiliate.techwell.com"
                                            value={systemSettings.affiliateUrl || ''}
                                            onChange={e => setSystemSettings({ ...systemSettings, affiliateUrl: e.target.value })}
                                            disabled={!hasPermission('SETTINGS', 'update')}
                                        />
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex items-center justify-between border p-4 rounded-lg mt-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Maintenance Mode</Label>
                                    <p className="text-sm text-muted-foreground">Put the system in maintenance mode. Only admins will be able to access.</p>
                                </div>
                                <Switch
                                    checked={systemSettings.isMaintenanceMode}
                                    onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, isMaintenanceMode: checked })}
                                    disabled={!hasPermission('SETTINGS', 'update')}
                                />
                            </div>

                            <div className="flex items-center justify-between border p-4 rounded-lg mb-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Test Mode</Label>
                                    <p className="text-sm text-muted-foreground">Enable test mode for safe development and mock payments.</p>
                                </div>
                                <Switch
                                    checked={systemSettings.isTestMode}
                                    onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, isTestMode: checked })}
                                    disabled={!hasPermission('SETTINGS', 'update')}
                                />
                            </div>

                            {hasPermission('SETTINGS', 'update') && (
                                <Button variant="outline" onClick={async () => {
                                    try {
                                        await api.put('/settings', systemSettings)
                                        alert('Settings updated!')
                                    } catch (e) { console.error(e); alert('Update failed') }
                                }}>Update Config</Button>
                            )}
                        </CardContent>
                    </Card>
                ) : null}

                <Card>
                    <CardHeader>
                        <CardTitle>Integrations</CardTitle>
                        <CardDescription>Third-party service connections.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 border rounded-md">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 p-2 rounded">
                                    <Video className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-sm">Video Conferencing</p>
                                    <p className="text-xs text-muted-foreground">Zoom / Meet / Teams</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm">Manage</Button>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-md">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-100 p-2 rounded">
                                    <DollarSign className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-sm">Payment Gateway</p>
                                    <p className="text-xs text-muted-foreground">Razorpay Connected</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm">Configure</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function Video({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M15 10l5-5v14l-5-5" />
            <path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
        </svg>
    )
}

function DollarSign({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    )
}
