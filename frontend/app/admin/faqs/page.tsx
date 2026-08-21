"use client"

import * as React from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Loader2, Plus, Trash2, Edit2 } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from '@/components/ui/use-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/lib/auth-context'

interface Faq {
  id: string
  question: string
  answer: string
  category: string
  order: number
  isActive: boolean
}

const CATEGORIES = [
  "General Information",
  "Training Courses",
  "Jobs",
  "Job Assistance",
  "Placement Assistance",
  "Recruitment",
  "Campus Hiring",
  "Payments",
  "Certificates",
  "Consultancy",
  "Fraud & Safety",
  "Terms & Conditions"
]

export default function AdminFaqPage() {
  const router = useRouter()
  const { hasPermission, isLoading: authLoading } = useAuth()
  const [faqs, setFaqs] = React.useState<Faq[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState("all")

  // Modals State
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const [editingFaq, setEditingFaq] = React.useState<Faq | null>(null)
  const [faqToDelete, setFaqToDelete] = React.useState<Faq | null>(null)

  const [formData, setFormData] = React.useState({
    question: "",
    answer: "",
    category: CATEGORIES[0],
    order: 0,
    isActive: true
  })
  const [isSaving, setIsSaving] = React.useState(false)

  const fetchFaqs = async () => {
    try {
      // Pass includeInactive=true for Admin
      const res = await api.get('/faqs?includeInactive=true')
      setFaqs(res.data.data || [])
    } catch (error) {
      console.error('Failed to fetch FAQs:', error)
      toast({ title: "Error fetching FAQs", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    if (!authLoading) {
      fetchFaqs()
    }
  }, [authLoading])

  const handleSave = async () => {
    if (!formData.question || !formData.answer || !formData.category) {
      toast({ title: "Please fill all required fields", variant: "destructive" })
      return
    }

    setIsSaving(true)
    try {
      if (editingFaq) {
        await api.put(`/faqs/${editingFaq.id}`, formData)
        toast({ title: "FAQ updated successfully" })
      } else {
        await api.post('/faqs', formData)
        toast({ title: "FAQ created successfully" })
      }
      setIsFormOpen(false)
      fetchFaqs()
    } catch (error: any) {
      toast({ title: "Failed to save FAQ", description: error.response?.data?.message, variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!faqToDelete) return
    try {
      await api.delete(`/faqs/${faqToDelete.id}`)
      toast({ title: "FAQ deleted successfully" })
      setIsDeleteOpen(false)
      fetchFaqs()
    } catch (error: any) {
      toast({ title: "Failed to delete FAQ", description: error.response?.data?.message, variant: "destructive" })
    }
  }

  const openCreateModal = () => {
    setEditingFaq(null)
    setFormData({
      question: "",
      answer: "",
      category: CATEGORIES[0],
      order: 0,
      isActive: true
    })
    setIsFormOpen(true)
  }

  const openEditModal = (faq: Faq) => {
    setEditingFaq(faq)
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      order: faq.order,
      isActive: faq.isActive
    })
    setIsFormOpen(true)
  }

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">FAQ Management</h1>
          <p className="text-muted-foreground mt-1">Create, edit, and organize public FAQs.</p>
        </div>
        <Button onClick={openCreateModal} className="gap-2">
          <Plus className="h-4 w-4" /> Add FAQ
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search questions..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Order</th>
                <th className="px-6 py-4 font-medium">Question</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredFaqs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No FAQs found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredFaqs.map((faq) => (
                  <tr key={faq.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">{faq.order}</td>
                    <td className="px-6 py-4 font-medium text-foreground max-w-md truncate" title={faq.question}>
                      {faq.question}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline">{faq.category}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={faq.isActive ? "default" : "secondary"}>
                        {faq.isActive ? "Published" : "Draft"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(faq)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => { setFaqToDelete(faq); setIsDeleteOpen(true); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingFaq ? 'Edit FAQ' : 'Create New FAQ'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Question *</Label>
              <Input 
                value={formData.question}
                onChange={(e) => setFormData(prev => ({...prev, question: e.target.value}))}
                placeholder="e.g., What is Techwell?"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Answer *</Label>
              <Textarea 
                value={formData.answer}
                onChange={(e) => setFormData(prev => ({...prev, answer: e.target.value}))}
                placeholder="Simple, clear answer..."
                className="min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground">Keep answers simple. Direct to Terms & Conditions for legal details.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={formData.category} onValueChange={(val) => setFormData(prev => ({...prev, category: val}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input 
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({...prev, order: parseInt(e.target.value) || 0}))}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-2">
              <Checkbox 
                id="isActive" 
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({...prev, isActive: checked as boolean}))}
              />
              <Label htmlFor="isActive" className="cursor-pointer">Publish this FAQ immediately</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editingFaq ? 'Save Changes' : 'Create FAQ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete FAQ</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this FAQ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 font-medium text-foreground">
            "{faqToDelete?.question}"
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete FAQ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
