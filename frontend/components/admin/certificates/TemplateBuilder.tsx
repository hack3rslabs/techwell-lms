'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UploadCloud, Save, Loader2, Move } from 'lucide-react';
import api from '@/lib/api';

interface ElementPos {
    id: string;
    label: string;
    x: number; // percentage
    y: number; // percentage
    fontSize: number; // px
    color: string;
    type?: 'text' | 'image' | 'qr';
}

const DEFAULT_ELEMENTS: ElementPos[] = [
    { id: 'studentName', label: '{Student Name}', x: 50, y: 50, fontSize: 32, color: '#000000', type: 'text' },
    { id: 'courseName', label: '{Course Name}', x: 50, y: 60, fontSize: 24, color: '#000000', type: 'text' },
    { id: 'issueDate', label: '{Issue Date}', x: 20, y: 80, fontSize: 16, color: '#000000', type: 'text' },
    { id: 'certificateId', label: '{Certificate ID}', x: 80, y: 80, fontSize: 16, color: '#000000', type: 'text' },
    { id: 'logo', label: '{Logo Placeholder}', x: 50, y: 20, fontSize: 16, color: '#000000', type: 'image' }
];

export default function TemplateBuilder({ 
    initialData, 
    onSave 
}: { 
    initialData?: any, 
    onSave: () => void 
}) {
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [orientation, setOrientation] = useState(initialData?.orientation || 'HORIZONTAL');
    const [purpose, setPurpose] = useState(initialData?.purpose || 'COURSE_COMPLETION');
    const [designUrl, setDesignUrl] = useState(initialData?.designUrl || '');
    const [borderColor, setBorderColor] = useState(initialData?.layout && !Array.isArray(JSON.parse(initialData.layout)) ? JSON.parse(initialData.layout).borderColor : '#cfb53b');
    const [borderWidth, setBorderWidth] = useState(initialData?.layout && !Array.isArray(JSON.parse(initialData.layout)) ? JSON.parse(initialData.layout).borderWidth : 0);
    
    const parseInitialElements = () => {
        if (!initialData?.layout) return DEFAULT_ELEMENTS;
        const parsed = JSON.parse(initialData.layout);
        return Array.isArray(parsed) ? parsed : (parsed.elements || DEFAULT_ELEMENTS);
    };
    
    const [elements, setElements] = useState<ElementPos[]>(parseInitialElements());
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Drag state
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('templateImage', file);

        try {
            const res = await api.post('/certificates/templates/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.designUrl) {
                setDesignUrl(res.data.designUrl);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const handleMouseDown = (id: string) => {
        setDraggingId(id);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!draggingId || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        let x = ((e.clientX - rect.left) / rect.width) * 100;
        let y = ((e.clientY - rect.top) / rect.height) * 100;

        // Clamp
        x = Math.max(0, Math.min(100, x));
        y = Math.max(0, Math.min(100, y));

        setElements(prev => prev.map(el => 
            el.id === draggingId ? { ...el, x, y } : el
        ));
    };

    const handleMouseUp = () => {
        setDraggingId(null);
    };

    const updateElementStyle = (id: string, field: keyof ElementPos, value: any) => {
        setElements(prev => prev.map(el => 
            el.id === id ? { ...el, [field]: value } : el
        ));
    };

    const handleSave = async () => {
        if (!name || !designUrl) {
            alert('Please provide a name and upload a design image.');
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                name,
                description,
                orientation,
                purpose,
                designUrl,
                previewUrl: designUrl,
                layout: JSON.stringify({ elements, borderColor, borderWidth }),
                isDefault: false
            };

            if (initialData?.id) {
                await api.put(`/certificates/admin/templates/${initialData.id}`, payload);
            } else {
                await api.post('/certificates/admin/templates', payload);
            }
            onSave();
        } catch (err) {
            console.error(err);
            alert('Failed to save template');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Template Details</CardTitle>
                    <CardDescription>Upload a background design (A4 format) and name your template.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Template Name</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Techwell Global Standard" />
                    </div>
                    <div className="space-y-2">
                        <Label>Orientation</Label>
                        <Select value={orientation} onValueChange={setOrientation}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="HORIZONTAL">Horizontal (Landscape)</SelectItem>
                                <SelectItem value="VERTICAL">Vertical (Portrait)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Purpose / Category</Label>
                        <Select value={purpose} onValueChange={setPurpose}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="COURSE_COMPLETION">Course Completion</SelectItem>
                                <SelectItem value="WORKSHOP">Workshop</SelectItem>
                                <SelectItem value="WEBINAR">Webinar</SelectItem>
                                <SelectItem value="TRAINING">Training</SelectItem>
                                <SelectItem value="APPRECIATION">Appreciation</SelectItem>
                                <SelectItem value="PARTICIPATION">Participation</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Upload Empty Certificate Design / Background (JPEG/PNG)</Label>
                        <div className="flex items-center space-x-4">
                            <Input type="file" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
                            {isUploading && <Loader2 className="animate-spin w-5 h-5 text-blue-500" />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Upload an existing blank certificate design. You will place the dynamic text fields and logo on top of it.</p>
                    </div>
                    <div className="space-y-2">
                        <Label>Border Width (px)</Label>
                        <Input type="number" min="0" max="50" value={borderWidth} onChange={e => setBorderWidth(parseInt(e.target.value) || 0)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Border Color</Label>
                        <Input type="color" value={borderColor} onChange={e => setBorderColor(e.target.value)} className="h-10 p-1" />
                    </div>
                </CardContent>
            </Card>

            {designUrl && (
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                    <Card className="xl:col-span-3">
                        <CardHeader>
                            <CardTitle>Visual Builder</CardTitle>
                            <CardDescription>Drag the elements to position them on the certificate.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div 
                                className="relative overflow-hidden shadow-inner"
                                style={{
                                    width: '100%',
                                    aspectRatio: orientation === 'HORIZONTAL' ? '1.414 / 1' : '1 / 1.414',
                                    backgroundColor: '#ffffff',
                                    backgroundImage: `url(${designUrl})`,
                                    backgroundSize: '100% 100%',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat',
                                    border: `${borderWidth}px solid ${borderColor}`
                                }}
                                ref={containerRef}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                            >
                                {elements.map((el) => (
                                    <div
                                        key={el.id}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            handleMouseDown(el.id);
                                        }}
                                        className="absolute cursor-move select-none flex items-center justify-center border border-transparent hover:border-blue-500 hover:bg-blue-500/10 transition-colors p-1"
                                        style={{
                                            left: `${el.x}%`,
                                            top: `${el.y}%`,
                                            transform: 'translate(-50%, -50%)',
                                            fontSize: `${el.fontSize}px`,
                                            color: el.color,
                                            fontWeight: 'bold',
                                            textShadow: '0px 0px 2px rgba(255,255,255,0.8)'
                                        }}
                                    >
                                        {el.type === 'image' ? (
                                            <div className="border-2 border-dashed border-gray-400 p-4 bg-white/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                                <Move className="w-4 h-4 mr-2 opacity-0 hover:opacity-100 transition-opacity text-blue-600" />
                                                Logo Placeholder
                                            </div>
                                        ) : (
                                            <>
                                                <Move className="w-4 h-4 mr-2 opacity-0 hover:opacity-100 transition-opacity text-blue-600" />
                                                {el.label}
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Text Styling</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {elements.map((el) => (
                                <div key={el.id} className="space-y-2 pb-4 border-b last:border-0">
                                    <Label className="font-semibold text-blue-600">{el.label}</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <Label className="text-xs">Font Size (px)</Label>
                                            <Input 
                                                type="number" 
                                                value={el.fontSize} 
                                                onChange={e => updateElementStyle(el.id, 'fontSize', parseInt(e.target.value))} 
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Color</Label>
                                            <Input 
                                                type="color" 
                                                value={el.color} 
                                                onChange={e => updateElementStyle(el.id, 'color', e.target.value)}
                                                className="p-1 h-9"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={onSave}>Cancel</Button>
                <Button onClick={handleSave} disabled={isSaving || !designUrl}>
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Template
                </Button>
            </div>
        </div>
    );
}
