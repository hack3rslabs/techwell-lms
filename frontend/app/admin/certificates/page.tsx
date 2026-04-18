"use client"

import * as React from 'react'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Award,
    Download,
    Search,
    Eye,
    Plus,
    FileImage,
    Trash2,
    Settings,
    Save,
    Loader2,
    CheckCircle,
    XCircle
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { exportToCSV } from '@/lib/export-utils'
import { certificateApi } from '@/lib/api'

interface Certificate {
    id: string
    uniqueId: string
    studentName: string
    courseName: string
    courseCategory?: string
    issueDate: string
    expiryDate?: string
    grade?: string
    score?: number
    isValid: boolean
    signatoryName?: string
    signatoryTitle?: string
    template?: { name: string; previewUrl?: string }
}

interface CertificateTemplate {
    id: string
    name: string
    description?: string
    designUrl: string
    previewUrl?: string
    isDefault: boolean
    isActive: boolean
}

interface CertificateSettings {
    id: string
    prefix: string
    yearInId: boolean
    sequenceDigits: number
    currentSequence: number
    defaultSignatureUrl?: string
    defaultSignatoryName: string
    defaultSignatoryTitle: string
    defaultValidityMonths?: number | null
    instituteName: string
    instituteLogoUrl?: string
    // Position settings
    signaturePosition?: string
    logoPosition?: string
    logoSize?: string
    signatureSize?: string
    borderStyle?: string
    backgroundUrl?: string
}

