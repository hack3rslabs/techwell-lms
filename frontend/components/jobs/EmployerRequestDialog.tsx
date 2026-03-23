'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import api from '@/lib/api'
import { Briefcase } from 'lucide-react'

// Personal email domains to reject
const PERSONAL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'aol.com',
  'mail.com',
  'windows.live.com',
  'yandex.com',
  'protonmail.com',
  'icloud.com',
  'mail.ru',
]

function isBusinessEmail(email: string): boolean {
  if (!email || !email.includes('@')) {
    return false
  }
  const domain = email.split('@')[1].toLowerCase()
  return !PERSONAL_DOMAINS.includes(domain)
}

interface FormData {
  name: string
  designation: string
  email: string
  phone: string
}

export default function EmployerRequestDialog() {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    designation: '',
    email: '',
    phone: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return 'Name is required'
    }
    if (!formData.designation.trim()) {
      return 'Designation is required'
    }
    if (!formData.email.trim()) {
      return 'Email is required'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      return 'Invalid email format'
    }

    if (!isBusinessEmail(formData.email)) {
      return 'Please use your company email. Personal email domains (Gmail, Yahoo, Outlook, etc.) are not allowed.'
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      toast({
        title: 'Validation Error',
        description: validationError,
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await api.post('/employer-requests', {
        name: formData.name.trim(),
        designation: formData.designation.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
      })

      toast({
        title: 'Success',
        description: response.data.message || 'Employer request submitted successfully. Admin will review and contact you soon.',
        variant: 'default',
      })

      // Reset form and close dialog
      setFormData({
        name: '',
        designation: '',
        email: '',
        phone: '',
      })
      setIsOpen(false)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to submit employer request'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Briefcase className="h-4 w-4" />
          Request Employer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Employer to Post Jobs</DialogTitle>
          <DialogDescription>
            Tell us about the employer you'd like to see posting jobs on TechWell
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Employer Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., Acme Corp"
              value={formData.name}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="designation" className="text-sm font-medium">
              Your Designation <span className="text-red-500">*</span>
            </label>
            <Input
              id="designation"
              name="designation"
              placeholder="e.g., Hiring Manager"
              value={formData.designation}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Company Email <span className="text-red-500">*</span>
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your.name@company.com"
              value={formData.email}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Please use your company email address (not Gmail, Yahoo, Outlook, etc.)
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">
              Phone (Optional)
            </label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-3">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              <span className="font-semibold">What happens next?</span> Your request will be reviewed by our admin team. Once approved, the employer will be able to post jobs on TechWell.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
