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
    XCircle,
    Printer,
    Linkedin
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { exportToCSV } from '@/lib/export-utils'
import api, { certificateApi, studentsApi, courseApi, batchesApi } from '@/lib/api'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'

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
    status: 'PENDING' | 'ISSUED' | 'REVOKED' | 'EXPIRED'
    downloads: number
    revokedAt?: string
    revocationReason?: string
    signatoryName?: string
    signatoryTitle?: string
    templateId?: string
    template?: CertificateTemplate
}

interface CertificateTemplate {
    id: string
    name: string
    description?: string
    designUrl: string
    previewUrl?: string
    isDefault: boolean
    isActive: boolean
    canvasData?: any
    purpose?: string
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
    approvalRequired: boolean
    autoIssueOnCompletion: boolean
}

export default function CertificatesPage() {
    // Auth Context
    const { hasPermission } = useAuth()
    
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
    const [stats, setStats] = useState({ total: 0, issued: 0, pending: 0, revoked: 0, downloads: 0 })

    // Batch Generation State
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false)
    const [generationType, setGenerationType] = useState<'COURSE' | 'BATCH'>('COURSE')
    const [batchCourses, setBatchCourses] = useState<any[]>([])
    const [selectedBatchCourse, setSelectedBatchCourse] = useState('')
    const [selectedBatchId, setSelectedBatchId] = useState('')
    const [selectedTemplateId, setSelectedTemplateId] = useState('')
    const [batchStudents, setBatchStudents] = useState<any[]>([])
    const [selectedBatchStudents, setSelectedBatchStudents] = useState<string[]>([])
    const [isGeneratingBatch, setIsGeneratingBatch] = useState(false)
    const [issueDate, setIssueDate] = useState<string>('')
    
    const [batchesList, setBatchesList] = useState<any[]>([])

    // Fetch data on mount

    async function fetchData() {
        setIsLoading(true)
        try {
            const [certsRes, templatesRes, settingsRes, statsRes] = await Promise.all([
                certificateApi.getAll().catch(() => ({ data: { certificates: [] } })),
                certificateApi.getTemplates().catch(() => ({ data: { templates: [] } })),
                certificateApi.getSettings().catch(() => ({ data: { settings: null } })),
                certificateApi.getStats().catch(() => ({ data: { total: 0, issued: 0, pending: 0, revoked: 0, downloads: 0 } }))
            ])
            setCertificates(certsRes?.data?.certificates || [])
            setTemplates(templatesRes?.data?.templates || [])
            setSettings(settingsRes?.data?.settings)
            if (statsRes?.data) setStats(statsRes.data)
        } catch (error) {
            console.error('Failed to fetch certificate data:', error)
            setCertificates([])
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])


    const openBatchModal = async () => {
        setIsBatchModalOpen(true)
        try {
            const res = await courseApi.getAll()
            setBatchCourses(res.data.courses || [])
            const batchesRes = await batchesApi.getAll()
            setBatchesList(batchesRes.data.batches || [])
        } catch (error) {
            console.error('Failed to fetch data for batch modal', error)
        }
    }

    const handleCourseSelectForBatch = async (courseId: string) => {
        setSelectedBatchCourse(courseId)
        setBatchStudents([])
        setSelectedBatchStudents([])
        if (!courseId) return
        
        try {
            const res = await studentsApi.getAll()
            const allStudents = res.data.students || []
            const enrolled = allStudents.filter((s: any) => s.courseId === courseId)
            
            const uniqueStudentsMap = new Map()
            enrolled.forEach((s: any) => {
                if (s.userId && !uniqueStudentsMap.has(s.userId)) {
                    uniqueStudentsMap.set(s.userId, s)
                }
            })
            const students = Array.from(uniqueStudentsMap.values())
            setBatchStudents(students)
            setSelectedBatchStudents(students.map((s: any) => s.userId))
        } catch (error) {
            console.error('Failed to fetch students for course', error)
        }
    }

    const handleBatchSelect = async (batchId: string) => {
        setSelectedBatchId(batchId)
        setBatchStudents([])
        setSelectedBatchStudents([])
        if (!batchId) return
        
        try {
            const res = await batchesApi.getStudents(batchId)
            const students = res.data.data || []
            const uniqueStudentsMap = new Map()
            students.forEach((s: any) => {
                if (s.id && !uniqueStudentsMap.has(s.id)) {
                    uniqueStudentsMap.set(s.id, s)
                }
            })
            const uniqueStudents = Array.from(uniqueStudentsMap.values())
            setBatchStudents(uniqueStudents)
            setSelectedBatchStudents(uniqueStudents.map((s: any) => s.id))
        } catch (error) {
            console.error('Failed to fetch students for batch', error)
        }
    }

    const handleGenerateBatch = async () => {
        const isReady = generationType === 'COURSE' ? selectedBatchCourse : selectedBatchId
        if (!isReady || selectedBatchStudents.length === 0) return
        
        let courseIdForGeneration = selectedBatchCourse
        if (generationType === 'BATCH') {
            const batch = batchesList.find(b => b.id === selectedBatchId)
            if (batch) courseIdForGeneration = batch.courseId
        }
        
        setIsGeneratingBatch(true)
        try {
            const data = {
                courseId: selectedBatchCourse || undefined,
                batchId: selectedBatchId || undefined,
                studentIds: selectedBatchStudents,
                templateId: selectedTemplateId || undefined,
                issueDate: issueDate || undefined
            }
            const res = await certificateApi.generateBulk(data)
            if (res.data) {
                toast.success('Batch generation complete!')
                setIsBatchModalOpen(false)
                fetchData() // Refresh list
            }
        } catch (error) {
            console.error('Batch generation failed', error)
            toast.error('Failed to generate certificates')
        } finally {
            setIsGeneratingBatch(false)
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
            status: c.status,
            isValid: c.isValid ? 'Valid' : 'Invalid'
        })), {
            filename: `certificates_export_${new Date().toISOString().split('T')[0]}`,
            headers: ['certificateId', 'studentName', 'courseName', 'issueDate', 'grade', 'status', 'isValid']
        })
    }

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            const res = await api.put(`/certificates/${id}/status`, {
                status: newStatus,
                revocationReason: newStatus === 'REVOKED' ? 'Admin action' : undefined
            });
            if (res.status === 200 || res.data?.success) {
                setCertificates(certificates.map(c => c.id === id ? { ...c, status: newStatus as any, isValid: newStatus === 'ISSUED' } : c))
                fetchData() // Refresh stats
            }
        } catch (error) {
            console.error('Failed to update status', error)
        }
    }

    const handleViewCertificate = (cert: Certificate) => {
        setPreviewCert(cert)
        setIsPreviewOpen(true)
    }

    const handleLinkedInShare = (uniqueId: string) => {
        const url = `${window.location.origin}/certificates/${uniqueId}`;
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    }

        const handleActionCertificate = (cert: Certificate, action: 'download' | 'print') => {
        let template = cert.template;
        if (!template && cert.templateId) {
            template = templates.find(t => t.id === cert.templateId);
        }
        if (!template && templates.length > 0) {
            template = templates.find(t => t.isDefault) || templates[0];
        }

        let certContent = '';
        if (template && template.canvasData) {
            try {
                const elements = typeof template.canvasData === 'string' ? JSON.parse(template.canvasData) : template.canvasData;
                
                const elementsHtml = elements.map((el: any) => {
                    let text = el.value || '';
                    text = text.replace('{{STUDENT_NAME}}', cert.studentName);
                    text = text.replace('{{COURSE_NAME}}', cert.courseName);
                    text = text.replace('{{ISSUE_DATE}}', new Date(cert.issueDate).toLocaleDateString());
                    text = text.replace('{{CERT_ID}}', cert.uniqueId);
                    text = text.replace('{{GRADE}}', cert.grade || 'N/A');
                    text = text.replace('{{DURATION}}', '4 Months');
                    text = text.replace('{{SIGNATORY_NAME}}', cert.signatoryName || settings?.defaultSignatoryName || 'U Purushottama Rao');
                    
                    if (el.type === 'qr' || el.type === 'barcode') {
                        return `<div style="position: absolute; left: ${el.x}%; top: ${el.y}%; transform: translate(-50%, -50%); font-family: ${el.fontFamily}; font-size: ${el.fontSize}px; color: ${el.color};">
                                <div style="text-align: center; font-size: 10px;">
                                    <div style="font-size: 24px; letter-spacing: 2px;">||| || ||| |</div>
                                    ${cert.uniqueId}
                                </div>
                            </div>`;
                    }
                    if (el.type === 'image' || text === '{{LOGO}}') {
                        return `<div style="position: absolute; left: ${el.x}%; top: ${el.y}%; transform: translate(-50%, -50%);">
                            <img src="${window.location.origin}/logo-light.png" alt="Logo" style="height: 40px; object-fit: contain;" />
                        </div>`;
                    }
                    
                    return `<div style="position: absolute; left: ${el.x}%; top: ${el.y}%; transform: translate(-50%, -50%); font-family: ${el.fontFamily}; font-size: ${el.fontSize}px; color: ${el.color}; max-width: 90%; text-align: center; word-wrap: break-word;">${text}</div>`;
                }).join('\n');

                const bgUrl = template.designUrl.startsWith('http') ? template.designUrl : window.location.origin + template.designUrl;
                
                certContent = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Certificate - ${cert.uniqueId}</title>
                        <style>
                            @page { size: landscape; margin: 0; }
                            body { margin: 0; padding: 0; width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; background: #fff; }
                            .cert-container { 
                                position: relative; 
                                width: 1122px; 
                                height: 793px; 
                                background-image: url('${bgUrl}'); 
                                background-size: contain; 
                                background-position: center; 
                                background-repeat: no-repeat;
                                page-break-inside: avoid;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="cert-container">
                            ${elementsHtml}
                        </div>
                        ${action === 'print' ? `<script>
                            window.onload = () => { setTimeout(() => window.print(), 500); }
                        </script>` : ''}
                    </body>
                    </html>
                `;
            } catch (error) {
                console.error("Failed to parse canvasData", error);
            }
        }

        if (!certContent) {
            // Premium Corporate Fallback Template
            certContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Certificate - ${cert.uniqueId}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Montserrat:wght@300;400;600&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
                        @page { size: landscape; margin: 0; }
                        body { 
                            margin: 0; padding: 0; 
                            width: 1122px; height: 793px; /* A4 Landscape */
                            display: flex; align-items: center; justify-content: center; 
                            background: #f9f9f9; 
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        .cert-container { 
                            position: relative; 
                            width: 1040px; 
                            height: 710px; 
                            background: #ffffff;
                            box-sizing: border-box;
                            border: 2px solid #cfb53b;
                            padding: 15px;
                            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                        }
                        .cert-inner {
                            position: relative;
                            width: 100%;
                            height: 100%;
                            border: 8px solid #0f172a;
                            box-sizing: border-box;
                            padding: 40px;
                            background: url('data:image/svg+xml;utf8,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><path d="M0 0l50 50L100 0v100H0z" fill="%23f8fafc" fill-opacity="0.5"/></svg>');
                            overflow: hidden;
                        }
                        .corner-tl, .corner-tr, .corner-bl, .corner-br {
                            position: absolute; width: 60px; height: 60px;
                            border: 4px solid #cfb53b;
                        }
                        .corner-tl { top: 20px; left: 20px; border-bottom: 0; border-right: 0; }
                        .corner-tr { top: 20px; right: 20px; border-bottom: 0; border-left: 0; }
                        .corner-bl { bottom: 20px; left: 20px; border-top: 0; border-right: 0; }
                        .corner-br { bottom: 20px; right: 20px; border-top: 0; border-left: 0; }
                        
                        .header { text-align: center; margin-bottom: 25px; }
                        .logo { height: 70px; margin-bottom: 10px; }
                        .title { 
                            font-family: 'Cinzel', serif; 
                            color: #cfb53b; 
                            font-size: 48px; 
                            letter-spacing: 6px; 
                            margin: 0;
                            text-transform: uppercase;
                        }
                        .subtitle { 
                            font-family: 'Montserrat', sans-serif; 
                            font-size: 14px; 
                            letter-spacing: 10px; 
                            color: #64748b; 
                            text-transform: uppercase;
                            margin-top: 5px;
                        }
                        
                        .content { text-align: center; margin-top: 40px; }
                        .presented-to { 
                            font-family: 'Montserrat', sans-serif; 
                            font-size: 16px; 
                            color: #475569; 
                            text-transform: uppercase;
                            letter-spacing: 2px;
                        }
                        .student-name { 
                            font-family: 'Playfair Display', serif; 
                            font-size: 56px; 
                            color: #0f172a; 
                            margin: 20px 0;
                            font-style: italic;
                        }
                        .divider {
                            width: 60%;
                            height: 2px;
                            background: linear-gradient(90deg, transparent, #cfb53b, transparent);
                            margin: 0 auto 30px auto;
                        }
                        .description { 
                            font-family: 'Montserrat', sans-serif; 
                            font-size: 16px; 
                            color: #475569;
                            line-height: 1.6;
                            max-width: 800px;
                            margin: 0 auto;
                        }
                        .course-name { 
                            font-family: 'Cinzel', serif; 
                            font-size: 28px; 
                            color: #0f172a; 
                            margin: 20px 0;
                            font-weight: 700;
                        }

                        .footer { 
                            position: absolute; 
                            bottom: 60px; 
                            left: 80px; 
                            right: 80px; 
                            display: flex; 
                            justify-content: space-between; 
                            align-items: flex-end;
                        }
                        .signature-block, .date-block { 
                            text-align: center; 
                            width: 250px; 
                        }
                        .signature-line { 
                            border-bottom: 2px solid #0f172a; 
                            margin-bottom: 10px;
                            height: 40px;
                        }
                        .sign-text { 
                            font-family: 'Montserrat', sans-serif; 
                            font-size: 14px; 
                            color: #0f172a; 
                            font-weight: 600;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                        }
                        .sign-title {
                            font-family: 'Montserrat', sans-serif; 
                            font-size: 12px; 
                            color: #64748b; 
                        }
                        
                        .badge {
                            position: absolute;
                            bottom: 35px;
                            left: 50%;
                            transform: translateX(-50%);
                            width: 100px;
                            height: 100px;
                            background: linear-gradient(135deg, #1D4ED8, #4f46e5);
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            border: 3px solid #ffffff;
                            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                        }
                        .badge-inner {
                            width: 86px;
                            height: 86px;
                            border-radius: 50%;
                            border: 2px dashed #ffffff;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            text-align: center;
                            color: #ffffff;
                            font-family: 'Cinzel', serif;
                        }
                        .badge-text { font-size: 9px; font-weight: bold; letter-spacing: 1px; }
                        .badge-year { font-size: 14px; margin-top: 2px; }

                        .meta-info {
                            position: absolute;
                            bottom: 20px;
                            left: 0;
                            right: 0;
                            text-align: center;
                            font-family: 'Montserrat', sans-serif;
                            font-size: 10px;
                            color: #94a3b8;
                            letter-spacing: 1px;
                        }
                    </style>
                </head>
                <body>
                    <div class="cert-container">
                        <div class="cert-inner">
                            <div class="corner-tl"></div>
                            <div class="corner-tr"></div>
                            <div class="corner-bl"></div>
                            <div class="corner-br"></div>
                            
                            <div class="header">
                                <!-- Logo Placement -->
                                <img src="${window.location.origin}/logo-light.png" alt="Techwell Logo" class="logo" style="height: 60px; margin-bottom: 20px;" onerror="this.style.display='none'" />
                                <h1 class="title">Certificate</h1>
                                <div class="subtitle">Of Achievement</div>
                            </div>
                            
                            <div class="content">
                                <div class="presented-to">This is proudly presented to</div>
                                <h2 class="student-name">${cert.studentName}</h2>
                                <div class="divider"></div>
                                <div class="description">For successfully completing the comprehensive training program and demonstrating outstanding proficiency in</div>
                                <h3 class="course-name">${cert.courseName}</h3>
                                ${cert.grade ? `<div class="description" style="margin-top: 10px;">Achieved with Grade: <strong style="color:#0f172a;">${cert.grade}</strong></div>` : ''}
                            </div>
                            
                            <div class="badge">
                                <div class="badge-inner">
                                    <div class="badge-text">OFFICIAL</div>
                                    <div class="badge-text">CERTIFIED</div>
                                    <div class="badge-year">${new Date(cert.issueDate).getFullYear()}</div>
                                </div>
                            </div>
                            
                            <div class="footer">
                                <div class="date-block">
                                    <div class="signature-line" style="display:flex; align-items:flex-end; justify-content:center; padding-bottom:5px; font-family:'Montserrat'; font-size:16px;">
                                        ${new Date(cert.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>
                                    <div class="sign-text">Date of Issue</div>
                                </div>
                                <div class="signature-block">
                                    <div class="signature-line">
                                        <!-- Signature Image Could Go Here -->
                                    </div>
                                    <div class="sign-text">${cert.signatoryName || settings?.defaultSignatoryName || 'U Purushottama Rao'}</div>
                                    <div class="sign-title">${cert.signatoryTitle || settings?.defaultSignatoryTitle || 'Managing Director'}</div>
                                </div>
                            </div>

                            <div class="meta-info">
                                VERIFICATION ID: ${cert.uniqueId} | VERIFY AT: ${window.location.origin}/certificate/${cert.uniqueId}
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `;
        }

        const blob = new Blob([certContent], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.target = '_blank'
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
                instituteLogoUrl: settings.instituteLogoUrl,
                approvalRequired: settings.approvalRequired,
                autoIssueOnCompletion: settings.autoIssueOnCompletion
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
                    {/* Analytics Dashboard */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-medium">Total Issued</CardTitle>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.issued}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                                <Loader2 className="h-4 w-4 text-yellow-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-medium">Revoked</CardTitle>
                                <XCircle className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">{stats.revoked}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
                                <Download className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.downloads}</div>
                            </CardContent>
                        </Card>
                    </div>

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
                            <div className="flex gap-2">
                                {hasPermission('CERTIFICATES', 'create') && (
                                    <Button variant="default" onClick={openBatchModal}>
                                        <Award className="mr-2 h-4 w-4" />
                                        Batch Generate
                                    </Button>
                                )}
                                <Button variant="outline" onClick={handleExportAll}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Export All
                                </Button>
                            </div>
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
                                                    {cert.status === 'PENDING' ? (
                                                        <span className="flex items-center gap-1 text-yellow-600 text-sm font-medium bg-yellow-100 w-fit px-2 py-0.5 rounded">
                                                            Pending
                                                        </span>
                                                    ) : cert.status === 'REVOKED' ? (
                                                        <span className="flex items-center gap-1 text-red-600 text-sm font-medium bg-red-100 w-fit px-2 py-0.5 rounded">
                                                            Revoked
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-green-600 text-sm font-medium bg-green-100 w-fit px-2 py-0.5 rounded">
                                                            Issued
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {cert.status === 'PENDING' && hasPermission('CERTIFICATES', 'update') && (
                                                        <Button variant="outline" size="sm" className="mr-2 text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleUpdateStatus(cert.id, 'ISSUED')}>
                                                            Approve
                                                        </Button>
                                                    )}
                                                    {cert.status === 'ISSUED' && hasPermission('CERTIFICATES', 'update') && (
                                                        <Button variant="outline" size="sm" className="mr-2 text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleUpdateStatus(cert.id, 'REVOKED')}>
                                                            Revoke
                                                        </Button>
                                                    )}
                                                    {cert.status === 'REVOKED' && hasPermission('CERTIFICATES', 'update') && (
                                                        <Button variant="outline" size="sm" className="mr-2 text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => handleUpdateStatus(cert.id, 'ISSUED')}>
                                                            Re-issue
                                                        </Button>
                                                    )}
                                                    <Button variant="ghost" size="sm" onClick={() => handleViewCertificate(cert)}>
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        View
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleActionCertificate(cert, 'download')}>
                                                        <Download className="h-4 w-4 mr-1" />
                                                        Download
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleActionCertificate(cert, 'print')}>
                                                        <Printer className="h-4 w-4 mr-1" />
                                                        Print
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleLinkedInShare(cert.uniqueId)}>
                                                        <Linkedin className="h-4 w-4 mr-1 text-blue-600" />
                                                        Share
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
                                <Button onClick={() => previewCert && handleActionCertificate(previewCert, 'download')}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                </Button>
                                <Button onClick={() => previewCert && handleActionCertificate(previewCert, 'print')}>
                                    <Printer className="h-4 w-4 mr-2" />
                                    Print
                                </Button>
                                <Button onClick={() => previewCert && handleLinkedInShare(previewCert.uniqueId)} variant="outline">
                                    <Linkedin className="h-4 w-4 mr-2 text-blue-600" />
                                    Share
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Batch Generate Dialog */}
                    <Dialog open={isBatchModalOpen} onOpenChange={setIsBatchModalOpen}>
                        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Batch Generate Certificates</DialogTitle>
                                <DialogDescription>Select a target and the students to generate certificates for.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="flex gap-4 mb-4">
                                    <Button 
                                        variant={generationType === 'COURSE' ? 'default' : 'outline'} 
                                        onClick={() => { setGenerationType('COURSE'); setBatchStudents([]); setSelectedBatchStudents([]); setSelectedBatchCourse(''); setSelectedBatchId(''); }}
                                    >
                                        By Course
                                    </Button>
                                    <Button 
                                        variant={generationType === 'BATCH' ? 'default' : 'outline'} 
                                        onClick={() => { setGenerationType('BATCH'); setBatchStudents([]); setSelectedBatchStudents([]); setSelectedBatchCourse(''); setSelectedBatchId(''); }}
                                    >
                                        By Created Batch
                                    </Button>
                                </div>
                            
                                {generationType === 'COURSE' ? (
                                    <div className="space-y-2">
                                        <Label>Select Course</Label>
                                        <select 
                                            className="w-full h-10 px-3 rounded-md border bg-background"
                                            value={selectedBatchCourse}
                                            onChange={(e) => handleCourseSelectForBatch(e.target.value)}
                                        >
                                            <option value="">-- Select a course --</option>
                                            {batchCourses.map(course => (
                                                <option key={course.id} value={course.id}>{course.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Label>Select Batch</Label>
                                        <select 
                                            className="w-full h-10 px-3 rounded-md border bg-background"
                                            value={selectedBatchId}
                                            onChange={(e) => handleBatchSelect(e.target.value)}
                                        >
                                            <option value="">-- Select a batch --</option>
                                            {batchesList.map(batch => (
                                                <option key={batch.id} value={batch.id}>{batch.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="space-y-2 mt-4">
                                    <Label>Select Template (Optional)</Label>
                                    <select 
                                        className="w-full h-10 px-3 rounded-md border bg-background"
                                        value={selectedTemplateId}
                                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                                    >
                                        <option value="">-- Premium Corporate Template (Default) --</option>
                                        {templates.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2 mt-4">
                                    <Label>Issue Date (Optional)</Label>
                                    <Input 
                                        type="date"
                                        value={issueDate}
                                        onChange={(e) => setIssueDate(e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">Leave blank to use today's date. Select a date to backdate the certificate.</p>
                                </div>

                                {(selectedBatchCourse || selectedBatchId) && (
                                    <div className="space-y-2 border rounded-md p-4 mt-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <Label>Eligible Students ({batchStudents.length})</Label>
                                            <Button 
                                                variant="outline" size="sm" 
                                                onClick={() => setSelectedBatchStudents(
                                                    selectedBatchStudents.length === batchStudents.length 
                                                    ? [] 
                                                    : batchStudents.map(s => s.id || s.userId)
                                                )}
                                            >
                                                {selectedBatchStudents.length === batchStudents.length ? 'Deselect All' : 'Select All'}
                                            </Button>
                                        </div>
                                        {batchStudents.length > 0 ? (
                                            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                                {batchStudents.map(student => {
                                                    const sId = student.id || student.userId;
                                                    return (
                                                    <div key={sId} className="flex items-center space-x-2">
                                                        <Switch 
                                                            checked={selectedBatchStudents.includes(sId)}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) {
                                                                    setSelectedBatchStudents([...selectedBatchStudents, sId])
                                                                } else {
                                                                    setSelectedBatchStudents(selectedBatchStudents.filter(id => id !== sId))
                                                                }
                                                            }}
                                                        />
                                                        <Label>{student.name} ({student.email})</Label>
                                                    </div>
                                                )})}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground text-center py-4">No enrolled students found for this selection.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsBatchModalOpen(false)}>Cancel</Button>
                                <Button 
                                    onClick={handleGenerateBatch} 
                                    disabled={
                                        (generationType === 'COURSE' && !selectedBatchCourse) || 
                                        (generationType === 'BATCH' && !selectedBatchId) || 
                                        selectedBatchStudents.length === 0 || 
                                        isGeneratingBatch
                                    }
                                >
                                    {isGeneratingBatch && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Generate {selectedBatchStudents.length} Certificates
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </TabsContent>

                {/* TEMPLATES TAB */}
                <TabsContent value="templates" className="mt-6">
                    <div className="flex justify-end mb-4">
                        {hasPermission('CERTIFICATES', 'create') && (
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
                        )}
                    </div>
                    <div className="space-y-8 mt-6">
                        {Object.entries(
                            templates.reduce((acc, template) => {
                                const category = template.purpose || 'Uncategorized';
                                if (!acc[category]) acc[category] = [];
                                acc[category].push(template);
                                return acc;
                            }, {} as Record<string, CertificateTemplate[]>)
                        ).map(([category, catsTemplates]) => (
                            <div key={category} className="mb-10">
                                <h3 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">{category}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {catsTemplates.map(template => (
                                        <Card key={template.id} className={template.isDefault ? 'border-primary ring-2 ring-primary/20' : ''}>
                                            <CardHeader className="pb-2">
                                                <div className="flex justify-between items-start">
                                                    <CardTitle className="text-base">{template.name}</CardTitle>
                                                    {template.isDefault && (
                                                        <span className="text-xs bg-primary text-white px-2 py-1 rounded shadow-sm">Default</span>
                                                    )}
                                                </div>
                                                {template.description && (
                                                    <CardDescription className="line-clamp-2">{template.description}</CardDescription>
                                                )}
                                            </CardHeader>
                                            <CardContent>
                                                <div className="aspect-[4/3] bg-slate-50 border rounded-lg flex items-center justify-center mb-4 overflow-hidden relative group">
                                                    {(() => {
                                                        const src = template.previewUrl || template.designUrl;
                                                        if (src && (src.startsWith('http') || src.startsWith('/'))) {
                                                            return (
                                                                <Image
                                                                    src={src}
                                                                    alt={template.name}
                                                                    layout="fill"
                                                                    objectFit="cover"
                                                                />
                                                            )
                                                        }
                                                        return (
                                                            <div className="flex flex-col items-center text-muted-foreground p-4 text-center">
                                                                <FileImage className="h-12 w-12 mb-2 opacity-30" />
                                                                <span className="text-xs font-medium text-slate-400">Design Studio Template</span>
                                                            </div>
                                                        )
                                                    })()}
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <Button 
                                                            variant="secondary" 
                                                            size="sm"
                                                            onClick={() => window.open(`/admin/certificates/designer/${template.id}`, '_blank')}
                                                        >
                                                            Open Studio
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="flex-1"
                                                        onClick={() => window.open(`/admin/certificates/designer/${template.id}`, '_blank')}
                                                    >
                                                        <Settings className="w-4 h-4 mr-2" />
                                                        Design Studio
                                                    </Button>
                                                    {!template.isDefault && hasPermission('CERTIFICATES', 'update') && (
                                                        <Button variant="secondary" size="sm" onClick={() => handleSetDefaultTemplate(template.id)}>
                                                            Make Default
                                                        </Button>
                                                    )}
                                                    {hasPermission('CERTIFICATES', 'delete') && (
                                                        <Button variant="ghost" size="sm" onClick={() => handleDeleteTemplate(template.id)}>
                                                            <Trash2 className="w-4 h-4 text-destructive" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
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
                        <CardContent className={`space-y-8 ${!hasPermission('CERTIFICATES', 'update') ? 'pointer-events-none opacity-80' : ''}`}>
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
                                                    placeholder="Techwell Academy"
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

                                    {/* Automation & Approvals */}
                                    <div className="space-y-4 border-t pt-6">
                                        <h3 className="font-semibold">Automation & Approvals</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                                                <div>
                                                    <Label className="text-base font-medium">Auto-Issue on Completion</Label>
                                                    <p className="text-sm text-muted-foreground">Automatically generate certificates when students complete courses.</p>
                                                </div>
                                                <Switch
                                                    checked={settings.autoIssueOnCompletion}
                                                    onCheckedChange={checked => setSettings({ ...settings, autoIssueOnCompletion: checked })}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                                                <div>
                                                    <Label className="text-base font-medium">Require Approval</Label>
                                                    <p className="text-sm text-muted-foreground">Generated certificates will remain PENDING until approved by an Admin.</p>
                                                </div>
                                                <Switch
                                                    checked={settings.approvalRequired}
                                                    onCheckedChange={checked => setSettings({ ...settings, approvalRequired: checked })}
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

                                    {hasPermission('CERTIFICATES', 'update') && (
                                        <div className="flex justify-end pt-4 border-t">
                                            <Button onClick={handleSaveSettings} disabled={isSaving}>
                                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                                Save Settings
                                            </Button>
                                        </div>
                                    )}
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
