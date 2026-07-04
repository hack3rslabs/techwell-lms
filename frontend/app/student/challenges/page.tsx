"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Play, Code2, AlertTriangle, ArrowLeft } from 'lucide-react'
import { AICodeReviewDialog } from '@/components/assessments/AICodeReviewDialog'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'

export default function CodingChallengePage() {
    const router = useRouter()
    const [code, setCode] = useState(`function twoSum(nums, target) {
    // Write your code here
    
}`)
    const [loading, setLoading] = useState(false)
    const [evalData, setEvalData] = useState<any>(null)
    const [dialogOpen, setDialogOpen] = useState(false)

    const problemStatement = `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].`

    const handleEvaluate = async () => {
        setLoading(true)
        try {
            const res = await api.post('/assessments/evaluate', {
                problem: problemStatement,
                code: code,
                language: 'javascript'
            })
            setEvalData(res.data)
            setDialogOpen(true)
        } catch (error) {
            console.error("Evaluation failed", error)
            alert("Failed to evaluate code. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-screen bg-slate-950 text-slate-300">
            {/* Header */}
            <header className="h-14 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" onClick={() => router.push('/dashboard')}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Dashboard
                    </Button>
                    <div className="flex items-center gap-2 text-indigo-400 font-bold">
                        <Code2 className="h-5 w-5" />
                        AI Coding Arena
                    </div>
                </div>
                <div>
                    <Button 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                        onClick={handleEvaluate}
                        disabled={loading}
                    >
                        {loading ? (
                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Evaluating...</>
                        ) : (
                            <><Play className="h-4 w-4 mr-2" /> Submit for AI Review</>
                        )}
                    </Button>
                </div>
            </header>

            {/* Main Split View */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Pane - Problem Description */}
                <div className="w-1/3 border-r border-slate-800 bg-slate-900/50 p-6 overflow-y-auto">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">Easy</span>
                        <h1 className="text-2xl font-bold text-slate-100">1. Two Sum</h1>
                    </div>
                    
                    <div className="prose prose-invert prose-slate max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-sm text-slate-300 leading-relaxed bg-transparent p-0">
                            {problemStatement}
                        </pre>
                    </div>

                    <div className="mt-8 p-4 bg-indigo-950/30 rounded-xl border border-indigo-900/50">
                        <h4 className="flex items-center gap-2 font-semibold text-indigo-300 mb-2">
                            <AlertTriangle className="h-4 w-4 text-amber-400" /> AI Coach Tip
                        </h4>
                        <p className="text-sm text-slate-400">
                            A brute force approach is O(N^2). Can you do it in O(N) time? Think about data structures that offer O(1) lookups.
                        </p>
                    </div>
                </div>

                {/* Right Pane - Editor */}
                <div className="flex-1 flex flex-col bg-[#1e1e1e]">
                    <div className="h-10 bg-[#252526] flex items-center px-4 text-xs font-mono text-slate-400 shrink-0 border-b border-[#333]">
                        solution.js
                    </div>
                    <div className="flex-1 relative">
                        {/* 
                          For a real app, we'd use @monaco-editor/react here. 
                          For this demo, we use a simple textarea styled to look like an editor.
                        */}
                        <textarea
                            className="absolute inset-0 w-full h-full bg-transparent text-slate-300 font-mono text-sm p-4 resize-none focus:outline-none focus:ring-0 leading-relaxed"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            spellCheck={false}
                            style={{ tabSize: 4 }}
                        />
                    </div>
                </div>
            </div>

            <AICodeReviewDialog 
                open={dialogOpen} 
                onOpenChange={setDialogOpen}
                data={evalData}
            />
        </div>
    )
}
