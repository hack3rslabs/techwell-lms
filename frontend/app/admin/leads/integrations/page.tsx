"use client"

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Facebook,
    Globe,
    Phone,
    Check,
    AlertCircle,
    Copy,
    Share2,
    Settings
} from 'lucide-react'
import api from '@/lib/api'

interface Integration {
    id: string
    platform: string
    name: string
    isActive: boolean
    lastSyncAt: string | null
}

export default function LeadIntegrationsPage() {
    const [integrations, setIntegrations] = React.useState<Integration[]>([])
    const [_isLoading, setIsLoading] = React.useState(true)
    const [showConfig, setShowConfig] = React.useState<string | null>(null) // 'META', 'GOOGLE', 'JUSTDIAL'

    // Config Form State
    const [configData, setConfigData] = React.useState({
        platform: '',
        accessToken: '',
        pageId: '',
        accountId: '',
        webhookSecret: '',
        name: ''
    })

    React.useEffect(() => {
        fetchIntegrations()
    }, [])

    const fetchIntegrations = async () => {
        try {
            const res = await api.get('/leads/integrations')
            setIntegrations(res.data)
        } catch {
            // Error handling
        } finally {
            setIsLoading(false)
        }
    }

    const handleSaveConfig = async () => {
        try {
            await api.post('/leads/integrations', configData)
            fetchIntegrations()
            setShowConfig(null)
            setConfigData({ platform: '', accessToken: '', pageId: '', accountId: '', webhookSecret: '', name: '' })
        } catch {
            alert('Failed to connect integration')
        }
    }

    const getWebhookUrl = (platform: string) => {
        if (typeof window === 'undefined') return ''
        // Assuming backend is on same domain/port proxy or configured URL
        // Using window.location.origin as placeholder, normally this is API_URL
        return `https://your-backend-api.com/api/leads/webhook/${platform.toLowerCase()}`
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Share2 className="h-8 w-8 text-primary" />
                    Lead Integrations
                </h1>
                <p className="text-muted-foreground">Connect your marketing channels to auto-import leads.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Meta Integration */}
                <Card className="border-blue-200 bg-blue-50/20">
                    <CardHeader>
                        <CardTitle className="flex justify-between">
                            <span className="flex items-center gap-2"><Facebook className="h-5 w-5 text-blue-600" /> Meta (Facebook/Insta)</span>
                            {integrations.find(i => i.platform === 'META') ? (
                                <Badge className="bg-green-500">Connected</Badge>
                            ) : (
                                <Badge variant="outline">Disconnected</Badge>
                            )}
                        </CardTitle>
                        <CardDescription>Import leads from Facebook & Instagram Instant Forms.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {integrations.find(i => i.platform === 'META') ? (
                            <div className="space-y-4">
                                <div className="p-3 bg-muted rounded-md text-sm">
                                    <p className="font-semibold text-xs uppercase text-muted-foreground mb-1">Webhook URL</p>
                                    <code className="text-xs break-all">{getWebhookUrl('META')}</code>
                                </div>
                                <div className="p-3 bg-muted rounded-md text-sm">
                                    <p className="font-semibold text-xs uppercase text-muted-foreground mb-1">Verify Token</p>
                                    <code className="text-xs select-all">techwell_meta_secret</code>
                                </div>
                                <Button variant="outline" className="w-full">Reconfigure</Button>
                            </div>
                        ) : (
                            <Button className="w-full" onClick={() => {
                                setConfigData({ ...configData, platform: 'META', name: 'Facebook Ads' })
                                setShowConfig('META')
                            }}>Connect Facebook</Button>
                        )}
                    </CardContent>
                </Card>

                {/* JustDial Integration */}
                <Card className="border-orange-200 bg-orange-50/20">
                    <CardHeader>
                        <CardTitle className="flex justify-between">
                            <span className="flex items-center gap-2"><Phone className="h-5 w-5 text-orange-600" /> Just Dial</span>
                            {integrations.find(i => i.platform === 'JUSTDIAL') ? (
                                <Badge className="bg-green-500">Connected</Badge>
                            ) : (
                                <Badge variant="outline">Disconnected</Badge>
                            )}
                        </CardTitle>
                        <CardDescription>Receive lead data via JustDial API/Webhook.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="p-3 bg-muted rounded-md text-sm">
                                <p className="font-semibold text-xs uppercase text-muted-foreground mb-1">Target URL for JustDial</p>
                                <code className="text-xs break-all">{getWebhookUrl('generic')}</code>
                            </div>
                            {integrations.find(i => i.platform === 'JUSTDIAL') ? (
                                <Button variant="outline" className="w-full" disabled>Connected</Button>
                            ) : (
                                <Button className="w-full" onClick={() => {
                                    setConfigData({ ...configData, platform: 'JUSTDIAL', name: 'JustDial Leads' })
                                    handleSaveConfig() // Just basic activation
                                }}>Activate Listener</Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Google My Business */}
                <Card className="border-red-200 bg-red-50/20">
                    <CardHeader>
                        <CardTitle className="flex justify-between">
                            <span className="flex items-center gap-2"><Globe className="h-5 w-5 text-red-600" /> Google Business</span>
                            <Badge variant="secondary">Coming Soon</Badge>
                        </CardTitle>
                        <CardDescription>Sync messages and quote requests from GMB.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="w-full" disabled>Connect Google</Button>
                    </CardContent>
                </Card>

            </div>

            {/* Config Dialog (Overlay) */}
            {showConfig === 'META' && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="max-w-md w-full">
                        <CardHeader>
                            <CardTitle>Configure Meta Integration</CardTitle>
                            <CardDescription>Enter your Facebook App Token</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Page Access Token</Label>
                                <Input
                                    type="password"
                                    value={configData.accessToken}
                                    onChange={e => setConfigData({ ...configData, accessToken: e.target.value })}
                                />
                                <p className="text-xs text-muted-foreground">Used to fetch lead details from Graph API.</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Page ID (Optional)</Label>
                                <Input
                                    value={configData.pageId}
                                    onChange={e => setConfigData({ ...configData, pageId: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" onClick={() => setShowConfig(null)}>Cancel</Button>
                                <Button onClick={handleSaveConfig}>Save & Connect</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
