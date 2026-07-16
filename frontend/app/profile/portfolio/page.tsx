"use client"

import * as React from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
    Share2,
    ExternalLink,
    Linkedin,
    Copy,
    CheckCircle,
    Globe,
    Award,
    Video,
    Eye,
    Save,
    Loader2
} from 'lucide-react'
import api from '@/lib/api'

export default function PortfolioSettingsPage() {
    const router = useRouter()
    const { user, isLoading: authLoading } = useAuth()

    const [settings, setSettings] = useState({
        portfolioPublic: true,
        showCertificates: true,
        showInterviews: true,
        headline: '',
        linkedinUrl: ''
    })
    const [isSaving, setIsSaving] = useState(false)
    const [copiedLink, setCopiedLink] = useState(false)

    const getPortfolioUrl = () => {
        if (typeof window !== 'undefined' && user) {
            return `${window.location.origin}/portfolio/${user.id}`
        }
        return ''
    }

    const handleCopyLink = async () => {
        await navigator.clipboard.writeText(getPortfolioUrl())
        setCopiedLink(true)
        setTimeout(() => setCopiedLink(false), 2000)
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await api.put('/portfolio/me/settings', settings)
            alert('Settings saved!')
        } catch (error) {
            console.error('Failed to save settings:', error)
            alert('Failed to save settings. Please try again.')
        } finally {
            setIsSaving(false)
        }
    }

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const res = await api.get('/portfolio/me/settings')
                setSettings(prev => ({ ...prev, ...res.data }))
            } catch (error) {
                console.error('Failed to load settings:', error)
            }
        }
        if (user) {
            loadSettings()
        }
    }, [user])

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!user) {
        router.push('/login')
        return null
    }

    return (
        <div className="container max-w-3xl py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Portfolio Settings</h1>
                <p className="text-muted-foreground">Manage your public profile and shareable achievements.</p>
            </div>

            {/* Portfolio Link */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Share2 className="h-5 w-5" />
                        Your Portfolio Link
                    </CardTitle>
                    <CardDescription>Share this URL on your resume or LinkedIn profile</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <code className="flex-1 text-sm">{getPortfolioUrl()}</code>
                        <Button size="sm" onClick={handleCopyLink}>
                            {copiedLink ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => window.open(getPortfolioUrl(), '_blank')}>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview Portfolio
                        </Button>
                        <Button variant="outline" onClick={() => {
                            const url = encodeURIComponent(getPortfolioUrl())
                            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank')
                        }}>
                            <Linkedin className="h-4 w-4 mr-2" />
                            Share on LinkedIn
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Visibility Settings */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Visibility Settings</CardTitle>
                    <CardDescription>Control what appears on your public portfolio</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Make Portfolio Public</Label>
                            <p className="text-sm text-muted-foreground">Allow anyone with the link to view your portfolio</p>
                        </div>
                        <Switch
                            checked={settings.portfolioPublic}
                            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, portfolioPublic: checked }))}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-primary" />
                            <div className="space-y-0.5">
                                <Label>Show Certificates</Label>
                                <p className="text-sm text-muted-foreground">Display your course completion certificates</p>
                            </div>
                        </div>
                        <Switch
                            checked={settings.showCertificates}
                            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showCertificates: checked }))}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Video className="h-5 w-5 text-green-600" />
                            <div className="space-y-0.5">
                                <Label>Show Interview Results</Label>
                                <p className="text-sm text-muted-foreground">Display your AI interview achievements and scores</p>
                            </div>
                        </div>
                        <Switch
                            checked={settings.showInterviews}
                            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showInterviews: checked }))}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Profile Info */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Additional info displayed on your portfolio</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="headline">Professional Headline</Label>
                        <Input
                            id="headline"
                            placeholder="e.g., Full Stack Developer | React | Node.js"
                            value={settings.headline}
                            onChange={(e) => setSettings(prev => ({ ...prev, headline: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
                        <Input
                            id="linkedin"
                            placeholder="https://linkedin.com/in/yourprofile"
                            value={settings.linkedinUrl}
                            onChange={(e) => setSettings(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <Button onClick={handleSave} disabled={isSaving} className="w-full">
                {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                    <Save className="h-4 w-4 mr-2" />
                )}
                Save Settings
            </Button>
        </div>
    )
}
