"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
    Loader2, ArrowLeft, Save, Undo, Redo, Download, 
    Copy, Trash2, AlignLeft, AlignCenter, AlignRight,
    BringToFront, SendToBack, Grid3X3, Eye, EyeOff
} from 'lucide-react';
import { certificateApi } from '@/lib/api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface CanvasElement {
    id: string;
    type: 'text' | 'qr' | 'image' | 'shape';
    value: string;
    x: number;
    y: number;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    fontWeight?: string | number;
    letterSpacing?: number;
    textAlign?: 'left' | 'center' | 'right';
    textTransform?: 'none' | 'uppercase' | 'capitalize';
    zIndex?: number;
    isLocked?: boolean;
}

interface TemplateStyle {
    borderColor: string;
    borderWidth: number;
    backgroundColor?: string;
    orientation: 'HORIZONTAL' | 'VERTICAL';
}

const AVAILABLE_FIELDS = [
    { label: 'Student Name', value: '{{STUDENT_NAME}}' },
    { label: 'Certificate Title', value: '{{CERT_TITLE}}' },
    { label: 'Course/Event Name', value: '{{COURSE_NAME}}' },
    { label: 'Duration / Hours', value: '{{TRAINING_HOURS}}' },
    { label: 'Completion Date', value: '{{COMPLETION_DATE}}' },
    { label: 'Issue Date', value: '{{ISSUE_DATE}}' },
    { label: 'Certificate Number', value: '{{CERT_ID}}' },
    { label: 'Credential ID', value: '{{CREDENTIAL_ID}}' },
    { label: 'Grade / Percentage', value: '{{GRADE}}' },
    { label: 'Skills Acquired', value: '{{SKILLS}}' },
    { label: 'Institute Name', value: '{{INSTITUTE_NAME}}' },
    { label: 'Organization Name', value: '{{ORG_NAME}}' },
    { label: 'Trainer Name', value: '{{TRAINER_NAME}}' },
    { label: 'QR Verification', value: '{{QR_CODE}}', type: 'qr' },
    { label: 'Barcode', value: '{{BARCODE}}', type: 'image' },
    { label: 'Institute Logo', value: '{{LOGO}}', type: 'image' },
    { label: 'Watermark', value: '{{WATERMARK}}', type: 'image' },
    { label: 'Digital Seal', value: '{{STAMP}}', type: 'image' },
    { label: 'Authorized Signatory', value: '{{SIGNATURE_1}}', type: 'image' },
    { label: 'Trainer Signature', value: '{{SIGNATURE_2}}', type: 'image' },
    { label: 'Director Signature', value: '{{SIGNATURE_3}}', type: 'image' },
    { label: 'Custom Text', value: 'Double click to edit', type: 'text' },
];

const SVG_ELEMENTS = [
    { label: 'Gold Badge', value: '🏆', type: 'text' },
    { label: 'Security Shield', value: '🛡️', type: 'text' },
    { label: 'Academic Star', value: '⭐', type: 'text' },
    { label: 'Checkmark Seal', value: '✅', type: 'text' },
    { label: 'Excellence Ribbon', value: '🎖️', type: 'text' },
    { label: 'Corporate Globe', value: '🌐', type: 'text' },
    { label: 'Graduation Cap', value: '🎓', type: 'text' },
    { label: 'Verified Mark', value: '✔️', type: 'text' }
];

const PREVIEW_DATA: Record<string, string> = {
    '{{STUDENT_NAME}}': 'Alexander Smith',
    '{{CERT_TITLE}}': 'Certificate of Completion',
    '{{COURSE_NAME}}': 'Advanced React & Next.js Enterprise Masterclass',
    '{{TRAINING_HOURS}}': '120 Hours',
    '{{COMPLETION_DATE}}': 'August 15, 2026',
    '{{ISSUE_DATE}}': 'August 16, 2026',
    '{{CERT_ID}}': 'CERT-2026-98452',
    '{{CREDENTIAL_ID}}': 'CRED-7734-ABCD',
    '{{GRADE}}': 'A+ (98%)',
    '{{SKILLS}}': 'React, Next.js, Node, Architecture, AWS',
    '{{INSTITUTE_NAME}}': 'Techwell Academy',
    '{{ORG_NAME}}': 'Techwell Corporation',
    '{{TRAINER_NAME}}': 'Dr. Sarah Johnson'
};

