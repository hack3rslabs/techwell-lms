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
import { employerRequestApi } from '@/lib/api'
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
  console.log('[isBusinessEmail] Checking email:', email)
  if (!email || !email.includes('@')) {
    console.log('[isBusinessEmail] Invalid email format (no @)')
    return false
  }
  const domain = email.split('@')[1].toLowerCase()
  console.log('[isBusinessEmail] Extracted domain:', domain)
  console.log('[isBusinessEmail] PERSONAL_DOMAINS:', PERSONAL_DOMAINS)
  const isPersonal = PERSONAL_DOMAINS.includes(domain)
  console.log('[isBusinessEmail] Is personal domain:', isPersonal)
  const result = !isPersonal
  console.log('[isBusinessEmail] Result (is business):', result)
  return result
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
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
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

  const validateForm = (): { [key: string]: string } => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.designation.trim()) {
      newErrors.designation = 'Designation is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Invalid email format'
      } else {
        const isValidBusiness = isBusinessEmail(formData.email)
        console.log('[Validation] Email:', formData.email, 'Is Business Email:', isValidBusiness)
        
        if (!isValidBusiness) {
          newErrors.email = 'Please use your company email. Personal email domains (Gmail, Yahoo, Outlook, etc.) are not allowed.'
        }
      }
    }

    setErrors(newErrors)
    return newErrors
  }
  const handleSubmit = async (e: React.FormEvent) => {
    console.log('[EmployerRequest] handleSubmit called', e)
    e.preventDefault()
    console.log('[EmployerRequest] preventDefault called')

    const validationErrors = validateForm()
    console.log('[EmployerRequest] Validation Errors:', validationErrors)
    console.log('[EmployerRequest] Form Data:', formData)
    
    if (Object.keys(validationErrors).length > 0) {
      console.log('[EmployerRequest] Showing validation error toast')
      // Show the first error in toast
      const firstErrorKey = Object.keys(validationErrors)[0]
      const firstErrorMessage = validationErrors[firstErrorKey]
      
      toast({
        title: 'Validation Error',
        description: firstErrorMessage,
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      console.log('[EmployerRequest] Submitting form with data:', {
        name: formData.name.trim(),
        designation: formData.designation.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
      })

      const response = await employerRequestApi.submit({
        name: formData.name.trim(),
        designation: formData.designation.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
      })

      console.log('[EmployerRequest] Success response:', response)

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
      setErrors({})
      setIsOpen(false)
    } catch (error: any) {
      console.error('[EmployerRequest] Error:', error)
      console.error('[EmployerRequest] Error Response:', error.response?.data)
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit employer request'
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
              className={errors.name ? 'border-red-500 border-2' : ''}
            />
            {errors.name && (
              <p className="text-sm font-medium text-red-600">{errors.name}</p>
            )}
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
              className={errors.designation ? 'border-red-500 border-2' : ''}
            />
            {errors.designation && (
              <p className="text-sm font-medium text-red-600">{errors.designation}</p>
            )}
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
              className={errors.email ? 'border-red-500 border-2' : ''}
            />
            {errors.email && (
              <p className="text-sm font-medium text-red-600">{errors.email}</p>
            )}
            {!errors.email && (
              <p className="text-xs text-muted-foreground">
                Please use your company email address (not Gmail, Yahoo, Outlook, etc.)
              </p>
            )}
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
