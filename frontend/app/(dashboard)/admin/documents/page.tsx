"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, FileText, Trash2, Download, Search, ShieldCheck } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export default function DocumentVaultPage() {
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [uploading, setUploading] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const res = await api.get('/documents');
            setDocuments(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load documents');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return toast.error('Please select a PDF file');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', name);
        formData.append('description', description);

        try {
            setUploading(true);
            await api.post('/documents', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Document uploaded securely!');
            setName('');
            setDescription('');
            setFile(null);
            fetchDocuments();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to permanently delete this document?')) return;
        try {
            await api.delete(`/documents/${id}`);
            toast.success('Document deleted');
            fetchDocuments();
        } catch (error) {
            toast.error('Failed to delete document');
        }
    };

    const filteredDocs = documents.filter(doc => 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center text-slate-800">
                        <ShieldCheck className="h-8 w-8 mr-3 text-blue-600" />
                        Secure Document Vault
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage private admin-only documents and PDFs</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upload Form */}
                <Card className="lg:col-span-1 shadow-sm border">
                    <CardHeader>
                        <CardTitle>Upload Document</CardTitle>
                        <CardDescription>Only PDF format is supported</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Document Name <span className="text-red-500">*</span></Label>
                                <Input 
                                    required 
                                    placeholder="e.g. Employee Handbook 2024" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input 
                                    placeholder="Optional description" 
                                    value={description} 
                                    onChange={(e) => setDescription(e.target.value)} 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>PDF File <span className="text-red-500">*</span></Label>
                                <Input 
                                    type="file" 
                                    accept=".pdf" 
                                    required
                                    onChange={(e) => setFile(e.target.files?.[0] || null)} 
                                    className="cursor-pointer"
                                />
                            </div>
                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={uploading}>
                                {uploading ? 'Encrypting & Uploading...' : (
                                    <>
                                        <UploadCloud className="h-4 w-4 mr-2" />
                                        Secure Upload
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Vault Grid */}
                <Card className="lg:col-span-2 shadow-sm border">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle>Vault Records</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search vault..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="p-8 text-center text-muted-foreground">Decrypting vault contents...</div>
                        ) : filteredDocs.length === 0 ? (
                            <div className="p-12 text-center border-2 border-dashed rounded-lg bg-slate-50 mt-4">
                                <FileText className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                                <h3 className="text-lg font-medium text-slate-700">Vault is empty</h3>
                                <p className="text-sm text-muted-foreground">Upload a secure PDF to get started.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                {filteredDocs.map((doc) => (
                                    <div key={doc.id} className="border rounded-lg p-4 bg-white hover:border-blue-300 hover:shadow-md transition-all group relative">
                                        <div className="flex items-start">
                                            <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded flex items-center justify-center mr-3 shrink-0">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-slate-800 truncate" title={doc.name}>{doc.name}</h4>
                                                <p className="text-xs text-muted-foreground truncate">{doc.description || 'No description'}</p>
                                                <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400 font-mono">
                                                    <span>{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                                                    <span>•</span>
                                                    <span>{format(new Date(doc.createdAt), 'MMM dd, yyyy')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                            <a href={`http://localhost:5000${doc.filePath}`} target="_blank" rel="noreferrer">
                                                <Button size="icon" variant="secondary" className="h-8 w-8 bg-slate-100 hover:bg-slate-200">
                                                    <Download className="h-4 w-4 text-slate-600" />
                                                </Button>
                                            </a>
                                            <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleDelete(doc.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
