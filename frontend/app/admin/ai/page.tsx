"use client"

import * as React from 'react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Sparkles,
    Plus,
    Trash2,
    Check,
    X,
    TestTube2,
    Loader2,
    BarChart3,
    Zap,
    Brain,
    Bot
} from 'lucide-react'
import api from '@/lib/api'

interface AIProvider {
    id: string
    name: string
    provider: string
    apiKey: string
    model: string
    endpoint?: string
    isActive: boolean
    isDefault: boolean
    usageLimit?: number
    currentUsage: number
    temperature: number
    maxTokens: number
}

interface UsageStats {
    total: { tokens: number, requests: number }
    byProvider: unknown[]
    byFeature: { feature: string, _sum: { tokensUsed: number }, _count: number }[]
}

export default function AdminAISettingsPage() {
    const [providers, setProviders] = useState<AIProvider[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showAddForm, setShowAddForm] = useState(false)
    const [testingId, setTestingId] = useState<string | null>(null)
    const [testResult, setTestResult] = useState<{ id: string, success: boolean, message: string } | null>(null)
    const [usage, setUsage] = useState<UsageStats | null>(null)

    const [formData, setFormData] = useState({
        name: '',
        provider: 'OPENAI',
        apiKey: '',
        model: 'gpt-4',
        endpoint: '',
        temperature: 0.7,
        maxTokens: 2048,
        usageLimit: 0
    })

    async function fetchProviders() {
        try {
            const res = await api.get('/ai/providers')
            setProviders(res.data)
        } catch (error) {
            console.error('Failed to fetch providers:', error)
            setProviders([])
        } finally {
            setIsLoading(false)
        }
    }


    async function fetchUsage() {
        try {
            const res = await api.get('/ai/usage')
            setUsage(res.data)
        } catch (error) {
            console.error('Failed to fetch usage stats:', error)
            setUsage({
                total: { tokens: 0, requests: 0 },
                byProvider: [],
                byFeature: []
            })
        }
    }



    useEffect(() => {
        fetchProviders()
        fetchUsage()
    }, [])


    const handleAddProvider = async () => {
        try {
            await api.post('/ai/providers', formData)
            fetchProviders()
            setShowAddForm(false)
            resetForm()
        } catch (error: any) {
            console.error('Failed to add provider:', error)
            alert(error.response?.data?.error || 'Failed to add provider')
        }
    }

    const handleUpdateProvider = async (id: string, data: Partial<AIProvider>) => {
        try {
            await api.put(`/ai/providers/${id}`, data)
            fetchProviders()
        } catch (error) {
            console.error('Failed to update provider:', error)
        }
    }

    const handleDeleteProvider = async (id: string) => {
        if (!confirm('Are you sure you want to delete this provider?')) return
        try {
            await api.delete(`/ai/providers/${id}`)
            fetchProviders()
        } catch (error) {
            console.error('Failed to delete provider:', error)
        }
    }

    const handleTestConnection = async (id: string) => {
        setTestingId(id)
        setTestResult(null)
        try {
            const res = await api.post(`/ai/providers/${id}/test`)
            setTestResult({ id, success: res.data.success, message: res.data.message })
        } catch (error: any) {
            setTestResult({ id, success: false, message: error.response?.data?.error || 'Connection failed' })
        } finally {
            setTestingId(null)
        }
    }

    const resetForm = () => {
        setFormData({
            name: '',
            provider: 'OPENAI',
            apiKey: '',
            model: 'gpt-4',
            endpoint: '',
            temperature: 0.7,
            maxTokens: 2048,
            usageLimit: 0
        })
    }

    const getProviderIcon = (provider: string) => {
        switch (provider) {
            case 'OPENAI': return <Brain className="h-5 w-5" />
            case 'GOOGLE': return <Sparkles className="h-5 w-5" />
            case 'ANTHROPIC': return <Bot className="h-5 w-5" />
            default: return <Zap className="h-5 w-5" />
        }
    }

    const getProviderColor = (provider: string) => {
        switch (provider) {
            case 'OPENAI': return 'bg-green-100 text-green-700 border-green-300'
            case 'GOOGLE': return 'bg-blue-100 text-blue-700 border-blue-300'
            case 'ANTHROPIC': return 'bg-orange-100 text-orange-700 border-orange-300'
            default: return 'bg-gray-100 text-gray-700 border-gray-300'
        }
    }

    const modelOptions: Record<string, string[]> = {
        OPENAI: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
        GOOGLE: ['gemini-pro', 'gemini-pro-vision', 'gemini-ultra'],
        ANTHROPIC: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
        CUSTOM: []
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
                        <Sparkles className="h-8 w-8 text-primary" />
                        AI Configuration
                    </h1>
                    <p className="text-muted-foreground">Manage AI providers and API settings</p>
                </div>
                <Button onClick={() => setShowAddForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Provider
                </Button>
            </div>

            <Tabs defaultValue="providers">
                <TabsList>
                    <TabsTrigger value="providers">Providers</TabsTrigger>
                    <TabsTrigger value="usage">Usage & Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="providers" className="space-y-4">
                    {/* Add Provider Form */}
                    {showAddForm && (
                        <Card className="border-primary">
                            <CardHeader>
                                <CardTitle>Add AI Provider</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Display Name</Label>
                                        <Input
                                            id="name"
                                            placeholder="e.g., OpenAI GPT-4"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="provider">Provider</Label>
                                        <select
                                            id="provider"
                                            title="Select AI Provider"
                                            className="w-full h-10 px-3 rounded-md border bg-background"
                                            value={formData.provider}
                                            onChange={(e) => setFormData({ ...formData, provider: e.target.value, model: modelOptions[e.target.value]?.[0] || '' })}
                                        >
                                            <option value="OPENAI">OpenAI</option>
                                            <option value="GOOGLE">Google Gemini</option>
                                            <option value="ANTHROPIC">Anthropic Claude</option>
                                            <option value="CUSTOM">Custom</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="apiKey">API Key</Label>
                                        <Input
                                            id="apiKey"
                                            type="password"
                                            placeholder="sk-..."
                                            value={formData.apiKey}
                                            onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="model">Model</Label>
                                        <select
                                            id="model"
                                            title="Select AI Model"
                                            className="w-full h-10 px-3 rounded-md border bg-background"
                                            value={formData.model}
                                            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                        >
                                            {modelOptions[formData.provider]?.map(m => (
                                                <option key={m} value={m}>{m}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="temperature">Temperature ({formData.temperature})</Label>
                                        <input
                                            id="temperature"
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            className="w-full"
                                            value={formData.temperature}
                                            onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="maxTokens">Max Tokens</Label>
                                        <Input
                                            id="maxTokens"
                                            type="number"
                                            value={formData.maxTokens}
                                            onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={handleAddProvider}>Save Provider</Button>
                                    <Button variant="outline" onClick={() => { setShowAddForm(false); resetForm(); }}>Cancel</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Provider List */}
                    <div className="grid gap-4">
                        {providers.map((provider) => (
                            <Card key={provider.id} className={provider.isDefault ? 'border-primary' : ''}>
                                <CardContent className="py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-lg ${getProviderColor(provider.provider)}`}>
                                                {getProviderIcon(provider.provider)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold">{provider.name}</h3>
                                                    {provider.isDefault && <Badge>Default</Badge>}
                                                    <Badge variant={provider.isActive ? 'default' : 'secondary'}>
                                                        {provider.isActive ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Model: {provider.model} | API Key: {provider.apiKey}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {testResult?.id === provider.id && (
                                                <Badge variant={testResult.success ? 'default' : 'destructive'}>
                                                    {testResult.success ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                                                    {testResult.message}
                                                </Badge>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleTestConnection(provider.id)}
                                                disabled={testingId === provider.id}
                                            >
                                                {testingId === provider.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <TestTube2 className="h-4 w-4" />
                                                )}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleUpdateProvider(provider.id, { isActive: !provider.isActive })}
                                            >
                                                {provider.isActive ? 'Disable' : 'Enable'}
                                            </Button>
                                            {!provider.isDefault && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleUpdateProvider(provider.id, { isDefault: true })}
                                                >
                                                    Set Default
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500"
                                                onClick={() => handleDeleteProvider(provider.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    {/* Usage Bar */}
                                    {provider.usageLimit && (
                                        <div className="mt-4">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>Usage: {provider.currentUsage.toLocaleString()} tokens</span>
                                                <span>Limit: {provider.usageLimit.toLocaleString()}</span>
                                            </div>
                                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary transition-all"
                                                    style={{ width: `${Math.min((provider.currentUsage / provider.usageLimit) * 100, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="usage" className="space-y-4">
                    {/* Usage Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <BarChart3 className="h-8 w-8 mx-auto text-primary mb-2" />
                                    <p className="text-3xl font-bold">{usage?.total.tokens.toLocaleString() || 0}</p>
                                    <p className="text-sm text-muted-foreground">Total Tokens Used</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <Zap className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
                                    <p className="text-3xl font-bold">{usage?.total.requests || 0}</p>
                                    <p className="text-sm text-muted-foreground">Total Requests</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <Brain className="h-8 w-8 mx-auto text-green-500 mb-2" />
                                    <p className="text-3xl font-bold">{providers.filter(p => p.isActive).length}</p>
                                    <p className="text-sm text-muted-foreground">Active Providers</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Usage by Feature */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Usage by Feature</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {usage?.byFeature.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full bg-primary" />
                                            <span>{item.feature.replace(/_/g, ' ')}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">{item._sum.tokensUsed.toLocaleString()} tokens</p>
                                            <p className="text-sm text-muted-foreground">{item._count} requests</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
