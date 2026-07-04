"use client"

import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, Clock, Database, AlertTriangle, Lightbulb } from 'lucide-react'

interface AICodeReviewDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    data: {
        score: number
        passed: boolean
        feedback: string
        timeComplexity: string
        spaceComplexity: string
        suggestions: string[]
    } | null
}

export function AICodeReviewDialog({ open, onOpenChange, data }: AICodeReviewDialogProps) {
    if (!data) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-slate-900 border-slate-800 text-slate-100">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        {data.passed ? (
                            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                        ) : (
                            <XCircle className="h-8 w-8 text-rose-500" />
                        )}
                        AI Code Evaluation
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Our AI has analyzed your code for correctness and performance.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-3 gap-4 my-6">
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center text-center">
                        <span className="text-sm text-slate-400 mb-1">Score</span>
                        <span className={`text-3xl font-black ${data.score >= 80 ? 'text-emerald-400' : data.score >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                            {data.score}/100
                        </span>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center text-center">
                        <Clock className="h-5 w-5 text-indigo-400 mb-2" />
                        <span className="text-sm text-slate-400 mb-1">Time</span>
                        <span className="text-lg font-bold text-slate-200">{data.timeComplexity}</span>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center text-center">
                        <Database className="h-5 w-5 text-indigo-400 mb-2" />
                        <span className="text-sm text-slate-400 mb-1">Space</span>
                        <span className="text-lg font-bold text-slate-200">{data.spaceComplexity}</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                        <h4 className="flex items-center gap-2 font-semibold text-slate-200 mb-2">
                            <AlertTriangle className="h-4 w-4 text-amber-400" /> Feedback
                        </h4>
                        <p className="text-slate-300 text-sm leading-relaxed">
                            {data.feedback}
                        </p>
                    </div>

                    {data.suggestions && data.suggestions.length > 0 && (
                        <div className="bg-indigo-950/30 p-4 rounded-xl border border-indigo-900/50">
                            <h4 className="flex items-center gap-2 font-semibold text-indigo-300 mb-2">
                                <Lightbulb className="h-4 w-4 text-amber-300" /> Optimization Suggestions
                            </h4>
                            <ul className="list-disc pl-5 space-y-1">
                                {data.suggestions.map((s, i) => (
                                    <li key={i} className="text-slate-300 text-sm">{s}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <DialogFooter className="mt-6">
                    <Button onClick={() => onOpenChange(false)} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white">
                        Got it, thanks!
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
