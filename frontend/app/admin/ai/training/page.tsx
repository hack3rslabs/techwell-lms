"use client"

import * as React from 'react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Sparkles,
    Save,
    Trash2,
    Edit,
    Loader2,
    Brain,
    GraduationCap,
    Rocket,
    BookOpen,
    RefreshCw
} from 'lucide-react'
import api from '@/lib/api'

interface QAItem {
    id: string
    question: string
    domain: string
    role?: string
    beginnerAnswer: string
    mediumAnswer: string
    hardAnswer: string
    status: 'DRAFT' | 'PUBLISHED'
    createdAt: string
}

export default function AIQATrainingPage() {
    const [items, setItems] = useState<QAItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isGenerating, setIsGenerating] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [_editingId, _setEditingId] = useState<string | null>(null)

    const [newQuestion, setNewQuestion] = useState('')
    const [domain, setDomain] = useState('General')
    const [role, setRole] = useState('')

    const [generatedAnswers, setGeneratedAnswers] = useState<{
        beginner: string
        medium: string
        hard: string
    } | null>(null)

    const [activeTab, setActiveTab] = useState('beginner')

    const domains = [
        'General',
        'Frontend Development',
        'Backend Development',
        'Full Stack',
        'DevOps',
        'Data Science',
        'Machine Learning',
        'Cloud Computing',
        'System Design',
        'Database',
        'Security'
    ]

    useEffect(() => {
        fetchItems()
    }, [])

    const fetchItems = async () => {
        try {
            const res = await api.get('/knowledge-base')
            setItems(res.data.entries || [])
        } catch {
            // Mock data
            setItems([{
                id: '1',
                question: 'What is React and why is it popular?',
                domain: 'Frontend Development',
                role: 'React Developer',
                beginnerAnswer: 'React is a JavaScript library for building user interfaces...',
                mediumAnswer: 'React uses a virtual DOM and component-based architecture...',
                hardAnswer: 'React implements a fiber reconciliation algorithm...',
                status: 'PUBLISHED',
                createdAt: new Date().toISOString()
            }])
        } finally {
            setIsLoading(false)
        }
    }

    const handleGenerateAnswers = async () => {
        if (!newQuestion.trim()) {
            alert('Please enter a question')
            return
        }

        setIsGenerating(true)
        setGeneratedAnswers(null)

        try {
            const res = await api.post('/ai/generate-answers', {
                question: newQuestion,
                domain,
                role
            })
            setGeneratedAnswers(res.data.answers)
            setActiveTab('beginner')
        } catch {
            // Mock response
            setGeneratedAnswers({
                beginner: `**Simple Answer:**\n\n${newQuestion}\n\nIn simple terms, this concept is about understanding the basics. Think of it like learning to ride a bicycle - you start with training wheels.\n\n**Key Points:**\n• Start with the fundamentals\n• Practice with simple examples\n• Build confidence gradually`,
                medium: `**Technical Answer:**\n\n${newQuestion}\n\nThis involves understanding both the theory and practical implementation.\n\n**Technical Details:**\n1. Core concepts and how they work together\n2. Common implementation patterns\n3. Real-world code examples\n4. Testing and debugging approaches\n\n**Example:**\n\`\`\`javascript\n// Sample implementation\nfunction example() {\n  return "Hello World";\n}\n\`\`\``,
                hard: `**Expert Answer:**\n\n${newQuestion}\n\n**Deep Dive:**\nAt the advanced level, we need to consider:\n\n1. **Architecture Patterns**\n   - Scalability considerations\n   - Performance optimization\n   - Memory management\n\n2. **Edge Cases**\n   - Error handling strategies\n   - Boundary conditions\n   - Race conditions\n\n3. **Production Best Practices**\n   - Monitoring and logging\n   - Security considerations\n   - CI/CD integration`
            })
            setActiveTab('beginner')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleSaveQA = async () => {
        if (!generatedAnswers) return

        setIsSaving(true)
        try {
            await api.post('/knowledge-base', {
                question: newQuestion,
                domain,
                role,
                beginnerAnswer: generatedAnswers.beginner,
                mediumAnswer: generatedAnswers.medium,
                hardAnswer: generatedAnswers.hard
            })

            // Add to local list
            setItems(prev => [{
                id: Date.now().toString(),
                question: newQuestion,
                domain,
                role,
                beginnerAnswer: generatedAnswers.beginner,
                mediumAnswer: generatedAnswers.medium,
                hardAnswer: generatedAnswers.hard,
                status: 'DRAFT',
                createdAt: new Date().toISOString()
            }, ...prev])

            // Reset form
            setNewQuestion('')
            setGeneratedAnswers(null)
            alert('Q&A saved successfully!')
        } catch {
            alert('Q&A saved (mock)')
            setNewQuestion('')
            setGeneratedAnswers(null)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteItem = async (id: string) => {
        if (!confirm('Delete this Q&A item?')) return
        try {
            await api.delete(`/knowledge-base/${id}`)
            setItems(prev => prev.filter(i => i.id !== id))
        } catch {
            setItems(prev => prev.filter(i => i.id !== id))
        }
    }

    const _getTabIcon = (level: string) => {
        switch (level) {
            case 'beginner': return <GraduationCap className="h-4 w-4" />
            case 'medium': return <BookOpen className="h-4 w-4" />
            case 'hard': return <Rocket className="h-4 w-4" />
            default: return null
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
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Brain className="h-8 w-8 text-primary" />
                    AI Q&A Training
                </h1>
                <p className="text-muted-foreground">Enter a question and let AI generate answers at 3 difficulty levels</p>
            </div>

            {/* Q&A Generator */}
            <Card className="border-primary/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Generate AI Answers
                    </CardTitle>
                    <CardDescription>
                        Enter your question and AI will create Beginner, Medium, and Hard level answers
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="domain">Domain</Label>
                            <select
                                id="domain"
                                title="Select Domain"
                                className="w-full h-10 px-3 rounded-md border bg-background"
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                            >
                                {domains.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Job Role (Optional)</Label>
                            <Input
                                id="role"
                                placeholder="e.g., Frontend Developer"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="question">Question</Label>
                        <Textarea
                            id="question"
                            placeholder="Enter your interview question here... e.g., What is the difference between let, const, and var in JavaScript?"
                            value={newQuestion}
                            onChange={(e) => setNewQuestion(e.target.value)}
                            rows={3}
                            className="resize-none"
                        />
                    </div>

                    <Button
                        onClick={handleGenerateAnswers}
                        disabled={isGenerating || !newQuestion.trim()}
                        className="w-full md:w-auto"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Generating Answers...
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Generate AI Answers
                            </>
                        )}
                    </Button>

                    {/* Generated Answers */}
                    {generatedAnswers && (
                        <div className="mt-6 pt-6 border-t">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-lg">Generated Answers</h3>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={handleGenerateAnswers}>
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Regenerate
                                    </Button>
                                    <Button size="sm" onClick={handleSaveQA} disabled={isSaving}>
                                        {isSaving ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4 mr-2" />
                                        )}
                                        Save Q&A
                                    </Button>
                                </div>
                            </div>

                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsList className="grid grid-cols-3 w-full md:w-auto">
                                    <TabsTrigger value="beginner" className="flex items-center gap-2">
                                        <GraduationCap className="h-4 w-4" />
                                        <span className="hidden sm:inline">Beginner</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="medium" className="flex items-center gap-2">
                                        <BookOpen className="h-4 w-4" />
                                        <span className="hidden sm:inline">Medium</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="hard" className="flex items-center gap-2">
                                        <Rocket className="h-4 w-4" />
                                        <span className="hidden sm:inline">Advanced</span>
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="beginner" className="mt-4">
                                    <Card className="bg-green-50/50 border-green-200">
                                        <CardContent className="pt-4">
                                            <Badge className="mb-3 bg-green-500">Beginner Level</Badge>
                                            <Textarea
                                                value={generatedAnswers.beginner}
                                                onChange={(e) => setGeneratedAnswers({
                                                    ...generatedAnswers,
                                                    beginner: e.target.value
                                                })}
                                                rows={10}
                                                className="bg-white"
                                            />
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="medium" className="mt-4">
                                    <Card className="bg-yellow-50/50 border-yellow-200">
                                        <CardContent className="pt-4">
                                            <Badge className="mb-3 bg-yellow-500">Medium Level</Badge>
                                            <Textarea
                                                value={generatedAnswers.medium}
                                                onChange={(e) => setGeneratedAnswers({
                                                    ...generatedAnswers,
                                                    medium: e.target.value
                                                })}
                                                rows={10}
                                                className="bg-white"
                                            />
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="hard" className="mt-4">
                                    <Card className="bg-red-50/50 border-red-200">
                                        <CardContent className="pt-4">
                                            <Badge className="mb-3 bg-red-500">Advanced Level</Badge>
                                            <Textarea
                                                value={generatedAnswers.hard}
                                                onChange={(e) => setGeneratedAnswers({
                                                    ...generatedAnswers,
                                                    hard: e.target.value
                                                })}
                                                rows={10}
                                                className="bg-white"
                                            />
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Saved Q&A Items */}
            <Card>
                <CardHeader>
                    <CardTitle>Saved Q&A Items</CardTitle>
                    <CardDescription>{items.length} questions with AI-generated answers</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {items.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                No Q&A items yet. Generate your first one above!
                            </p>
                        ) : (
                            items.map((item) => (
                                <Card key={item.id} className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant="outline">{item.domain}</Badge>
                                                {item.role && <Badge variant="secondary">{item.role}</Badge>}
                                                <Badge variant={item.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                                                    {item.status}
                                                </Badge>
                                            </div>
                                            <p className="font-medium">{item.question}</p>
                                            <div className="flex gap-2 mt-2">
                                                <Badge className="bg-green-100 text-green-700">
                                                    <GraduationCap className="h-3 w-3 mr-1" />
                                                    Beginner
                                                </Badge>
                                                <Badge className="bg-yellow-100 text-yellow-700">
                                                    <BookOpen className="h-3 w-3 mr-1" />
                                                    Medium
                                                </Badge>
                                                <Badge className="bg-red-100 text-red-700">
                                                    <Rocket className="h-3 w-3 mr-1" />
                                                    Advanced
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500"
                                                onClick={() => handleDeleteItem(item.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
