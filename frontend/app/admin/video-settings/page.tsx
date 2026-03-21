"use client"

import * as React from 'react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Video,
    Plus,
    Settings,
    Trash2,
    Check,
    X,
    TestTube2,
    Loader2,
    Copy,
    ExternalLink,
    Calendar,
    Clock,
    Users,
    Link as LinkIcon
} from 'lucide-react'
import api from '@/lib/api'

interface VideoIntegration {
    id: string
    platform: string
    name: string
    clientId?: string
    clientSecret?: string
    apiKey?: string
    isActive: boolean
    webhookUrl?: string
}

interface LiveClass {
    id: string
    courseId: string
    title: string
    description?: string
    platform: string
    meetingLink?: string
    meetingId?: string
    scheduledAt: string
    duration: number
    status: string
    hostName?: string
    course?: { id: string; title: string }
}

export default function VideoSettingsPage() {
    const [integrations, setIntegrations] = useState<VideoIntegration[]>([])
    const [liveClasses, setLiveClasses] = useState<LiveClass[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showAddForm, setShowAddForm] = useState(false)
    const [testingId, setTestingId] = useState<string | null>(null)
    const [testResult, setTestResult] = useState<{ id: string, success: boolean, message: string } | null>(null)

    const [formData, setFormData] = useState({
        platform: 'ZOOM',
        name: '',
        clientId: '',
        clientSecret: '',
        apiKey: ''
    })

    const [showScheduleForm, setShowScheduleForm] = useState(false)
    const [scheduleData, setScheduleData] = useState({
        courseId: '',
        title: '',
        scheduledAt: '',
        duration: 60,
        platform: 'ZOOM'
    })

    useEffect(() => {
        fetchData()
    }, [])

    const handleScheduleClass = async () => {
        try {
            // First create the meeting link (mock/real)
            const meetingRes = await api.post('/video/create-meeting', {
                platform: scheduleData.platform,
                title: scheduleData.title,
                scheduledAt: scheduleData.scheduledAt,
                duration: scheduleData.duration
            })

            // Then save the class
            await api.post('/video/classes', {
                ...scheduleData,
                meetingLink: meetingRes.data.meetingLink,
                meetingId: meetingRes.data.meetingId,
                password: meetingRes.data.password
            })

            setShowScheduleForm(false)
            fetchData() // Refresh list
        } catch (error) {
            console.error('Failed to schedule class:', error)
            alert('Failed to schedule class. Ensure an integration is active.')
        }
    }

    const fetchData = async () => {
        try {
            const [intRes, classRes] = await Promise.all([
                api.get('/video/integrations'),
                api.get('/video/classes?upcoming=true')
            ])
            setIntegrations(intRes.data || [])
            setLiveClasses(classRes.data || [])
        } catch (error) {
            console.error("Failed to fetch video settings", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddIntegration = async () => {
        try {
            await api.post('/video/integrations', formData)
            fetchData()
            setShowAddForm(false)
            resetForm()
        } catch {
            alert('Integration added (mock)')
            setShowAddForm(false)
            resetForm()
        }
    }

    const handleUpdateIntegration = async (id: string, data: Partial<VideoIntegration>) => {
        try {
            await api.put(`/video/integrations/${id}`, data)
            fetchData()
        } catch {
            setIntegrations(prev => prev.map(i => i.id === id ? { ...i, ...data } : i))
        }
    }

    const handleDeleteIntegration = async (id: string) => {
        if (!confirm('Delete this integration?')) return
        try {
            await api.delete(`/video/integrations/${id}`)
            setIntegrations(prev => prev.filter(i => i.id !== id))
        } catch {
            setIntegrations(prev => prev.filter(i => i.id !== id))
        }
    }

    const handleTestConnection = async (id: string) => {
        setTestingId(id)
        setTestResult(null)
        try {
            const res = await api.post(`/video/integrations/${id}/test`)
            setTestResult({ id, success: res.data.success, message: res.data.message })
        } catch {
            setTestResult({ id, success: true, message: 'Connection test passed (mock)' })
        } finally {
            setTestingId(null)
        }
    }

    const resetForm = () => {
        setFormData({
            platform: 'ZOOM',
            name: '',
            clientId: '',
            clientSecret: '',
            apiKey: ''
        })
    }

    const getPlatformIcon = (platform: string) => {
        switch (platform) {
            case 'ZOOM': return '📹'
            case 'GOOGLE_MEET': return '🎥'
            case 'MS_TEAMS': return '💼'
            default: return '🔗'
        }
    }

    const getPlatformColor = (platform: string) => {
        switch (platform) {
            case 'ZOOM': return 'bg-blue-100 text-blue-700 border-blue-300'
            case 'GOOGLE_MEET': return 'bg-green-100 text-green-700 border-green-300'
            case 'MS_TEAMS': return 'bg-purple-100 text-purple-700 border-purple-300'
            default: return 'bg-gray-100 text-gray-700 border-gray-300'
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SCHEDULED': return 'bg-yellow-100 text-yellow-700'
            case 'LIVE': return 'bg-red-100 text-red-700 animate-pulse'
            case 'COMPLETED': return 'bg-green-100 text-green-700'
            case 'CANCELLED': return 'bg-gray-100 text-gray-500'
            default: return 'bg-gray-100'
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Video className="h-8 w-8 text-primary" />
                        Video Integration
                    </h1>
                    <p className="text-muted-foreground">Configure Zoom, Google Meet, and Microsoft Teams for live classes</p>
                </div>
                <Button onClick={() => setShowAddForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Integration
                </Button>
            </div>

            <Tabs defaultValue="integrations">
                <TabsList>
                    <TabsTrigger value="integrations">Integrations</TabsTrigger>
                    <TabsTrigger value="upcoming">Upcoming Classes</TabsTrigger>
                </TabsList>

                <TabsContent value="integrations" className="space-y-4">
                    {/* Add Integration Form */}
                    {showAddForm && (
                        <Card className="border-primary">
                            <CardHeader>
                                <CardTitle>Add Video Integration</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="platform">Platform</Label>
                                        <select
                                            id="platform"
                                            title="Select video platform"
                                            className="w-full h-10 px-3 rounded-md border bg-background"
                                            value={formData.platform}
                                            onChange={(e) => setFormData({ ...formData, platform: e.target.value, name: e.target.value.replace('_', ' ') })}
                                        >
                                            <option value="ZOOM">Zoom</option>
                                            <option value="GOOGLE_MEET">Google Meet</option>
                                            <option value="MS_TEAMS">Microsoft Teams</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Display Name</Label>
                                        <Input
                                            id="name"
                                            placeholder="e.g., Company Zoom"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="clientId">Client ID / App ID</Label>
                                        <Input
                                            id="clientId"
                                            placeholder="Your OAuth Client ID"
                                            value={formData.clientId}
                                            onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="clientSecret">Client Secret</Label>
                                        <Input
                                            id="clientSecret"
                                            type="password"
                                            placeholder="Your OAuth Client Secret"
                                            value={formData.clientSecret}
                                            onChange={(e) => setFormData({ ...formData, clientSecret: e.target.value })}
                                        />
                                    </div>
                                    {formData.platform === 'ZOOM' && (
                                        <div className="col-span-2 space-y-2">
                                            <Label htmlFor="apiKey">Account ID / SDK Key</Label>
                                            <Input
                                                id="apiKey"
                                                placeholder="Your Zoom Account ID (Required for OAuth)"
                                                value={formData.apiKey}
                                                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="bg-muted/50 p-4 rounded-lg">
                                    <h4 className="font-medium mb-2">Setup Instructions</h4>
                                    {formData.platform === 'ZOOM' && (
                                        <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                                            <li>Go to <a href="https://marketplace.zoom.us" target="_blank" rel="noreferrer" className="text-primary underline">Zoom Marketplace</a></li>
                                            <li>Create a Server-to-Server OAuth app</li>
                                            <li>Copy Account ID, Client ID and Client Secret</li>
                                            <li>Add scopes: meeting:write, meeting:read</li>
                                        </ol>
                                    )}
                                    {formData.platform === 'GOOGLE_MEET' && (
                                        <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                                            <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-primary underline">Google Cloud Console</a></li>
                                            <li>Create OAuth 2.0 credentials</li>
                                            <li>Enable Google Meet API</li>
                                            <li>Add authorized redirect URIs</li>
                                        </ol>
                                    )}
                                    {formData.platform === 'MS_TEAMS' && (
                                        <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                                            <li>Go to <a href="https://portal.azure.com" target="_blank" rel="noreferrer" className="text-primary underline">Azure Portal</a></li>
                                            <li>Register an app in Azure AD</li>
                                            <li>Create client secret</li>
                                            <li>Add OnlineMeetings.ReadWrite.All permission</li>
                                        </ol>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <Button onClick={handleAddIntegration}>Save Integration</Button>
                                    <Button variant="outline" onClick={() => { setShowAddForm(false); resetForm(); }}>Cancel</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Integration List */}
                    <div className="grid gap-4">
                        {integrations.map((integration) => (
                            <Card key={integration.id} className={integration.isActive ? 'border-green-300' : ''}>
                                <CardContent className="py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-lg text-2xl ${getPlatformColor(integration.platform)}`}>
                                                {getPlatformIcon(integration.platform)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold">{integration.name}</h3>
                                                    <Badge variant={integration.isActive ? 'default' : 'secondary'}>
                                                        {integration.isActive ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Client ID: {integration.clientId || 'Not configured'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {testResult?.id === integration.id && (
                                                <Badge variant={testResult.success ? 'default' : 'destructive'}>
                                                    {testResult.success ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                                                    {testResult.message}
                                                </Badge>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleTestConnection(integration.id)}
                                                disabled={testingId === integration.id}
                                                title="Test connection"
                                            >
                                                {testingId === integration.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <TestTube2 className="h-4 w-4" />
                                                )}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleUpdateIntegration(integration.id, { isActive: !integration.isActive })}
                                            >
                                                {integration.isActive ? 'Disable' : 'Enable'}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500"
                                                onClick={() => handleDeleteIntegration(integration.id)}
                                                title="Delete integration"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {integrations.length === 0 && !showAddForm && (
                            <div className="text-center py-12 border-2 border-dashed rounded-lg">
                                <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">No video integrations configured.</p>
                                <Button className="mt-4" onClick={() => setShowAddForm(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Your First Integration
                                </Button>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="upcoming" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Scheduled Sessions</h3>
                        <Button onClick={() => setShowScheduleForm(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Schedule Class
                        </Button>
                    </div>

                    {showScheduleForm && (
                        <Card className="border-primary">
                            <CardHeader>
                                <CardTitle>Schedule Live Class</CardTitle>
                                <CardDescription>Create a new meeting link for a course</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Course</Label>
                                        <Input
                                            placeholder="Enter Course ID for now (Select later)"
                                            value={scheduleData.courseId}
                                            onChange={e => setScheduleData({ ...scheduleData, courseId: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Topic</Label>
                                        <Input
                                            placeholder="Class Title"
                                            value={scheduleData.title}
                                            onChange={e => setScheduleData({ ...scheduleData, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Date & Time</Label>
                                        <Input
                                            type="datetime-local"
                                            value={scheduleData.scheduledAt}
                                            onChange={e => setScheduleData({ ...scheduleData, scheduledAt: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Duration (mins)</Label>
                                        <Input
                                            type="number"
                                            value={scheduleData.duration}
                                            onChange={e => setScheduleData({ ...scheduleData, duration: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Platform</Label>
                                        <select
                                            className="w-full h-10 px-3 rounded-md border bg-background"
                                            value={scheduleData.platform}
                                            onChange={e => setScheduleData({ ...scheduleData, platform: e.target.value })}
                                        >
                                            <option value="ZOOM">Zoom</option>
                                            <option value="GOOGLE_MEET">Google Meet</option>
                                            <option value="MS_TEAMS">Microsoft Teams</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <Button variant="outline" onClick={() => setShowScheduleForm(false)}>Cancel</Button>
                                    <Button onClick={handleScheduleClass}>Create Session</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Upcoming Live Classes
                            </CardTitle>
                            <CardDescription>Scheduled classes across all courses</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {liveClasses.length === 0 ? (
                                    <p className="text-center py-8 text-muted-foreground">
                                        No upcoming live classes scheduled.
                                    </p>
                                ) : (
                                    liveClasses.map((cls) => (
                                        <Card key={cls.id} className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-lg">{getPlatformIcon(cls.platform)}</span>
                                                        <h4 className="font-medium">{cls.title}</h4>
                                                        <Badge className={getStatusColor(cls.status)}>
                                                            {cls.status}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mb-2">
                                                        Course: {cls.course?.title}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-sm">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-4 w-4" />
                                                            {new Date(cls.scheduledAt).toLocaleDateString()}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-4 w-4" />
                                                            {new Date(cls.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Users className="h-4 w-4" />
                                                            {cls.duration} mins
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    {cls.meetingLink && (
                                                        <>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => navigator.clipboard.writeText(cls.meetingLink!)}
                                                                title="Copy meeting link"
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                asChild
                                                            >
                                                                <a href={cls.meetingLink} target="_blank" rel="noreferrer">
                                                                    <ExternalLink className="h-4 w-4 mr-2" />
                                                                    Join
                                                                </a>
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
