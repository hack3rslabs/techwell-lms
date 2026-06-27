"use client"

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { QRCodeCanvas } from 'qrcode.react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Loader2, Plus, QrCode, Edit, Trash2, Calendar, Users, GripVertical, Settings2, Link as LinkIcon, Trash } from 'lucide-react'
import api from '@/lib/api'

interface CustomField {
    id: string
    name: string
    label: string
    type: string
    required: boolean
}

export default function AdminEventsPage() {
    const [events, setEvents] = React.useState<any[]>([])
    const [isLoading, setIsLoading] = React.useState(true)

    // Modals
    const [isAddOpen, setIsAddOpen] = React.useState(false)
    const [isQROpen, setIsQROpen] = React.useState(false)
    
    const [editingEventId, setEditingEventId] = React.useState<string | null>(null)
    const [selectedEventForQR, setSelectedEventForQR] = React.useState<any>(null)
    const [isSaving, setIsSaving] = React.useState(false)

    // Form State
    const [formData, setFormData] = React.useState({
        title: '',
        description: '',
        imageUrl: '',
        type: 'Webinar',
        date: '',
        time: '',
        location: '',
        status: 'Upcoming',
        seatsTotal: '100',
        iconName: ''
    })
    const [customFields, setCustomFields] = React.useState<CustomField[]>([])

    const fetchEvents = React.useCallback(async () => {
        setIsLoading(true)
        try {
            const res = await api.get('/events')
            setEvents(res.data || [])
        } catch (error) {
            console.error('Failed to fetch events:', error)
            toast.error('Failed to load events')
        } finally {
            setIsLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchEvents()
    }, [fetchEvents])

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            imageUrl: '',
            type: 'Webinar',
            date: '',
            time: '',
            location: '',
            status: 'Upcoming',
            seatsTotal: '100',
            iconName: ''
        })
        setCustomFields([])
        setEditingEventId(null)
    }

    const handleEdit = (event: any) => {
        setFormData({
            title: event.title || '',
            description: event.description || '',
            imageUrl: event.imageUrl || '',
            type: event.type || 'Webinar',
            date: event.date ? format(new Date(event.date), 'yyyy-MM-dd') : '',
            time: event.time || '',
            location: event.location || '',
            status: event.status || 'Upcoming',
            seatsTotal: event.seatsTotal?.toString() || '100',
            iconName: event.iconName || ''
        })
        setCustomFields(event.customFormFields || [])
        setEditingEventId(event.id)
        setIsAddOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this event?')) return
        try {
            await api.delete(`/events/${id}`)
            toast.success('Event deleted successfully')
            fetchEvents()
        } catch (error) {
            console.error('Delete error', error)
            toast.error('Failed to delete event')
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            const payload = {
                ...formData,
                seatsTotal: parseInt(formData.seatsTotal),
                customFormFields: customFields
            }
            if (editingEventId) {
                await api.put(`/events/${editingEventId}`, payload)
                toast.success('Event updated successfully')
            } else {
                await api.post('/events', payload)
                toast.success('Event created successfully')
            }
            setIsAddOpen(false)
            fetchEvents()
        } catch (error) {
            console.error('Save error', error)
            toast.error('Failed to save event')
        } finally {
            setIsSaving(false)
        }
    }

    const addCustomField = () => {
        setCustomFields([
            ...customFields,
            { id: Date.now().toString(), name: '', label: '', type: 'text', required: false }
        ])
    }

    const updateCustomField = (id: string, key: keyof CustomField, value: any) => {
        setCustomFields(customFields.map(f => f.id === id ? { ...f, [key]: value } : f))
    }

    const removeCustomField = (id: string) => {
        setCustomFields(customFields.filter(f => f.id !== id))
    }

    const showQRCode = (event: any) => {
        setSelectedEventForQR(event)
        setIsQROpen(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Events Management</h1>
                    <p className="text-muted-foreground">Manage events, webinars, custom forms, and generate QR codes.</p>
                </div>
                <Button onClick={() => { resetForm(); setIsAddOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Event
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Events</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead>Event Details</TableHead>
                                <TableHead>Date & Time</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Seats</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500 mb-2" />
                                        Fetching events...
                                    </TableCell>
                                </TableRow>
                            ) : events.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                        No events found. Create one to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                events.map((event) => (
                                    <TableRow key={event.id}>
                                        <TableCell>
                                            <div className="font-semibold text-base">{event.title}</div>
                                            <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className="text-xs">{event.type}</Badge>
                                                {event.location}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                                <span>{format(new Date(event.date), 'dd MMM yyyy')}</span>
                                            </div>
                                            <div className="text-sm text-muted-foreground mt-1">{event.time}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={event.status === 'Completed' ? 'secondary' : (event.status === 'Upcoming' ? 'default' : 'outline')} className={event.status === 'Registration Open' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : ''}>
                                                {event.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-muted-foreground" />
                                                <span className="font-medium">{event.seatsBooked} / {event.seatsTotal}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="sm" onClick={() => showQRCode(event)} className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                                                    <QrCode className="w-4 h-4 mr-1" /> QR
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(event)}>
                                                    <Edit className="w-4 h-4 text-slate-500" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(event.id)}>
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Add / Edit Modal */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingEventId ? 'Edit Event' : 'Create New Event'}</DialogTitle>
                        <DialogDescription>Fill out the details for the event, and optionally build a custom registration form.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2 md:col-span-2">
                                <Label>Event Title</Label>
                                <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Masterclass: Cloud Architecture" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Event Image URL</Label>
                                <Input value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} placeholder="https://example.com/image.jpg" />
                                <p className="text-xs text-muted-foreground">Recommended size: 1200x630px, High Quality.</p>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Event Description</Label>
                                <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Brief description of what to expect..." rows={3} />
                            </div>
                            <div className="space-y-2">
                                <Label>Event Type</Label>
                                <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Webinar">Webinar</SelectItem>
                                        <SelectItem value="Offline Event">Offline Event</SelectItem>
                                        <SelectItem value="Masterclass">Masterclass</SelectItem>
                                        <SelectItem value="Bootcamp">Bootcamp</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Upcoming">Upcoming</SelectItem>
                                        <SelectItem value="Registration Open">Registration Open</SelectItem>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label>Time</Label>
                                <Input required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} placeholder="e.g. 6:00 PM IST" />
                            </div>
                            <div className="space-y-2">
                                <Label>Location / Meeting Link</Label>
                                <Input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. Zoom or Hyderabad Hub" />
                            </div>
                            <div className="space-y-2">
                                <Label>Total Seats</Label>
                                <Input type="number" required value={formData.seatsTotal} onChange={e => setFormData({...formData, seatsTotal: e.target.value})} />
                            </div>
                        </div>

                        {/* Custom Form Builder */}
                        <div className="mt-8 border rounded-xl p-6 bg-slate-50 dark:bg-slate-900/50">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="font-semibold flex items-center gap-2"><Settings2 className="w-5 h-5 text-indigo-500" /> Custom Registration Form</h3>
                                    <p className="text-sm text-muted-foreground mt-1">Add dynamic fields beyond the standard (Name, Email, Phone, College, District).</p>
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={addCustomField}>
                                    <Plus className="w-4 h-4 mr-2" /> Add Field
                                </Button>
                            </div>

                            {customFields.length === 0 ? (
                                <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                                    No custom fields added. The form will only ask for standard details.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {customFields.map((field, index) => (
                                        <div key={field.id} className="flex flex-wrap items-center gap-3 p-3 bg-white dark:bg-slate-950 border rounded-lg shadow-sm">
                                            <GripVertical className="w-4 h-4 text-slate-400 cursor-grab" />
                                            
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <div className="space-y-1">
                                                    <Label className="text-xs">Database Key</Label>
                                                    <Input 
                                                        value={field.name} 
                                                        onChange={e => updateCustomField(field.id, 'name', e.target.value)} 
                                                        placeholder="e.g. githubUrl" 
                                                        className="h-8 text-sm"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs">Field Label</Label>
                                                    <Input 
                                                        value={field.label} 
                                                        onChange={e => updateCustomField(field.id, 'label', e.target.value)} 
                                                        placeholder="e.g. GitHub Profile Link" 
                                                        className="h-8 text-sm"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs">Input Type</Label>
                                                    <Select value={field.type} onValueChange={v => updateCustomField(field.id, 'type', v)}>
                                                        <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="text">Text (Short)</SelectItem>
                                                            <SelectItem value="textarea">Text (Long)</SelectItem>
                                                            <SelectItem value="url">URL Link</SelectItem>
                                                            <SelectItem value="number">Number</SelectItem>
                                                            <SelectItem value="date">Date</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 px-2">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox 
                                                        id={`req-${field.id}`}
                                                        checked={field.required}
                                                        onCheckedChange={c => updateCustomField(field.id, 'required', !!c)}
                                                    />
                                                    <label htmlFor={`req-${field.id}`} className="text-sm font-medium">Required</label>
                                                </div>
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeCustomField(field.id)} className="h-8 w-8 text-red-500 hover:bg-red-50">
                                                    <Trash className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700">
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Event
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* QR Code Modal */}
            <Dialog open={isQROpen} onOpenChange={setIsQROpen}>
                <DialogContent className="sm:max-w-md text-center">
                    <DialogHeader>
                        <DialogTitle className="text-center">{selectedEventForQR?.title}</DialogTitle>
                        <DialogDescription className="text-center">Scan QR code for instant registration</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center p-6 space-y-6">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                            {selectedEventForQR && (
                                <QRCodeCanvas
                                    value={`${window.location.origin}/events?register=${selectedEventForQR.id}`}
                                    size={256}
                                    level={"H"}
                                    includeMargin={true}
                                />
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-sm bg-slate-100 dark:bg-slate-800 p-3 rounded-lg w-full max-w-sm overflow-hidden">
                            <LinkIcon className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                            <span className="truncate flex-1 text-left">{window.location.origin}/events?register={selectedEventForQR?.id}</span>
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/events?register=${selectedEventForQR?.id}`)
                                toast.success("Link copied!")
                            }}>Copy</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
