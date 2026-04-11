"use client"

import * as React from 'react'
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Plus,
    Edit,
    Trash2,
    ArrowLeft,
    Search,
    BookOpen,
    BrainCircuit
} from 'lucide-react'
import Link from 'next/link'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

interface KnowledgeEntry {
    id: string
    domain: string
    topic: string
    content: string
    answer?: string
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
    type?: 'TECHNICAL' | 'BEHAVIORAL' | 'HR' | 'CODING'
    codeSnippet?: string
    tags?: string[]
    createdAt: string
}

const _SAMPLE_ENTRIES: KnowledgeEntry[] = [
    {
        id: '1',
        domain: 'IT',
        topic: 'JavaScript Closures',
        content: 'Explain what closures are in JavaScript and provide an example of their practical use.',
        answer: 'A closure is the combination of a function bundled together (enclosed) with references to its surrounding state (the lexical environment).',
        difficulty: 'INTERMEDIATE',
        type: 'TECHNICAL',
        createdAt: new Date().toISOString()
    }
]

export default function QuestionsPage() {
    const [entries, setEntries] = useState<KnowledgeEntry[]>([])
    const [_isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingEntry, setEditingEntry] = useState<KnowledgeEntry | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterDomain, setFilterDomain] = useState<string>('all')
    const [filterDifficulty, setFilterDifficulty] = useState<string>('all')

    const [formData, setFormData] = useState<{
        domain: string
        topic: string
        content: string
        answer: string
        difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
        type: 'TECHNICAL' | 'BEHAVIORAL' | 'HR' | 'CODING'
        codeSnippet: string
        tags: string
    }>({
        domain: 'IT',
        topic: '',
        content: '',
        answer: '',
        difficulty: 'INTERMEDIATE',
        type: 'TECHNICAL',
        codeSnippet: '',
        tags: ''
    })

    const fetchEntries = useCallback(async () => {
        try {
            setIsLoading(true)
            const { knowledgeBaseApi } = await import('@/lib/api')
            const res = await knowledgeBaseApi.getAll({
                domain: filterDomain !== 'all' ? filterDomain : undefined,
                difficulty: filterDifficulty !== 'all' ? filterDifficulty : undefined,
                search: searchQuery || undefined
            })
            setEntries(res.data.entries)
        } catch (error) {
            console.error('Failed to fetch entries:', error)
        } finally {
            setIsLoading(false)
        }
    }, [filterDomain, filterDifficulty, searchQuery])

    useEffect(() => {
        fetchEntries()
    }, [fetchEntries]) // Re-fetch when filters change (or use client-side filtering)

    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedQuestions, setGeneratedQuestions] = useState<{ topic: string, content: string, answer: string }[]>([])
    const [isAiDialogOpen, setIsAiDialogOpen] = useState(false)
    const [aiParams, setAiParams] = useState({
        domain: 'IT',
        role: 'Frontend Developer',
        difficulty: 'INTERMEDIATE',
        count: 5,
        company: ''
    })

    const [_activeTab, setActiveTab] = useState('manual')
    const [jdText, setJdText] = useState('')

    const handleGenerate = async () => {
        setIsGenerating(true)
        try {
            const { knowledgeBaseApi } = await import('@/lib/api')
            const res = await knowledgeBaseApi.generate(aiParams)
            setGeneratedQuestions(res.data.questions || [])
        } catch (error) {
            console.error('Generation failed:', error)
            alert('Failed to generate questions')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleGenerateFromJD = async () => {
        if (!jdText.trim()) return;
        setIsGenerating(true)
        try {
            const { knowledgeBaseApi } = await import('@/lib/api')
            const res = await knowledgeBaseApi.generateFromContext({
                context: jdText,
                domain: aiParams.domain,
                role: aiParams.role,
                difficulty: aiParams.difficulty,
                count: aiParams.count
            })
            setGeneratedQuestions(res.data.questions || [])
        } catch (error) {
            console.error('JD Generation failed:', error)
            alert('Failed to generate from text')
        } finally {
            setIsGenerating(false)
        }
    }

    const saveGeneratedQuestion = async (q: { topic: string, content: string, answer: string }, index: number) => {
        try {
            const { knowledgeBaseApi } = await import('@/lib/api')
            await knowledgeBaseApi.create({
                domain: aiParams.domain,
                topic: q.topic || '',
                content: q.content || '',
                difficulty: aiParams.difficulty as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
                answer: q.answer || ''
            })
            // Remove from list
            setGeneratedQuestions(prev => prev.filter((_, i) => i !== index))
            fetchEntries()
        } catch (error) {
            console.error('Failed to save generated question:', error)
        }
    }

    const handleSubmit = async () => {
        try {
            const { knowledgeBaseApi } = await import('@/lib/api')
            if (editingEntry) {
                await knowledgeBaseApi.update(editingEntry.id, formData)
            } else {
                await knowledgeBaseApi.create(formData)
            }
            fetchEntries() // Refresh list
            setIsDialogOpen(false)
            setEditingEntry(null)
            setFormData({
                domain: 'IT',
                topic: '',
                content: '',
                answer: '',
                difficulty: 'INTERMEDIATE',
                type: 'TECHNICAL',
                codeSnippet: '',
                tags: ''
            })
        } catch (error) {
            console.error('Failed to save entry:', error)
            alert('Failed to save entry')
        }
    }

    const handleEdit = (entry: KnowledgeEntry) => {
        setEditingEntry(entry)
        setFormData({
            domain: entry.domain,
            topic: entry.topic,
            content: entry.content,
            answer: entry.answer || '',
            difficulty: entry.difficulty,
            type: entry.type || 'TECHNICAL',
            codeSnippet: entry.codeSnippet || '',
            tags: Array.isArray(entry.tags) ? entry.tags.join(', ') : (entry.tags || '')
        })
        setIsDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this Q&A entry?')) {
            try {
                const { knowledgeBaseApi } = await import('@/lib/api')
                await knowledgeBaseApi.delete(id)
                fetchEntries()
            } catch (error) {
                console.error('Failed to delete entry:', error)
            }
        }
    }

    // Client-side filtering is redundant if API handles it, but kept for speed if small dataset
    // We already fetch filtered data, so we can just use 'entries'
    const filteredEntries = entries;


    // Bulk Management
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredEntries.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(filteredEntries.map(e => e.id)))
        }
    }

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds)
        if (newSelected.has(id)) {
            newSelected.delete(id)
        } else {
            newSelected.add(id)
        }
        setSelectedIds(newSelected)
    }

    // Reset selection when entries change
    useEffect(() => {
        setSelectedIds(new Set())
    }, [filterDomain, filterDifficulty, searchQuery])


    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedIds.size} entries?`)) return;

        try {
            const { knowledgeBaseApi } = await import('@/lib/api')
            await knowledgeBaseApi.bulkDelete(Array.from(selectedIds))
            setSelectedIds(new Set())
            fetchEntries()
        } catch (error) {
            console.error('Bulk delete failed:', error)
            alert('Failed to delete entries')
        }
    }

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'BEGINNER': return 'bg-green-100 text-green-800'
            case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800'
            case 'ADVANCED': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/ai-interviews">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Q&A Training</h1>
                        <p className="text-muted-foreground">Train AI with domain-specific questions and knowledge.</p>
                    </div>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => {
                            setEditingEntry(null);
                            setFormData({
                                domain: 'IT',
                                topic: '',
                                content: '',
                                answer: '',
                                difficulty: 'INTERMEDIATE',
                                type: 'TECHNICAL',
                                codeSnippet: '',
                                tags: ''
                            })
                        }}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Q&A Entry
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[525px]">
                        <DialogHeader>
                            <DialogTitle>{editingEntry ? 'Edit Q&A Entry' : 'Add New Q&A Entry'}</DialogTitle>
                            <DialogDescription>
                                Add knowledge to train the AI interviewer.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="domain">Domain</Label>
                                    <Select
                                        value={formData.domain}
                                        onValueChange={(value) => setFormData(f => ({ ...f, domain: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select domain" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="IT">IT / Software</SelectItem>
                                            <SelectItem value="Finance">Finance</SelectItem>
                                            <SelectItem value="Marketing">Marketing</SelectItem>
                                            <SelectItem value="HR">HR / Behavioral</SelectItem>
                                            <SelectItem value="General">General</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="type">Question Type</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(value: string) => setFormData(f => ({ ...f, type: value as 'TECHNICAL' | 'BEHAVIORAL' | 'HR' | 'CODING' }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="TECHNICAL">Technical</SelectItem>
                                            <SelectItem value="BEHAVIORAL">Behavioral</SelectItem>
                                            <SelectItem value="HR">HR</SelectItem>
                                            <SelectItem value="CODING">Coding Challenge</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="difficulty">Difficulty</Label>
                                    <Select
                                        value={formData.difficulty}
                                        onValueChange={(value: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED') => setFormData(f => ({ ...f, difficulty: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select difficulty" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="BEGINNER">Beginner</SelectItem>
                                            <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                                            <SelectItem value="ADVANCED">Advanced</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="topic">Topic</Label>
                                    <Input
                                        id="topic"
                                        value={formData.topic}
                                        onChange={(e) => setFormData(f => ({ ...f, topic: e.target.value }))}
                                        placeholder="e.g., JavaScript Closures"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="content">Question / Content</Label>
                                <Textarea
                                    id="content"
                                    value={formData.content}
                                    onChange={(e) => setFormData(f => ({ ...f, content: e.target.value }))}
                                    placeholder="Enter the interview question..."
                                    rows={3}
                                />
                            </div>

                            {formData.type === 'CODING' && (
                                <div className="grid gap-2">
                                    <Label htmlFor="codeSnippet">Starting Code / Snippet</Label>
                                    <Textarea
                                        id="codeSnippet"
                                        value={formData.codeSnippet}
                                        onChange={(e) => setFormData(f => ({ ...f, codeSnippet: e.target.value }))}
                                        placeholder="function example() { ... }"
                                        className="font-mono text-sm"
                                        rows={4}
                                    />
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor="answer">Ideal Answer / Key Points</Label>
                                <Textarea
                                    id="answer"
                                    value={formData.answer}
                                    onChange={(e) => setFormData(f => ({ ...f, answer: e.target.value }))}
                                    placeholder="Key points or full answer used for scoring..."
                                    rows={4}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="tags">Tags (Comma separated)</Label>
                                <Input
                                    id="tags"
                                    value={formData.tags}
                                    onChange={(e) => setFormData(f => ({ ...f, tags: e.target.value }))}
                                    placeholder="react, hooks, basics"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSubmit} disabled={!formData.topic || !formData.content}>
                                {editingEntry ? 'Update' : 'Add to Knowledge Base'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* AI Generator Modal */}
                <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="ml-2 gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10">
                            <BookOpen className="h-4 w-4 text-purple-600" />
                            Generate with AI
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>AI Question Generator</DialogTitle>
                            <DialogDescription>
                                Auto-generate interview questions based on your criteria.
                            </DialogDescription>
                        </DialogHeader>

                        {!generatedQuestions.length ? (
                            <div className="py-4">
                                <Tabs defaultValue="manual" className="w-full" onValueChange={setActiveTab}>
                                    <TabsList className="grid w-full grid-cols-2 mb-4">
                                        <TabsTrigger value="manual">Parameters</TabsTrigger>
                                        <TabsTrigger value="jd">From Job Description (JD)</TabsTrigger>
                                    </TabsList>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="space-y-2">
                                            <Label>Domain</Label>
                                            <Select value={aiParams.domain} onValueChange={v => setAiParams(p => ({ ...p, domain: v }))}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="IT">IT / Software</SelectItem>
                                                    <SelectItem value="Finance">Finance</SelectItem>
                                                    <SelectItem value="Marketing">Marketing</SelectItem>
                                                    <SelectItem value="HR">HR</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Difficulty</Label>
                                            <Select value={aiParams.difficulty} onValueChange={v => setAiParams(p => ({ ...p, difficulty: v }))}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                                                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                                                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="space-y-2">
                                            <Label>Role / Job Title</Label>
                                            <Input
                                                value={aiParams.role}
                                                onChange={e => setAiParams(p => ({ ...p, role: e.target.value }))}
                                                placeholder="e.g. Senior React Dev"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Number of Questions</Label>
                                            <Select value={String(aiParams.count)} onValueChange={v => setAiParams(p => ({ ...p, count: Number(v) }))}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="3">3 Questions</SelectItem>
                                                    <SelectItem value="5">5 Questions</SelectItem>
                                                    <SelectItem value="10">10 Questions</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>


                                    <TabsContent value="manual">
                                        <div className="space-y-2 mb-4">
                                            <Label>Company Context (Optional)</Label>
                                            <Input
                                                value={aiParams.company}
                                                onChange={e => setAiParams(p => ({ ...p, company: e.target.value }))}
                                                placeholder="e.g. Google, Startup"
                                            />
                                        </div>
                                        <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
                                            {isGenerating ? <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <BookOpen className="mr-2 h-4 w-4" />}
                                            Generate Questions
                                        </Button>
                                    </TabsContent>

                                    <TabsContent value="jd">
                                        <div className="space-y-2 mb-4">
                                            <Label>Job Description / Context Text</Label>
                                            <Textarea
                                                value={jdText}
                                                onChange={(e) => setJdText(e.target.value)}
                                                placeholder="Paste Job Description, Resume, or specific topic text here..."
                                                className="min-h-[150px]"
                                            />
                                            <p className="text-xs text-muted-foreground">The AI will extract key requirements and generate relevant questions.</p>
                                        </div>
                                        <Button onClick={handleGenerateFromJD} disabled={isGenerating || !jdText.trim()} className="w-full">
                                            {isGenerating ? <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
                                            Generate from Context
                                        </Button>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold text-lg">{generatedQuestions.length} Questions Generated</h3>
                                    <Button variant="ghost" size="sm" onClick={() => setGeneratedQuestions([])}>Reset</Button>
                                </div>
                                <div className="space-y-4">
                                    {generatedQuestions.map((q, i) => (
                                        <Card key={i} className="bg-muted/30">
                                            <CardHeader className="pb-2">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <CardTitle className="text-base font-medium">{q.topic}</CardTitle>
                                                        <CardDescription className="text-xs mt-1">{aiParams.difficulty}</CardDescription>
                                                    </div>
                                                    <Button size="sm" onClick={() => saveGeneratedQuestion(q, i)}>Save</Button>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="text-sm space-y-2">
                                                <p className="font-medium">{q.content}</p>
                                                <div className="bg-background p-2 rounded text-muted-foreground text-xs">
                                                    <span className="font-semibold text-primary">Ideal Answer: </span>
                                                    {q.answer}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{entries.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Beginner</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {entries.filter(e => e.difficulty === 'BEGINNER').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Intermediate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                            {entries.filter(e => e.difficulty === 'INTERMEDIATE').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Advanced</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {entries.filter(e => e.difficulty === 'ADVANCED').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bulk Action Bar */}
            {selectedIds.size > 0 && (
                <div className="bg-muted p-4 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center gap-4">
                        <span className="font-medium">{selectedIds.size} selected</span>
                        <Button variant="outline" size="sm" onClick={() => setSelectedIds(new Set())}>
                            Cancel
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Future: Add Bulk Update Difficulty/Domain here */}
                        <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Selected
                        </Button>
                    </div>
                </div>
            )}

            {/* Filters */}
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search topics or content..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={filterDomain} onValueChange={setFilterDomain}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Domain" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Domains</SelectItem>
                                <SelectItem value="IT">IT / Software</SelectItem>
                                <SelectItem value="Finance">Finance</SelectItem>
                                <SelectItem value="Marketing">Marketing</SelectItem>
                                <SelectItem value="HR">HR</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Levels</SelectItem>
                                <SelectItem value="BEGINNER">Beginner</SelectItem>
                                <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                                <SelectItem value="ADVANCED">Advanced</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300"
                                        checked={filteredEntries.length > 0 && selectedIds.size === filteredEntries.length}
                                        onChange={toggleSelectAll}
                                    />
                                </TableHead>
                                <TableHead>Topic</TableHead>
                                <TableHead>Domain</TableHead>
                                <TableHead>Difficulty</TableHead>
                                <TableHead className="max-w-[300px]">Content</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredEntries.map((entry) => (
                                <TableRow key={entry.id} data-state={selectedIds.has(entry.id) && "selected"}>
                                    <TableCell>
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300"
                                            checked={selectedIds.has(entry.id)}
                                            onChange={() => toggleSelect(entry.id)}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{entry.topic}</TableCell>
                                    <TableCell>{entry.domain}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(entry.difficulty)}`}>
                                            {entry.difficulty}
                                        </span>
                                    </TableCell>
                                    <TableCell className="max-w-[300px] truncate">{entry.content}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(entry)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredEntries.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        No entries found. Add some Q&A to train the AI.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
