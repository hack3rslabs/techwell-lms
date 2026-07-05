"use client"

import * as React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Wand2, Send, Mail } from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'sonner'

interface Lead {
    id: string
    name: string
    email?: string
}

interface EmailComposerProps {
    lead: Lead | null
    isOpen: boolean
    onClose: () => void
}

export default function EmailComposer({ lead, isOpen, onClose }: EmailComposerProps) {
    const [subject, setSubject] = React.useState('')
    const [body, setBody] = React.useState('')
    const [isGenerating, setIsGenerating] = React.useState(false)
    const [isSending, setIsSending] = React.useState(false)

    // Reset form when dialog opens/closes or lead changes
    React.useEffect(() => {
        if (isOpen && lead) {
            setSubject('')
            setBody('')
        }
    }, [isOpen, lead])

    const handleGenerate = async () => {
        if (!lead) return
        setIsGenerating(true)
        try {
            const res = await api.post(`/leads/${lead.id}/ai/draft-email`, {
                tone: "Professional and Persuasive"
            })
            setSubject(res.data.draft.subject)
            setBody(res.data.draft.body)
            toast.success("Email drafted by AI")
        } catch (error) {
            console.error(error)
            toast.error("Failed to generate draft")
        } finally {
            setIsGenerating(false)
        }
    }

    const handleSend = async () => {
        if (!lead?.email || !subject || !body) {
            toast.error("Missing fields")
            return
        }

        setIsSending(true)
        try {
            await api.post('/ai/send-email', {
                to: lead.email,
                subject,
                body
            })
            toast.success("Email sent successfully!")
            onClose()
        } catch (error) {
            console.error(error)
            toast.error("Failed to send email")
        } finally {
            setIsSending(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-purple-600" />
                        Email to {lead?.name}
                    </DialogTitle>
                    <DialogDescription>
                        Draft a personalized email or let AI write it for you.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Input
                            id="to"
                            disabled
                            value={lead?.email || 'No email provided'}
                            className="col-span-4 bg-muted"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Subject Line"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="flex-1"
                        />
                        <Button
                            variant="outline"
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="border-purple-200 hover:bg-purple-50 text-purple-700"
                        >
                            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
                            AI Draft
                        </Button>
                    </div>
                    <Textarea
                        placeholder="Write your email here..."
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        className="h-[300px] font-mono text-sm"
                    />
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSend} disabled={isSending || !lead?.email}>
                        {isSending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                        Send Email
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
