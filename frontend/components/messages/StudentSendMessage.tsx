import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import api from '@/lib/api'

export function StudentSendMessage() {
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')

    const handleSend = async () => {
        setLoading(true)
        setError('')
        setSuccess('')
        try {
            await api.post('/messages/send-to-admin', { title, content })
            setSuccess('Message sent to admin successfully!')
            setTitle('')
            setContent('')
        } catch (err) {
            setError('Failed to send message. Please try again later.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="my-6">
            <CardHeader>
                <CardTitle>Contact Admin</CardTitle>
                <CardDescription>Send a message to the superadmin</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <Textarea
                        placeholder="Title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="mb-2"
                    />
                    <Textarea
                        placeholder="Your message"
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        rows={4}
                    />
                    {error && <div className="text-red-500 text-sm">{error}</div>}
                    {success && <div className="text-green-600 text-sm">{success}</div>}
                    <Button onClick={handleSend} disabled={loading || !title || !content}>
                        {loading ? 'Sending...' : 'Send Message'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
