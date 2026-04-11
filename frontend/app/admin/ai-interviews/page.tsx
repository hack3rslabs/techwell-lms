"use client"

import * as React from 'react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Users,
    MessageSquare,
    Settings,
    Save,
    Sliders,
    Zap,
    Target
} from 'lucide-react'
import Link from 'next/link'

export default function AIInterviewsPage() {
    const [settings, setSettings] = useState({
        adaptiveDifficulty: true,
        escalationThreshold: 75,
        initialDifficulty: 'INTERMEDIATE',
        maxQuestions: 10,
        hrQuestionRatio: 3, // Every Nth question is HR
    })

    const [_isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        try {
            setIsLoading(true)
            const { aiSettingsApi } = await import('@/lib/api') // Dynamic import to avoid circular dep if any
            const res = await aiSettingsApi.get()
            setSettings(res.data)
        } catch (error) {
            console.error('Failed to load settings:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            const { aiSettingsApi } = await import('@/lib/api')
            await aiSettingsApi.update(settings)
            alert('Settings saved successfully!')
        } catch (error) {
            console.error('Failed to save settings:', error)
            alert('Failed to save settings')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">AI Interview Settings</h1>
                    <p className="text-muted-foreground">Configure adaptive AI interview behavior and parameters.</p>
                </div>
                <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                </Button>
            </div>

            {/* Quick Links to Sub-pages */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/admin/ai-interviews/avatars">
                    <Card className="cursor-pointer hover:border-primary transition-colors">
                        <CardHeader className="pb-2">
                            <Users className="h-8 w-8 text-primary mb-2" />
                            <CardTitle className="text-lg">AI Avatars</CardTitle>
                            <CardDescription>Manage interviewer personas</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
                <Link href="/admin/ai-interviews/questions">
                    <Card className="cursor-pointer hover:border-primary transition-colors">
                        <CardHeader className="pb-2">
                            <MessageSquare className="h-8 w-8 text-primary mb-2" />
                            <CardTitle className="text-lg">Q&A Training</CardTitle>
                            <CardDescription>Train AI knowledge base</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
                <Card className="border-primary/50 bg-primary/5">
                    <CardHeader className="pb-2">
                        <Settings className="h-8 w-8 text-primary mb-2" />
                        <CardTitle className="text-lg">Settings</CardTitle>
                        <CardDescription>Current page - Configure AI</CardDescription>
                    </CardHeader>
                </Card>
            </div>

            {/* Settings Tabs */}
            <Tabs defaultValue="adaptive" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-md">
                    <TabsTrigger value="adaptive">
                        <Zap className="h-4 w-4 mr-2" />
                        Adaptive
                    </TabsTrigger>
                    <TabsTrigger value="difficulty">
                        <Target className="h-4 w-4 mr-2" />
                        Difficulty
                    </TabsTrigger>
                    <TabsTrigger value="behavior">
                        <Sliders className="h-4 w-4 mr-2" />
                        Behavior
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="adaptive" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Adaptive Difficulty</CardTitle>
                            <CardDescription>
                                Configure how the AI adjusts question difficulty based on user performance.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-base">Enable Adaptive Difficulty</Label>
                                    <p className="text-sm text-muted-foreground">
                                        AI will increase/decrease difficulty based on responses
                                    </p>
                                </div>
                                <Button
                                    variant={settings.adaptiveDifficulty ? "default" : "outline"}
                                    onClick={() => setSettings(s => ({ ...s, adaptiveDifficulty: !s.adaptiveDifficulty }))}
                                >
                                    {settings.adaptiveDifficulty ? "Enabled" : "Disabled"}
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <Label>Escalation Threshold (%)</Label>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Score above which difficulty increases
                                </p>
                                <Input
                                    type="number"
                                    value={settings.escalationThreshold}
                                    onChange={(e) => setSettings(s => ({ ...s, escalationThreshold: Number(e.target.value) }))}
                                    min={50}
                                    max={100}
                                    className="max-w-xs"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="difficulty" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Default Difficulty</CardTitle>
                            <CardDescription>
                                Set the starting difficulty level for new interviews.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                {['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map(level => (
                                    <Button
                                        key={level}
                                        variant={settings.initialDifficulty === level ? "default" : "outline"}
                                        onClick={() => setSettings(s => ({ ...s, initialDifficulty: level }))}
                                    >
                                        {level}
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="behavior" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Interview Behavior</CardTitle>
                            <CardDescription>
                                Configure how interviews are conducted.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Maximum Questions per Interview</Label>
                                <Input
                                    type="number"
                                    value={settings.maxQuestions}
                                    onChange={(e) => setSettings(s => ({ ...s, maxQuestions: Number(e.target.value) }))}
                                    min={5}
                                    max={20}
                                    className="max-w-xs"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>HR Question Frequency</Label>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Every Nth question will be HR/behavioral
                                </p>
                                <Input
                                    type="number"
                                    value={settings.hrQuestionRatio}
                                    onChange={(e) => setSettings(s => ({ ...s, hrQuestionRatio: Number(e.target.value) }))}
                                    min={2}
                                    max={10}
                                    className="max-w-xs"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