const COLOR_PALETTES = [
    '#0f172a', '#1e293b', // Slate
    '#000000', '#ffffff', // B/W
    '#1d4ed8', '#2563eb', // Blue
    '#b45309', '#d97706', // Gold / Bronze
    '#047857', '#059669', // Emerald
    '#be123c', '#e11d48'  // Rose
];

const FONTS = ['Inter', 'Roboto', 'Montserrat', 'Playfair Display', 'Cinzel', 'Outfit', 'Open Sans', 'Lato'];

// Custom Hook for Undo/Redo
function useHistory(initialState: CanvasElement[]) {
    const [history, setHistory] = useState<CanvasElement[][]>([initialState]);
    const [pointer, setPointer] = useState(0);

    const set = useCallback((newState: CanvasElement[]) => {
        setHistory(prev => [...prev.slice(0, pointer + 1), newState]);
        setPointer(prev => prev + 1);
    }, [pointer]);

    const undo = useCallback(() => setPointer(prev => Math.max(0, prev - 1)), []);
    const redo = useCallback(() => setPointer(prev => Math.min(history.length - 1, prev + 1)), [history.length]);

    return [history[pointer] || [], set, undo, redo, pointer > 0, pointer < history.length - 1] as const;
}

export default function EnterpriseDesignStudio() {
    const params = useParams();
    const router = useRouter();
    const templateId = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    
    const [template, setTemplate] = useState<any>(null);
    const [templateStyle, setTemplateStyle] = useState<TemplateStyle>({ 
        borderColor: '#0f172a', borderWidth: 0, backgroundColor: '#ffffff', orientation: 'HORIZONTAL' 
    });
    
    const [elements, setElements, undo, redo, canUndo, canRedo] = useHistory([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [snapToGrid, setSnapToGrid] = useState(true);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [alignmentGuides, setAlignmentGuides] = useState<{x: number | null, y: number | null}>({x: null, y: null});
    const canvasRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchTemplate();
    }, [templateId]);

    const fetchTemplate = async () => {
        try {
            const res = await certificateApi.getTemplates();
            const found = res.data.templates.find((t: any) => t.id === templateId);
            if (found) {
                setTemplate(found);
                if (found.canvasData) {
                    try {
                        const parsed = JSON.parse(found.canvasData);
                        if (parsed.elements) {
                            // Initial load skips history recording to prevent immediate undo to blank
                            setElements(parsed.elements);
                        } else if (Array.isArray(parsed)) {
                            setElements(parsed);
                        }
                        if (parsed.style) setTemplateStyle(parsed.style);
                    } catch (e) { console.error('Failed to parse canvasData', e); }
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (isDuplicate = false) => {
        setIsSaving(true);
        try {
            const payload = {
                ...template,
                name: isDuplicate ? `${template.name} (Copy)` : template.name,
                canvasData: JSON.stringify({ elements, style: templateStyle })
            };
            
            if (isDuplicate) {
                await fetch(`/api/certificates/admin/templates`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                    body: JSON.stringify(payload)
                });
                alert('Template duplicated successfully!');
                router.push('/admin/certificates');
            } else {
                await fetch(`/api/certificates/admin/templates/${templateId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                    body: JSON.stringify(payload)
                });
                alert('Design saved successfully!');
            }
        } catch (error) {
            alert('Failed to save design');
        } finally {
            setIsSaving(false);
        }
    };

    const exportToPDF = async () => {
        if (!canvasRef.current) return;
        setIsExporting(true);
        try {
            // High quality render
            const canvas = await html2canvas(canvasRef.current, { scale: 3, useCORS: true, logging: false });
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const pdf = new jsPDF({
                orientation: templateStyle.orientation === 'HORIZONTAL' ? 'l' : 'p',
                unit: 'mm',
                format: 'a4'
            });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${template?.name || 'certificate'}-export.pdf`);
        } catch (error) {
            console.error(error);
            alert('Export failed');
        } finally {
            setIsExporting(false);
        }
    };

    const addElement = (field: any) => {
        const newEl: CanvasElement = {
            id: Date.now().toString(),
            type: field.type || 'text',
            value: field.value,
            x: 50,
            y: 50,
            fontSize: field.type === 'image' ? (field.value === '{{WATERMARK}}' ? 300 : 80) : 24,
            color: '#0f172a',
            fontFamily: 'Inter',
            textAlign: 'center',
            zIndex: elements.length + 1
        };
        setElements([...elements, newEl]);
        setSelectedId(newEl.id);
    };

    const updateElement = (id: string, changes: Partial<CanvasElement>) => {
        setElements(elements.map(el => el.id === id ? { ...el, ...changes } : el));
    };

    const deleteElement = () => {
        if (!selectedId) return;
        setElements(elements.filter(e => e.id !== selectedId));
        setSelectedId(null);
    };

    const bringForward = () => {
        if (!selectedId) return;
        const el = elements.find(e => e.id === selectedId);
        if (!el) return;
        const maxZ = Math.max(...elements.map(e => e.zIndex || 0), 0);
        updateElement(selectedId, { zIndex: maxZ + 1 });
    };

    const sendBackward = () => {
        if (!selectedId) return;
        const el = elements.find(e => e.id === selectedId);
        if (!el) return;
        const minZ = Math.min(...elements.map(e => e.zIndex || 0), 0);
        updateElement(selectedId, { zIndex: minZ - 1 });
    };

    const handleDragStart = (e: React.DragEvent, id: string) => {
        const el = elements.find(e => e.id === id);
        if (el?.isLocked) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.setData('elementId', id);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const id = e.dataTransfer.getData('elementId');
        if (!id || !canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        let rawX = ((e.clientX - rect.left) / rect.width) * 100;
        let rawY = ((e.clientY - rect.top) / rect.height) * 100;
        
        let snappedX = false;
        let snappedY = false;

        // Snap to other elements (within 1.5%) and center
        elements.forEach(el => {
            if (el.id !== id) {
                if (Math.abs(el.x - rawX) < 1.5) { rawX = el.x; snappedX = true; }
                if (Math.abs(el.y - rawY) < 1.5) { rawY = el.y; snappedY = true; }
            }
        });
        
        if (Math.abs(50 - rawX) < 1.5) { rawX = 50; snappedX = true; }
        if (Math.abs(50 - rawY) < 1.5) { rawY = 50; snappedY = true; }

        // Grid Snapping (snap to nearest 2.5%)
        if (snapToGrid) {
            if (!snappedX) rawX = Math.round(rawX / 2.5) * 2.5;
            if (!snappedY) rawY = Math.round(rawY / 2.5) * 2.5;
        }

        rawX = Math.max(2, Math.min(98, rawX));
        rawY = Math.max(2, Math.min(98, rawY));

        setAlignmentGuides({ x: snappedX ? rawX : null, y: snappedY ? rawY : null });
        setTimeout(() => setAlignmentGuides({ x: null, y: null }), 1500); // Clear guides after 1.5s

        updateElement(id, { x: rawX, y: rawY });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append('templateImage', file);
        try {
            const res = await certificateApi.uploadTemplateImage(formData);
            if (res.data.designUrl) {
                setTemplate({ ...template, designUrl: res.data.designUrl });
            }
        } catch (err) { alert('Failed to upload image'); } 
        finally { setIsUploading(false); }
    };

    if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

    const selectedElement = elements.find(e => e.id === selectedId);

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 font-sans">
            {/* Top Navigation */}
            <div className="flex items-center justify-between p-3 border-b bg-white shadow-sm">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/admin/certificates')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-lg font-bold text-slate-800">Design Studio</h1>
                        <input 
                            className="text-xs text-slate-500 bg-transparent border-none outline-none hover:bg-slate-100 px-1 rounded" 
                            value={template?.name || ''} 
                            onChange={e => setTemplate({...template, name: e.target.value})}
                        />
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={undo} disabled={!canUndo} title="Undo">
                        <Undo className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={redo} disabled={!canRedo} title="Redo">
                        <Redo className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-slate-200 mx-2" />
                    <Button variant={isPreviewMode ? "default" : "outline"} onClick={() => setIsPreviewMode(!isPreviewMode)}>
                        {isPreviewMode ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                        {isPreviewMode ? 'Edit Mode' : 'Live Preview'}
                    </Button>
                    <div className="w-px h-6 bg-slate-200 mx-2" />
                    <Button variant="outline" onClick={() => handleSave(true)} disabled={isSaving}>
                        <Copy className="mr-2 h-4 w-4" /> Duplicate
                    </Button>
                    <Button variant="outline" onClick={exportToPDF} disabled={isExporting}>
                        {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        Export PDF
                    </Button>
                    <Button onClick={() => handleSave(false)} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Template
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar - Elements */}
                <div className="w-72 border-r bg-white flex flex-col shadow-[2px_0_10px_rgba(0,0,0,0.03)] z-10">
                    <div className="p-4 border-b">
                        <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
                            <Grid3X3 className="h-4 w-4" /> Grid & Canvas
                        </h3>
                        <label className="flex items-center gap-2 text-sm cursor-pointer mb-3">
                            <input type="checkbox" checked={snapToGrid} onChange={(e) => setSnapToGrid(e.target.checked)} className="rounded text-blue-600" />
                            Snap to Grid (2.5%)
                        </label>
                        <select 
                            className="w-full p-2 border rounded text-sm mb-3"
                            value={templateStyle.orientation}
                            onChange={(e) => setTemplateStyle({...templateStyle, orientation: e.target.value as any})}
                        >
                            <option value="HORIZONTAL">A4 Landscape</option>
                            <option value="VERTICAL">A4 Portrait</option>
                        </select>
                        <div className="mb-2">
                            <label className="text-xs font-medium text-slate-500">Background Upload</label>
                            <input type="file" accept="image/*" className="w-full text-xs mt-1" onChange={handleFileUpload} disabled={isUploading}/>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        <h3 className="font-semibold text-slate-800 mb-2">Dynamic Fields</h3>
                        {AVAILABLE_FIELDS.map(field => (
                            <button 
                                key={field.value}
                                onClick={() => addElement(field)}
                                className="w-full text-left px-3 py-2 text-sm border rounded-md hover:bg-slate-50 hover:border-blue-300 transition-colors flex items-center justify-between group"
                            >
                                <span>{field.label}</span>
                                <span className="text-xs text-slate-400 opacity-0 group-hover:opacity-100">Add</span>
                            </button>
                        ))}
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 border-t space-y-2">
                        <h3 className="font-semibold text-slate-800 mb-2">Icons & Shapes</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {SVG_ELEMENTS.map(field => (
                                <button 
                                    key={field.value}
                                    onClick={() => addElement(field)}
                                    className="w-full text-center px-3 py-2 text-2xl border rounded-md hover:bg-slate-50 hover:border-blue-300 transition-colors"
                                >
                                    {field.value}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Canvas Workspace */}
                <div 
                    className="flex-1 bg-slate-100 overflow-auto flex items-center justify-center p-8"
                    onClick={() => setSelectedId(null)}
                >
                    <div 
                        ref={canvasRef}
                        className="relative bg-white shadow-2xl overflow-hidden print-precise"
                        style={{ 
                            width: templateStyle.orientation === 'HORIZONTAL' ? '1122px' : '794px', 
                            height: templateStyle.orientation === 'HORIZONTAL' ? '794px' : '1122px', 
                            backgroundColor: templateStyle.backgroundColor,
                            backgroundImage: template?.designUrl ? `url(${template.designUrl})` : 'none',
                            backgroundSize: '100% 100%',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            border: `${templateStyle.borderWidth}px solid ${templateStyle.borderColor}`
                        }}
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                    >
                        {!template?.designUrl && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                                <span>No background image.</span>
                            </div>
                        )}

                        {alignmentGuides.x !== null && (
                            <div className="absolute top-0 bottom-0 border-l border-blue-500 border-dashed z-50 pointer-events-none" style={{ left: `${alignmentGuides.x}%` }} />
                        )}
                        {alignmentGuides.y !== null && (
                            <div className="absolute left-0 right-0 border-t border-blue-500 border-dashed z-50 pointer-events-none" style={{ top: `${alignmentGuides.y}%` }} />
                        )}

                        {elements.map(el => (
                            <div
                                key={el.id}
                                draggable={!el.isLocked}
                                onDragStart={(e) => handleDragStart(e, el.id)}
                                onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}
                                className={`absolute px-2 py-1 select-none whitespace-pre-wrap outline-none ${selectedId === el.id ? "ring-2 ring-blue-500 bg-blue-500/10" : "hover:ring-1 hover:ring-blue-300/50"} ${el.isLocked ? 'cursor-default' : 'cursor-move'}`}
                                style={{
                                    left: el.x + "%",
                                    top: el.y + "%",
                                    transform: "translate(-50%, -50%)",
                                    fontSize: el.fontSize + "px",
                                    fontFamily: el.fontFamily,
                                    color: el.color,
                                    fontWeight: el.fontWeight,
                                    letterSpacing: (el.letterSpacing || 0) + 'px',
                                    textAlign: el.textAlign,
                                    textTransform: el.textTransform,
                                    zIndex: el.zIndex || 1,
                                    width: el.type === 'text' ? 'max-content' : undefined,
                                    maxWidth: '90%'
                                }}
                            >
                                {el.type === 'qr' ? (
                                    <div className="w-24 h-24 bg-white border border-slate-200 flex flex-col items-center justify-center p-2">
                                        <div className="w-full h-full bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=example')] bg-cover opacity-50"/>
                                    </div>
                                ) : el.type === 'image' ? (
                                    <div className={`flex items-center justify-center font-bold border-2 border-dashed border-slate-300 bg-white/30 backdrop-blur-sm ${
                                        el.value === '{{WATERMARK}}' ? 'w-[400px] h-[400px] rounded-full opacity-20 text-slate-400 text-3xl' :
                                        el.value === '{{STAMP}}' ? 'w-32 h-32 rounded-full text-red-600 border-red-400 text-xl' :
                                        el.value.includes('SIGNATURE') ? 'w-48 h-20 text-blue-900 font-script italic' :
                                        el.value === '{{LOGO}}' ? 'w-32 h-32 rounded-lg' :
                                        'w-48 h-20 text-slate-500'
                                    }`}>
                                        {el.value.replace(/[{}]/g, '')}
                                    </div>
                                ) : (
                                    isPreviewMode ? (PREVIEW_DATA[el.value] || el.value) : el.value
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Sidebar - Properties */}
                <div className="w-72 border-l bg-white flex flex-col shadow-[-2px_0_10px_rgba(0,0,0,0.03)] z-10">
                    <div className="p-4 border-b">
                        <h3 className="font-semibold text-slate-800">Properties</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                        {selectedElement ? (
                            <div className="space-y-5">
                                {/* Type-Specific properties */}
                                {selectedElement.type === 'text' && (
                                    <>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Font Family</label>
                                            <select 
                                                className="w-full mt-1 p-2 border rounded-md text-sm"
                                                value={selectedElement.fontFamily}
                                                onChange={(e) => updateElement(selectedElement.id, { fontFamily: e.target.value })}
                                            >
                                                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Size</label>
                                                <input 
                                                    type="number" className="w-full mt-1 p-2 border rounded-md text-sm"
                                                    value={selectedElement.fontSize || 24}
                                                    onChange={(e) => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Weight</label>
                                                <select className="w-full mt-1 p-2 border rounded-md text-sm"
                                                    value={selectedElement.fontWeight || 'normal'}
                                                    onChange={(e) => updateElement(selectedElement.id, { fontWeight: e.target.value })}
                                                >
                                                    <option value="normal">Normal</option>
                                                    <option value="bold">Bold</option>
                                                    <option value="900">Black</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Spacing</label>
                                            <input 
                                                type="range" min="0" max="20" step="1"
                                                className="w-full mt-1"
                                                value={selectedElement.letterSpacing || 0}
                                                onChange={(e) => updateElement(selectedElement.id, { letterSpacing: parseInt(e.target.value) })}
                                            />
                                        </div>
                                        <div className="flex gap-1 bg-slate-100 p-1 rounded-md">
                                            <Button variant={selectedElement.textAlign === 'left' ? 'secondary' : 'ghost'} size="icon" className="h-8 flex-1" onClick={() => updateElement(selectedElement.id, { textAlign: 'left' })}><AlignLeft className="h-4 w-4"/></Button>
                                            <Button variant={selectedElement.textAlign === 'center' ? 'secondary' : 'ghost'} size="icon" className="h-8 flex-1" onClick={() => updateElement(selectedElement.id, { textAlign: 'center' })}><AlignCenter className="h-4 w-4"/></Button>
                                            <Button variant={selectedElement.textAlign === 'right' ? 'secondary' : 'ghost'} size="icon" className="h-8 flex-1" onClick={() => updateElement(selectedElement.id, { textAlign: 'right' })}><AlignRight className="h-4 w-4"/></Button>
                                        </div>
                                    </>
                                )}
                                
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Color</label>
                                    <div className="flex gap-2 mt-1 mb-2">
                                        <input 
                                            type="color" 
                                            className="h-9 w-12 rounded cursor-pointer border p-0.5"
                                            value={selectedElement.color || '#000000'}
                                            onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                                        />
                                        <input 
                                            type="text" 
                                            className="flex-1 border rounded-md px-3 text-sm font-mono"
                                            value={selectedElement.color || '#000000'}
                                            onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {COLOR_PALETTES.map(color => (
                                            <button 
                                                key={color}
                                                className="w-6 h-6 rounded border border-slate-200 cursor-pointer hover:scale-110 transition-transform"
                                                style={{ backgroundColor: color }}
                                                onClick={() => updateElement(selectedElement.id, { color })}
                                                title={color}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Layers & Lock</label>
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        <Button variant="outline" size="sm" onClick={bringForward}><BringToFront className="mr-2 h-4 w-4"/> Forward</Button>
                                        <Button variant="outline" size="sm" onClick={sendBackward}><SendToBack className="mr-2 h-4 w-4"/> Back</Button>
                                    </div>
                                    <Button 
                                        variant={selectedElement.isLocked ? 'secondary' : 'outline'} 
                                        size="sm" 
                                        className="w-full"
                                        onClick={() => updateElement(selectedElement.id, { isLocked: !selectedElement.isLocked })}
                                    >
                                        {selectedElement.isLocked ? 'Unlock Element' : 'Lock Element'}
                                    </Button>
                                </div>

                                <div className="pt-4 border-t">
                                    <Button variant="destructive" className="w-full" onClick={deleteElement} disabled={selectedElement.isLocked}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete Element
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-slate-400 mt-10">
                                <p className="text-sm">Select an element to edit its properties</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
