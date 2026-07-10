"use client"

import React, { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Plus, Sparkles, Trash2 } from 'lucide-react'
import api from '@/lib/api'

interface QuizBuilderDialogProps {
    lessonId: string | null
    onClose: () => void
}

interface Quiz {
    id: string
    question: string
    options: string[]
    correctAnswer: string
    explanation: string
}

export function QuizBuilderDialog({ lessonId, onClose }: QuizBuilderDialogProps) {
    const [quizzes, setQuizzes] = useState<Quiz[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [topic, setTopic] = useState('')
    const [count, setCount] = useState(5)

    const fetchQuizzes = async () => {
        try {
            setIsLoading(true)
            const res = await api.get(`/quizzes/lesson/${lessonId}`)
            setQuizzes(res.data || [])
        } catch (error) {
            console.error('Failed to fetch quizzes:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (lessonId) {
            fetchQuizzes()
        }
    }, [lessonId])

    const handleGenerate = async () => {
        if (!topic) return alert('Please enter a topic for AI generation')
        try {
            setIsGenerating(true)
            const res = await api.post('/quizzes/generate', {
                lessonId,
                topic,
                count
            })
            if (res.data.generated) {
                setQuizzes([...quizzes, ...res.data.generated])
                setTopic('')
            }
        } catch (error) {
            console.error('Generation failed:', error)
            alert('Failed to generate quizzes')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleDelete = async (quizId: string) => {
        try {
            await api.delete(`/quizzes/${quizId}`)
            setQuizzes(quizzes.filter(q => q.id !== quizId))
        } catch (error) {
            console.error('Failed to delete quiz:', error)
            alert('Failed to delete quiz')
        }
    }

    return (
        <Dialog open={!!lessonId} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Manage Quiz Questions</DialogTitle>
                    <DialogDescription>
                        Generate questions using AI or add them manually.
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        AI Quiz Generator
                    </h3>
                    <div className="flex gap-3">
                        <Input 
                            placeholder="Topic (e.g. React Hooks, Node.js Basics)" 
                            value={topic} 
                            onChange={(e) => setTopic(e.target.value)}
                            className="flex-1"
                        />
                        <Input 
                            type="number" 
                            min="1" max="10" 
                            value={count} 
                            onChange={(e) => setCount(Number(e.target.value))}
                            className="w-20"
                        />
                        <Button onClick={handleGenerate} disabled={isGenerating || !topic}>
                            {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                            Generate
                        </Button>
                    </div>
                </div>

                <div className="space-y-6 mt-6">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">Existing Questions ({quizzes.length})</h3>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : quizzes.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                            No questions added yet. Use the AI generator above to get started!
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {quizzes.map((quiz, idx) => (
                                <div key={quiz.id} className="border rounded-lg p-4 bg-card relative group">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="absolute top-2 right-2 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleDelete(quiz.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                    <div className="font-medium text-sm mb-3 pr-8">
                                        {idx + 1}. {quiz.question}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 pl-4">
                                        {quiz.options.map((opt, oIdx) => (
                                            <div 
                                                key={oIdx} 
                                                className={`text-xs p-2 rounded border ${opt === quiz.correctAnswer ? 'bg-green-100 dark:bg-green-900/30 border-green-500' : 'bg-muted'}`}
                                            >
                                                {opt}
                                            </div>
                                        ))}
                                    </div>
                                    {quiz.explanation && (
                                        <div className="text-xs text-muted-foreground bg-secondary/20 p-2 rounded">
                                            <strong>Explanation:</strong> {quiz.explanation}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
