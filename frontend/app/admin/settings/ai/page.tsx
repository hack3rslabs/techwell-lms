"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Loader2, Bot, BrainCircuit, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react'
import api from '@/lib/api'

interface AIProvider {
    id: string
    provider: string
    name: string
    apiKey: string
    model: string
    isDefault: boolean
    isActive: boolean
}

export default function AIManagerPage() {
    const [providers, setProviders] = useState<AIProvider[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [openaiKey, setOpenaiKey] = useState('')
    const [openaiModel, setOpenaiModel] = useState('gpt-4-turbo')
    const [geminiKey, setGeminiKey] = useState('')
    const [geminiModel, setGeminiModel] = useState('gemini-1.5-pro')

    const fetchProviders = async () => {
        try {
            const res = await api.get('/admin/ai-management/providers')
            const data: AIProvider[] = res.data
            setProviders(data)
            
            const openai = data.find(p => p.provider === 'OPENAI')
            if (openai) {
                setOpenaiKey(openai.apiKey)
                setOpenaiModel(openai.model)
            }
            
            const gemini = data.find(p => p.provider === 'GEMINI')
            if (gemini) {
                setGeminiKey(gemini.apiKey)
                setGeminiModel(gemini.model)
            }
        } catch (error) {
            console.error('Failed to load AI providers', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchProviders()
    }, [])

    const handleSaveOpenAI = async () => {
        setIsSaving(true)
        try {
            await api.post('/admin/ai-management/providers', {
                provider: 'OPENAI',
                name: 'OpenAI (GPT-4)',
                apiKey: openaiKey,
                model: openaiModel,
                isActive: true,
                isDefault: false
            })
            alert('OpenAI settings saved successfully')
            fetchProviders()
        } catch (error) {
            alert('Failed to save OpenAI settings')
        } finally {
            setIsSaving(false)
        }
    }

    const handleSaveGemini = async () => {
        setIsSaving(true)
        try {
            await api.post('/admin/ai-management/providers', {
                provider: 'GEMINI',
                name: 'Google Gemini',
                apiKey: geminiKey,
                model: geminiModel,
                isActive: true,
                isDefault: false
            })
            alert('Gemini settings saved successfully')
            fetchProviders()
        } catch (error) {
            alert('Failed to save Gemini settings')
        } finally {
            setIsSaving(false)
        }
    }

    const handleSetDefault = async (id: string) => {
        try {
            await api.patch(`/admin/ai-management/providers/${id}/toggle`)
            fetchProviders()
        } catch (error) {
            alert('Failed to update active provider')
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const activeProvider = providers.find(p => p.isDefault)

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">AI & Smart Management</h1>
                <p className="text-muted-foreground mt-2">
                    Configure your platform's AI models, API keys, and enable smart application features.
                </p>
            </div>

            {activeProvider ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-4">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                    <div>
                        <h3 className="font-semibold text-green-900">Active AI System: {activeProvider.name}</h3>
                        <p className="text-sm text-green-700">All AI operations are currently routed through the {activeProvider.model} model.</p>
                    </div>
                </div>
            ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-4">
                    <ShieldAlert className="h-6 w-6 text-yellow-600" />
                    <div>
                        <h3 className="font-semibold text-yellow-900">No Default Provider Selected</h3>
                        <p className="text-sm text-yellow-700">The system will fall back to environment variables. Please set a default provider below.</p>
                    </div>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                {/* OpenAI Card */}
                <Card className="border-t-4 border-t-primary shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <BrainCircuit className="h-5 w-5 text-primary" />
                            <CardTitle>OpenAI Configuration</CardTitle>
                        </div>
                        <CardDescription>Configure GPT-4 Turbo or GPT-3.5 models.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>API Key</Label>
                            <Input 
                                type="password" 
                                placeholder="sk-..." 
                                value={openaiKey}
                                onChange={(e) => setOpenaiKey(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Model</Label>
                            <select 
                                className="w-full border rounded-md p-2 bg-background text-sm"
                                value={openaiModel}
                                onChange={(e) => setOpenaiModel(e.target.value)}
                            >
                                <option value="gpt-4-turbo">GPT-4 Turbo (Recommended)</option>
                                <option value="gpt-4o">GPT-4o</option>
                                <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Fast)</option>
                            </select>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t bg-muted/20 px-6 py-4">
                        <Button variant="outline" onClick={handleSaveOpenAI} disabled={isSaving}>
                            Save Config
                        </Button>
                        {providers.find(p => p.provider === 'OPENAI') && (
                            <Button 
                                variant={providers.find(p => p.provider === 'OPENAI')?.isDefault ? "secondary" : "default"}
                                onClick={() => handleSetDefault(providers.find(p => p.provider === 'OPENAI')!.id)}
                                disabled={providers.find(p => p.provider === 'OPENAI')?.isDefault}
                            >
                                {providers.find(p => p.provider === 'OPENAI')?.isDefault ? 'Currently Active' : 'Set as Active'}
                            </Button>
                        )}
                    </CardFooter>
                </Card>

                {/* Gemini Card */}
                <Card className="border-t-4 border-t-blue-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Bot className="h-5 w-5 text-blue-500" />
                            <CardTitle>Google Gemini</CardTitle>
                        </div>
                        <CardDescription>Configure Gemini Pro and Flash models.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>API Key</Label>
                            <Input 
                                type="password" 
                                placeholder="AIzaSy..." 
                                value={geminiKey}
                                onChange={(e) => setGeminiKey(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Model</Label>
                            <select 
                                className="w-full border rounded-md p-2 bg-background text-sm"
                                value={geminiModel}
                                onChange={(e) => setGeminiModel(e.target.value)}
                            >
                                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast)</option>
                            </select>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t bg-muted/20 px-6 py-4">
                        <Button variant="outline" onClick={handleSaveGemini} disabled={isSaving}>
                            Save Config
                        </Button>
                        {providers.find(p => p.provider === 'GEMINI') && (
                            <Button 
                                variant={providers.find(p => p.provider === 'GEMINI')?.isDefault ? "secondary" : "default"}
                                onClick={() => handleSetDefault(providers.find(p => p.provider === 'GEMINI')!.id)}
                                disabled={providers.find(p => p.provider === 'GEMINI')?.isDefault}
                            >
                                {providers.find(p => p.provider === 'GEMINI')?.isDefault ? 'Currently Active' : 'Set as Active'}
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>

            {/* Smart Management AI Skills Matrix */}
            <Card className="mt-8 shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-amber-500" />
                        <CardTitle>AI Skills & Smart Features</CardTitle>
                    </div>
                    <CardDescription>Toggle specific AI capabilities across the platform. Disabling features will revert them to standard manual workflows.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/50 transition-colors">
                            <div className="space-y-1">
                                <h4 className="font-semibold">AI Mock Interviews</h4>
                                <p className="text-sm text-muted-foreground">Enable dynamic AI-driven technical and HR interviews with real-time scoring.</p>
                            </div>
                            <Switch checked={true} />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/50 transition-colors">
                            <div className="space-y-1">
                                <h4 className="font-semibold">Smart Resume Analyzer</h4>
                                <p className="text-sm text-muted-foreground">Automatically parse resumes, calculate ATS scores, and suggest improvements.</p>
                            </div>
                            <Switch checked={true} />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/50 transition-colors">
                            <div className="space-y-1">
                                <h4 className="font-semibold">AI Course Generator</h4>
                                <p className="text-sm text-muted-foreground">Allow instructors to generate full course structures, modules, and quizzes instantly.</p>
                            </div>
                            <Switch checked={true} />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/50 transition-colors">
                            <div className="space-y-1">
                                <h4 className="font-semibold">Behavioral Intent Engine</h4>
                                <p className="text-sm text-muted-foreground">Analyze student actions in the background to suggest personalized next-best actions.</p>
                            </div>
                            <Switch checked={true} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
