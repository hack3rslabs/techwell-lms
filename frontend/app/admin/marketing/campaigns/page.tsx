"use client"

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Edit2, Trash2, Loader2, ArrowUpRight } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import api from '@/lib/api'

export default function Campaigns() {
    const [campaigns, setCampaigns] = React.useState<any[]>([])
    const [isOpen, setIsOpen] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)
    const { toast } = useToast()

    // Form State
    const [name, setName] = React.useState('')
    const [type, setType] = React.useState('META_ADS')
    const [status, setStatus] = React.useState('ACTIVE')
    const [budget, setBudget] = React.useState('')
    const [startDate, setStartDate] = React.useState('')
    const [endDate, setEndDate] = React.useState('')

    const fetchCampaigns = () => {
        api.get('/admin/marketing/campaigns').then(res => {
            if (res.data?.success) setCampaigns(res.data.campaigns || [])
        }).catch(console.error)
    }

    React.useEffect(() => {
        fetchCampaigns()
    }, [])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const res = await api.post('/admin/marketing/campaigns', { 
                name, 
                type, 
                status, 
                budget: budget ? parseFloat(budget) : null, 
                startDate: startDate ? new Date(startDate).toISOString() : null,
                endDate: endDate ? new Date(endDate).toISOString() : null
            })
            if (res.data?.success) {
                toast({ title: 'Success', description: 'Campaign created successfully' })
                setIsOpen(false)
                fetchCampaigns()
                setName('')
                setBudget('')
                setStartDate('')
                setEndDate('')
            } else {
                toast({ title: 'Error', description: res.data?.error || res.data?.message, variant: 'destructive' })
            }
        } catch (error: any) {
            toast({ title: 'Error', description: error.response?.data?.error || error.message, variant: 'destructive' })
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this campaign?')) return
        try {
            const res = await api.delete(`/admin/marketing/campaigns/${id}`)
            if (res.status === 200 || res.data?.success) fetchCampaigns()
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Campaigns & ROI</h1>
                    <p className="text-muted-foreground">Track marketing campaigns, budget, and calculate return on investment.</p>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Create Campaign</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Create Marketing Campaign</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Campaign Name</Label>
                                <Input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Meta Ads Q3" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={type} onChange={e => setType(e.target.value)}>
                                        <option value="META_ADS">Meta Ads</option>
                                        <option value="GOOGLE_ADS">Google Ads</option>
                                        <option value="EMAIL">Email Marketing</option>
                                        <option value="WHATSAPP">WhatsApp</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={status} onChange={e => setStatus(e.target.value)}>
                                        <option value="ACTIVE">Active</option>
                                        <option value="PAUSED">Paused</option>
                                        <option value="COMPLETED">Completed</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Budget ($/Rs)</Label>
                                <Input type="number" step="0.01" value={budget} onChange={e => setBudget(e.target.value)} placeholder="0.00" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Start Date</Label>
                                    <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>End Date</Label>
                                    <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Campaign
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Budget</TableHead>
                                <TableHead>Revenue / ROI</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {campaigns.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No campaigns found. Start your first campaign.</TableCell>
                                </TableRow>
                            ) : (
                                campaigns.map((campaign: any) => (
                                    <TableRow key={campaign.id}>
                                        <TableCell>
                                            <div className="font-medium">{campaign.name}</div>
                                            <div className="text-xs text-muted-foreground">ID: {campaign.id}</div>
                                        </TableCell>
                                        <TableCell>{campaign.type}</TableCell>
                                        <TableCell>
                                            <Badge variant={campaign.status === 'ACTIVE' ? 'default' : 'secondary'}>{campaign.status}</Badge>
                                        </TableCell>
                                        <TableCell>Rs. {campaign.budget || 0}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">Rs. {campaign.totalRevenue || 0}</span>
                                                <span className={`text-xs font-bold flex items-center ${campaign.roiScore > 0 ? "text-green-600" : (campaign.roiScore < 0 ? "text-red-600" : "text-muted-foreground")}`}>
                                                    {campaign.roiScore > 0 && <ArrowUpRight className="h-3 w-3 mr-0.5" />}
                                                    {campaign.roiScore ? `${campaign.roiScore > 0 ? '+' : ''}${campaign.roiScore}% ROI` : 'N/A'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(campaign.id)}>
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
