"use client"

import * as React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle2 } from 'lucide-react'

export default function StandaloneFormClient({ form, campaignId }: { form: any, campaignId?: string }) {
    const [isLoading, setIsLoading] = React.useState(false)
    const [isSuccess, setIsSuccess] = React.useState(false)
    const [formData, setFormData] = React.useState<Record<string, string>>({})
    const [error, setError] = React.useState('')

    const fields = form.fields || []

    const handleChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            // Mapping dynamic fields to Lead capture schema
            const payload = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                source: `Form: ${form.title}`,
                leadType: 'GENERAL',
                campaignId: campaignId || undefined,
                notes: `Submitted via Lead Gen Form (${form.title})\n\nOther Data:\n` + 
                       Object.entries(formData)
                             .filter(([k]) => !['name', 'email', 'phone'].includes(k))
                             .map(([k, v]) => `${k}: ${v}`).join('\n')
            }

            const res = await fetch('/api/leads/capture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            const data = await res.json()
            if (data.success || res.ok) {
                setIsSuccess(true)
                if (form.redirectUrl) {
                    setTimeout(() => {
                        window.location.href = form.redirectUrl
                    }, 2000)
                }
            } else {
                setError(data.error || 'Failed to submit form')
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="py-8 text-center space-y-4 animate-in fade-in zoom-in duration-500">
                <div className="mx-auto w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Success!</h3>
                <p className="text-muted-foreground">{form.submitMessage || 'Thank you! We will contact you soon.'}</p>
                {form.redirectUrl && (
                    <p className="text-xs text-muted-foreground pt-4">Redirecting...</p>
                )}
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                    {error}
                </div>
            )}
            
            {fields.map((field: any, idx: number) => (
                <div key={idx} className="space-y-2">
                    <Label htmlFor={field.name}>
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                    </Label>
                    <Input 
                        id={field.name}
                        type={field.type || 'text'} 
                        required={field.required}
                        value={formData[field.name] || ''}
                        onChange={e => handleChange(field.name, e.target.value)}
                        className="bg-slate-50/50"
                        placeholder={`Enter your ${field.label.toLowerCase()}`}
                    />
                </div>
            ))}

            <div className="pt-4">
                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                    Submit
                </Button>
            </div>
        </form>
    )
}
