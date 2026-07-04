"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2, ArrowLeft, Save, Move } from 'lucide-react'
import { certificateApi } from '@/lib/api'

interface CanvasElement {
    id: string;
    type: 'text' | 'qr';
    value: string;
    x: number;
    y: number;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
}

export default function CertificateDesignerPage() {
    const params = useParams()
    const router = useRouter()
    const templateId = params.id as string

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [template, setTemplate] = useState<any>(null)
    const [elements, setElements] = useState<CanvasElement[]>([])
    const [selectedElement, setSelectedElement] = useState<string | null>(null)
    const canvasRef = useRef<HTMLDivElement>(null)

    const AVAILABLE_FIELDS = [
        { label: 'Student Name', value: '{{STUDENT_NAME}}' },
        { label: 'Course Name', value: '{{COURSE_NAME}}' },
        { label: 'Issue Date', value: '{{ISSUE_DATE}}' },
        { label: 'Certificate ID', value: '{{CERT_ID}}' },
        { label: 'Grade', value: '{{GRADE}}' },
        { label: 'QR Code', value: '{{QR_CODE}}', type: 'qr' }
    ]

    useEffect(() => {
        fetchTemplate()
    }, [templateId])

    const fetchTemplate = async () => {
        try {
            const res = await certificateApi.getTemplates() // Assuming we get all and filter, or we need a GET /:id endpoint
            const found = res.data.templates.find((t: any) => t.id === templateId)
            if (found) {
                setTemplate(found)
                if (found.canvasData) {
                    try {
                        setElements(JSON.parse(found.canvasData))
                    } catch (e) { }
                }
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await fetch(`/api/certificates/admin/templates/${templateId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Ensure auth
                },
                body: JSON.stringify({
                    ...template,
                    canvasData: JSON.stringify(elements)
                })
            })
            alert('Design saved successfully!')
        } catch (error) {
            alert('Failed to save design')
        } finally {
            setIsSaving(false)
        }
    }

    const addElement = (field: any) => {
        const newEl: CanvasElement = {
            id: Date.now().toString(),
            type: field.type || 'text',
            value: field.value,
            x: 50,
            y: 50,
            fontSize: 24,
            color: '#000000',
            fontFamily: 'Arial'
        }
        setElements([...elements, newEl])
    }

    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.setData('elementId', id)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const id = e.dataTransfer.getData('elementId')
        if (!id || !canvasRef.current) return

        const rect = canvasRef.current.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100

        setElements(elements.map(el => el.id === id ? { ...el, x, y } : el))
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
    }

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 border-b bg-background">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/admin/certificates')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold">Certificate Designer</h1>
                        <p className="text-sm text-muted-foreground">{template?.name}</p>
                    </div>
                </div>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Design
                </Button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-64 border-r bg-muted/20 p-4 space-y-6 overflow-y-auto">
                    <div>
                        <h3 className="font-semibold mb-3">Dynamic Fields</h3>
                        <div className="space-y-2">
                            {AVAILABLE_FIELDS.map(field => (
                                <Button 
                                    key={field.value} 
                                    variant="outline" 
                                    className="w-full justify-start text-sm"
                                    onClick={() => addElement(field)}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    {field.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {selectedElement && (
                        <div>
                            <h3 className="font-semibold mb-3">Properties</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-muted-foreground">Font Size (px)</label>
                                    <input 
                                        type="number" 
                                        className="w-full p-2 border rounded mt-1"
                                        value={elements.find(e => e.id === selectedElement)?.fontSize || 24}
                                        onChange={e => setElements(elements.map(el => el.id === selectedElement ? { ...el, fontSize: parseInt(e.target.value) } : el))}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground">Color</label>
                                    <input 
                                        type="color" 
                                        className="w-full h-10 border rounded mt-1 p-1"
                                        value={elements.find(e => e.id === selectedElement)?.color || '#000000'}
                                        onChange={e => setElements(elements.map(el => el.id === selectedElement ? { ...el, color: e.target.value } : el))}
                                    />
                                </div>
                                <Button 
                                    variant="destructive" 
                                    size="sm" 
                                    className="w-full"
                                    onClick={() => {
                                        setElements(elements.filter(e => e.id !== selectedElement))
                                        setSelectedElement(null)
                                    }}
                                >
                                    Delete Element
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Canvas Workspace */}
                <div className="flex-1 bg-muted/50 p-8 overflow-auto flex items-center justify-center">
                    <Card 
                        ref={canvasRef}
                        className="relative bg-white shadow-2xl overflow-hidden"
                        style={{ 
                            width: '1000px', 
                            height: '707px', // A4 Landscape ratio (1.414)
                            backgroundImage: `url(${template?.designUrl})`,
                            backgroundSize: 'contain',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat'
                        }}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                    >
                        {!template?.designUrl && (
                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                No background image set.
                            </div>
                        )}

                        {elements.map(el => (
                            <div
                                key={el.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, el.id)}
                                onClick={() => setSelectedElement(el.id)}
                                className={`absolute cursor-move px-2 py-1 select-none whitespace-nowrap ${selectedElement === el.id ? 'ring-2 ring-primary bg-primary/10' : 'hover:ring-1 hover:ring-primary/50'}`}
                                style={{
                                    left: `${el.x}%`,
                                    top: `${el.y}%`,
                                    transform: 'translate(-50%, -50%)',
                                    fontSize: `${el.fontSize}px`,
                                    fontFamily: el.fontFamily,
                                    color: el.color
                                }}
                            >
                                {el.type === 'qr' ? (
                                    <div className="w-24 h-24 bg-gray-200 border-2 border-dashed border-gray-400 flex items-center justify-center text-xs text-gray-500">
                                        QR Code
                                    </div>
                                ) : (
                                    el.value
                                )}
                            </div>
                        ))}
                    </Card>
                </div>
            </div>
        </div>
    )
}

function Plus(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
}
