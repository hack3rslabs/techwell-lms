"use client"

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Edit2, Trash2, Link as LinkIcon, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function LeadGenForms() {
    const [forms, setForms] = React.useState<any[]>([])
    const [isOpen, setIsOpen] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)
    const { toast } = useToast()

    // Form State
    const [title, setTitle] = React.useState('')
    const [submitMessage, setSubmitMessage] = React.useState('Thank you! We will contact you soon.')
    const [redirectUrl, setRedirectUrl] = React.useState('')
    const [fields, setFields] = React.useState([
        { name: 'name', label: 'Full Name', type: 'text', required: true },
        { name: 'email', label: 'Email Address', type: 'email', required: true },
        { name: 'phone', label: 'Phone Number', type: 'text', required: true }
    ])

    const fetchForms = () => {
        fetch('/api/admin/marketing/forms', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).then(res => res.json()).then(data => {
            if (data.success) setForms(data.forms || [])
        }).catch(console.error)
    }

    React.useEffect(() => {
        fetchForms()
    }, [])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const res = await fetch('/api/admin/marketing/forms', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}` 
                },
                body: JSON.stringify({ title, fields, submitMessage, redirectUrl })
            })
            const data = await res.json()
            if (data.success) {
                toast({ title: 'Success', description: 'Form created successfully' })
                setIsOpen(false)
                fetchForms()
                setTitle('')
            } else {
                toast({ title: 'Error', description: data.error || data.message, variant: 'destructive' })
            }
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' })
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this form?')) return
        try {
            const res = await fetch(`/api/admin/marketing/forms/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
            if (res.ok) fetchForms()
        } catch (error) {
            console.error(error)
        }
    }

    const addField = () => {
        setFields([...fields, { name: '', label: '', type: 'text', required: false }])
    }

    const updateField = (index: number, key: string, value: any) => {
        const newFields = [...fields]
        newFields[index] = { ...newFields[index], [key]: value }
        setFields(newFields)
    }

    const removeField = (index: number) => {
        if (fields.length <= 1) return
        setFields(fields.filter((_, i) => i !== index))
    }

    const copyLink = (id: string) => {
        const url = `${window.location.origin}/f/${id}`
        navigator.clipboard.writeText(url)
        toast({ title: 'Copied', description: 'Form URL copied to clipboard!' })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Lead Gen Forms</h1>
                    <p className="text-muted-foreground">Manage your lead capture forms and embed codes.</p>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Create Form</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create Lead Gen Form</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Form Title (Internal)</Label>
                                <Input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Summer Bootcamp Registration" />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Form Fields</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={addField}><Plus className="h-4 w-4 mr-1"/> Add Field</Button>
                                </div>
                                <div className="space-y-3 bg-muted/30 p-4 rounded-lg border">
                                    {fields.map((field, i) => (
                                        <div key={i} className="flex gap-2 items-start">
                                            <div className="flex-1 space-y-1">
                                                <Input placeholder="Field Name (e.g. companyName)" value={field.name} onChange={e => updateField(i, 'name', e.target.value)} required />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <Input placeholder="Label (e.g. Company Name)" value={field.label} onChange={e => updateField(i, 'label', e.target.value)} required />
                                            </div>
                                            <div className="w-24">
                                                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    value={field.type} onChange={e => updateField(i, 'type', e.target.value)}>
                                                    <option value="text">Text</option>
                                                    <option value="email">Email</option>
                                                    <option value="number">Number</option>
                                                </select>
                                            </div>
                                            <div className="pt-2">
                                                <label className="flex items-center space-x-1 text-sm">
                                                    <input type="checkbox" checked={field.required} onChange={e => updateField(i, 'required', e.target.checked)} />
                                                    <span>Req</span>
                                                </label>
                                            </div>
                                            <Button type="button" variant="ghost" size="icon" className="text-destructive mt-1" onClick={() => removeField(i)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Success Message</Label>
                                <Input value={submitMessage} onChange={e => setSubmitMessage(e.target.value)} placeholder="Message shown after submit" />
                            </div>
                            <div className="space-y-2">
                                <Label>Redirect URL (Optional)</Label>
                                <Input value={redirectUrl} onChange={e => setRedirectUrl(e.target.value)} placeholder="https://..." />
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Form
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Forms</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Fields Count</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {forms.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">No forms found. Create your first lead form.</TableCell>
                                </TableRow>
                            ) : (
                                forms.map((form: any) => (
                                    <TableRow key={form.id}>
                                        <TableCell className="font-medium">{form.title}</TableCell>
                                        <TableCell>{form.fields?.length || 0} fields</TableCell>
                                        <TableCell>{new Date(form.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => copyLink(form.id)} title="Copy Link">
                                                <LinkIcon className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(form.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