export default function CertificatesPage() {
    // State
    const [certificates, setCertificates] = useState<Certificate[]>([])
    const [templates, setTemplates] = useState<CertificateTemplate[]>([])
    const [settings, setSettings] = useState<CertificateSettings | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [previewCert, setPreviewCert] = useState<Certificate | null>(null)
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
    const [newTemplate, setNewTemplate] = useState({ name: '', description: '', designUrl: '', isDefault: false })

    // Fetch data on mount
    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const [certsRes, templatesRes, settingsRes] = await Promise.all([
                certificateApi.getAll(),
                certificateApi.getTemplates(),
                certificateApi.getSettings()
            ])
            setCertificates(certsRes.data.certificates || [])
            setTemplates(templatesRes.data.templates || [])
            setSettings(settingsRes.data.settings)
        } catch (error) {
            console.error('Failed to fetch certificate data:', error)
            // Use mock data as fallback
            setCertificates([
                { id: '1', uniqueId: 'CERT-2026-00001', studentName: 'John Doe', courseName: 'Advanced JavaScript', issueDate: '2026-01-15', isValid: true },
                { id: '2', uniqueId: 'CERT-2026-00002', studentName: 'Jane Smith', courseName: 'React Fundamentals', issueDate: '2026-01-20', isValid: true }
            ])
        } finally {
            setIsLoading(false)
        }
    }

    const filteredCertificates = certificates.filter(cert =>
        cert.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.uniqueId.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleExportAll = () => {
        exportToCSV(certificates.map(c => ({
            certificateId: c.uniqueId,
            studentName: c.studentName,
            courseName: c.courseName,
            issueDate: c.issueDate,
            grade: c.grade || '',
            isValid: c.isValid ? 'Valid' : 'Invalid'
        })), {
            filename: `certificates_export_${new Date().toISOString().split('T')[0]}`,
            headers: ['certificateId', 'studentName', 'courseName', 'issueDate', 'grade', 'isValid']
        })
    }

    const handleViewCertificate = (cert: Certificate) => {
        setPreviewCert(cert)
        setIsPreviewOpen(true)
    }

    const handleDownloadCertificate = (cert: Certificate) => {
        const certContent = `
            <!DOCTYPE html>
            <html>
            <head><title>Certificate - ${cert.uniqueId}</title></head>
            <body style="font-family: Georgia, serif; text-align: center; padding: 60px; border: 3px double #1a365d;">
                <h1 style="color: #1a365d; font-size: 36px;">Certificate of Completion</h1>
                <p style="font-size: 18px; margin: 40px 0;">This is to certify that</p>
                <h2 style="color: #2d3748; font-size: 32px; margin: 20px 0;">${cert.studentName}</h2>
                <p style="font-size: 18px; margin: 40px 0;">has successfully completed</p>
                <h3 style="color: #4a5568; font-size: 24px;">${cert.courseName}</h3>
                ${cert.grade ? `<p style="margin-top: 30px;">Grade: <strong>${cert.grade}</strong></p>` : ''}
                <p style="margin-top: 50px;">Date: ${new Date(cert.issueDate).toLocaleDateString()}</p>
                <p style="font-size: 12px; color: #718096; margin-top: 20px;">Certificate ID: ${cert.uniqueId}</p>
                ${cert.signatoryName ? `
                    <div style="margin-top: 60px;">
                        <p style="border-top: 1px solid #000; display: inline-block; padding-top: 10px;">
                            ${cert.signatoryName}<br/>
                            <small>${cert.signatoryTitle || ''}</small>
                        </p>
                    </div>
                ` : ''}
            </body>
            </html>
        `
        const blob = new Blob([certContent], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${cert.uniqueId}.html`
        link.click()
        URL.revokeObjectURL(url)
    }

    const handleSaveSettings = async () => {
        if (!settings) return
        setIsSaving(true)
        try {
            await certificateApi.updateSettings({
                prefix: settings.prefix,
                yearInId: settings.yearInId,
                sequenceDigits: settings.sequenceDigits,
                defaultSignatureUrl: settings.defaultSignatureUrl,
                defaultSignatoryName: settings.defaultSignatoryName,
                defaultSignatoryTitle: settings.defaultSignatoryTitle,
                defaultValidityMonths: settings.defaultValidityMonths,
                instituteName: settings.instituteName,
                instituteLogoUrl: settings.instituteLogoUrl
            })
            alert('Settings saved successfully!')
        } catch (error) {
            console.error('Failed to save settings:', error)
            alert('Failed to save settings')
        } finally {
            setIsSaving(false)
        }
    }

    const handleCreateTemplate = async () => {
        if (!newTemplate.name || !newTemplate.designUrl) return
        try {
            const res = await certificateApi.createTemplate(newTemplate)
            setTemplates([...templates, res.data.template])
            setNewTemplate({ name: '', description: '', designUrl: '', isDefault: false })
            setIsUploadDialogOpen(false)
        } catch (error) {
            console.error('Failed to create template:', error)
            alert('Failed to create template')
        }
    }

    const handleDeleteTemplate = async (id: string) => {
        if (!confirm('Are you sure you want to delete this template?')) return
        try {
            await certificateApi.deleteTemplate(id)
            setTemplates(templates.filter(t => t.id !== id))
        } catch (error) {
            console.error('Failed to delete template:', error)
        }
    }

    const handleSetDefaultTemplate = async (id: string) => {
        try {
            await certificateApi.updateTemplate(id, { isDefault: true })
            setTemplates(templates.map(t => ({ ...t, isDefault: t.id === id })))
        } catch (error) {
            console.error('Failed to set default template:', error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Certificate Management</h1>
                    <p className="text-muted-foreground">Manage certificates, templates, and settings.</p>
                </div>
            </div>

            <Tabs defaultValue="certificates" className="w-full">
                <TabsList>
                    <TabsTrigger value="certificates">
                        <Award className="h-4 w-4 mr-2" />
                        Certificates
                    </TabsTrigger>
                    <TabsTrigger value="templates">
                        <FileImage className="h-4 w-4 mr-2" />
                        Templates
                    </TabsTrigger>
                    <TabsTrigger value="settings">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                    </TabsTrigger>
                </TabsList>

                {/* CERTIFICATES TAB */}
                <TabsContent value="certificates" className="mt-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="relative max-w-sm">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, course, or ID..."
                                    className="pl-9"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" onClick={handleExportAll}>
                                <Download className="mr-2 h-4 w-4" />
                                Export All
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : filteredCertificates.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Certificate ID</TableHead>
                                            <TableHead>Student Name</TableHead>
                                            <TableHead>Course</TableHead>
                                            <TableHead>Issue Date</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredCertificates.map((cert) => (
                                            <TableRow key={cert.id}>
                                                <TableCell className="font-mono text-sm">{cert.uniqueId}</TableCell>
                                                <TableCell className="font-medium">{cert.studentName}</TableCell>
                                                <TableCell>{cert.courseName}</TableCell>
                                                <TableCell>{new Date(cert.issueDate).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    {cert.isValid ? (
                                                        <span className="flex items-center gap-1 text-green-600 text-sm">
                                                            <CheckCircle className="h-4 w-4" /> Valid
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-red-600 text-sm">
                                                            <XCircle className="h-4 w-4" /> Invalid
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" onClick={() => handleViewCertificate(cert)}>
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        View
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDownloadCertificate(cert)}>
                                                        <Download className="h-4 w-4 mr-1" />
                                                        Download
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Award className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <h3 className="text-lg font-medium">No certificates found</h3>
                                    <p>Certificates will appear here once students complete courses.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Certificate Preview Dialog */}
                    <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Certificate Preview</DialogTitle>
                                <DialogDescription>{previewCert?.uniqueId}</DialogDescription>
                            </DialogHeader>
                            {previewCert && (
                                <div className="py-4">
                                    <div className="p-6 border-2 border-dashed rounded-lg text-center space-y-4">
                                        <Award className="h-16 w-16 mx-auto text-primary" />
                                        <h2 className="text-2xl font-bold">Certificate of Completion</h2>
                                        <p className="text-muted-foreground">This is to certify that</p>
                                        <h3 className="text-xl font-semibold">{previewCert.studentName}</h3>
                                        <p className="text-muted-foreground">has successfully completed</p>
                                        <h4 className="text-lg font-medium">{previewCert.courseName}</h4>
                                        {previewCert.grade && <p>Grade: <strong>{previewCert.grade}</strong></p>}
                                        <p className="text-sm text-muted-foreground">
                                            Issued on: {new Date(previewCert.issueDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            )}
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>Close</Button>
                                <Button onClick={() => previewCert && handleDownloadCertificate(previewCert)}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </TabsContent>

                {/* TEMPLATES TAB */}
                <TabsContent value="templates" className="mt-6">
                    <div className="flex justify-end mb-4">
                        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Template
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create New Template</DialogTitle>
                                    <DialogDescription>Add a new certificate template design.</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Template Name</Label>
                                        <Input
                                            value={newTemplate.name}
                                            onChange={e => setNewTemplate({ ...newTemplate, name: e.target.value })}
                                            placeholder="e.g. Modern Blue"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Input
                                            value={newTemplate.description}
                                            onChange={e => setNewTemplate({ ...newTemplate, description: e.target.value })}
                                            placeholder="Optional description"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Design URL</Label>
                                        <Input
                                            value={newTemplate.designUrl}
                                            onChange={e => setNewTemplate({ ...newTemplate, designUrl: e.target.value })}
                                            placeholder="https://... (image URL)"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={newTemplate.isDefault}
                                            onCheckedChange={checked => setNewTemplate({ ...newTemplate, isDefault: checked })}
                                        />
                                        <Label>Set as default template</Label>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>Cancel</Button>
                                    <Button onClick={handleCreateTemplate}>Create Template</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {templates.map(template => (
                            <Card key={template.id} className={template.isDefault ? 'border-primary' : ''}>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-base">{template.name}</CardTitle>
                                        {template.isDefault && (
                                            <span className="text-xs bg-primary text-white px-2 py-1 rounded">Default</span>
                                        )}
                                    </div>
                                    {template.description && (
                                        <CardDescription>{template.description}</CardDescription>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <div className="aspect-[4/3] bg-muted rounded-lg flex items-center justify-center mb-4">
                                        {template.previewUrl || template.designUrl ? (
                                            <Image
                                                src={template.previewUrl || template.designUrl}
                                                alt={template.name}
                                                width={200}
                                                height={150}
                                                className="max-h-full object-contain"
                                            />
                                        ) : (
                                            <FileImage className="h-12 w-12 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        {!template.isDefault && (
                                            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleSetDefaultTemplate(template.id)}>
                                                Set Default
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="sm" onClick={() => handleDeleteTemplate(template.id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {templates.length === 0 && (
                            <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                                <FileImage className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No templates yet. Add one to get started.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* SETTINGS TAB */}
                <TabsContent value="settings" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Certificate Settings</CardTitle>
                            <CardDescription>Configure certificate generation options, signatures, and branding.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {settings ? (
                                <>
                                    {/* ID Format */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold">Certificate ID Format</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label>Prefix</Label>
                                                <Input
                                                    value={settings.prefix}
                                                    onChange={e => setSettings({ ...settings, prefix: e.target.value })}
                                                    placeholder="CERT"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Sequence Digits</Label>
                                                <Input
                                                    type="number"
                                                    value={settings.sequenceDigits}
                                                    onChange={e => setSettings({ ...settings, sequenceDigits: parseInt(e.target.value) || 5 })}
                                                    min={3}
                                                    max={10}
                                                />
                                            </div>
                                            <div className="flex items-center gap-2 pt-6">
                                                <Switch
                                                    checked={settings.yearInId}
                                                    onCheckedChange={checked => setSettings({ ...settings, yearInId: checked })}
                                                />
                                                <Label>Include Year</Label>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Preview: <code className="bg-muted px-2 py-1 rounded">
                                                {settings.prefix}-{settings.yearInId ? '2026-' : ''}{String(settings.currentSequence + 1).padStart(settings.sequenceDigits, '0')}
                                            </code>
                                        </p>
                                    </div>

                                    {/* Signature */}
                                    <div className="space-y-4 border-t pt-6">
                                        <h3 className="font-semibold">Default Signature</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Signatory Name</Label>
                                                <Input
                                                    value={settings.defaultSignatoryName}
                                                    onChange={e => setSettings({ ...settings, defaultSignatoryName: e.target.value })}
                                                    placeholder="Dr. John Smith"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Signatory Title</Label>
                                                <Input
                                                    value={settings.defaultSignatoryTitle}
                                                    onChange={e => setSettings({ ...settings, defaultSignatoryTitle: e.target.value })}
                                                    placeholder="Academic Director"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Signature Image URL</Label>
                                            <Input
                                                value={settings.defaultSignatureUrl || ''}
                                                onChange={e => setSettings({ ...settings, defaultSignatureUrl: e.target.value })}
                                                placeholder="https://... (signature image)"
                                            />
                                        </div>
                                    </div>

                                    {/* Position Settings */}
                                    <div className="space-y-4 border-t pt-6">
                                        <h3 className="font-semibold">Position Settings</h3>
                                        <p className="text-sm text-muted-foreground">Configure where signature and logo appear on the certificate.</p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Signature Position */}
                                            <div className="space-y-3">
                                                <Label>Signature Position</Label>
                                                <div className="grid grid-cols-3 gap-2 p-3 bg-muted/50 rounded-lg border">
                                                    {['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'].map(pos => (
                                                        <button
                                                            key={pos}
                                                            onClick={() => setSettings({ ...settings!, signaturePosition: pos })}
                                                            className={`p-2 text-xs rounded transition-all ${(settings?.signaturePosition || 'bottom-center') === pos ? 'bg-primary text-white' : 'bg-background hover:bg-primary/10'}`}
                                                            title={`Set signature to ${pos.replace('-', ' ')}`}
                                                        >
                                                            {pos.replace('-', ' ')}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Logo Position */}
                                            <div className="space-y-3">
                                                <Label>Logo Position</Label>
                                                <div className="grid grid-cols-3 gap-2 p-3 bg-muted/50 rounded-lg border">
                                                    {['header', 'footer', 'watermark', 'top-left', 'top-right', 'center'].map(pos => (
                                                        <button
                                                            key={pos}
                                                            onClick={() => setSettings({ ...settings!, logoPosition: pos })}
                                                            className={`p-2 text-xs rounded transition-all ${(settings?.logoPosition || 'header') === pos ? 'bg-primary text-white' : 'bg-background hover:bg-primary/10'}`}
                                                            title={`Set logo to ${pos}`}
                                                        >
                                                            {pos}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label>Signature Size</Label>
                                                <select
                                                    title="Select signature size"
                                                    className="w-full h-10 px-3 rounded-md border bg-background"
                                                    value={settings?.signatureSize || 'medium'}
                                                    onChange={(e) => setSettings({ ...settings!, signatureSize: e.target.value })}
                                                >
                                                    <option value="small">Small</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="large">Large</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Logo Size</Label>
                                                <select
                                                    title="Select logo size"
                                                    className="w-full h-10 px-3 rounded-md border bg-background"
                                                    value={settings?.logoSize || 'medium'}
                                                    onChange={(e) => setSettings({ ...settings!, logoSize: e.target.value })}
                                                >
                                                    <option value="small">Small</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="large">Large</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Border Style</Label>
                                                <select
                                                    title="Select border style"
                                                    className="w-full h-10 px-3 rounded-md border bg-background"
                                                    value={settings?.borderStyle || 'classic'}
                                                    onChange={(e) => setSettings({ ...settings!, borderStyle: e.target.value })}
                                                >
                                                    <option value="classic">Classic</option>
                                                    <option value="modern">Modern</option>
                                                    <option value="minimal">Minimal</option>
                                                    <option value="elegant">Elegant</option>
                                                    <option value="none">None</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Custom Background URL (optional)</Label>
                                            <Input
                                                value={settings?.backgroundUrl || ''}
                                                onChange={(e) => setSettings({ ...settings!, backgroundUrl: e.target.value })}
                                                placeholder="https://... (background image URL)"
                                            />
                                        </div>
                                    </div>

                                    {/* Branding */}
                                    <div className="space-y-4 border-t pt-6">
                                        <h3 className="font-semibold">Branding</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Institute Name</Label>
                                                <Input
                                                    value={settings.instituteName}
                                                    onChange={e => setSettings({ ...settings, instituteName: e.target.value })}
                                                    placeholder="TechWell Academy"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Logo URL</Label>
                                                <Input
                                                    value={settings.instituteLogoUrl || ''}
                                                    onChange={e => setSettings({ ...settings, instituteLogoUrl: e.target.value })}
                                                    placeholder="https://... (logo image)"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Validity */}
                                    <div className="space-y-4 border-t pt-6">
                                        <h3 className="font-semibold">Validity</h3>
                                        <div className="space-y-2">
                                            <Label>Default Validity (months)</Label>
                                            <Input
                                                type="number"
                                                value={settings.defaultValidityMonths || ''}
                                                onChange={e => setSettings({ ...settings, defaultValidityMonths: e.target.value ? parseInt(e.target.value) : null })}
                                                placeholder="Leave empty for no expiry"
                                            />
                                            <p className="text-sm text-muted-foreground">Leave empty for certificates that never expire.</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4 border-t">
                                        <Button onClick={handleSaveSettings} disabled={isSaving}>
                                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                            Save Settings
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                                    <p className="mt-2 text-muted-foreground">Loading settings...</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
