"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Trash2, Download, Search, Filter } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const { toast } = useToast();

    const [uploadData, setUploadData] = useState<{
        name: string;
        description: string;
        category: string;
        file: File | null;
    }>({
        name: '',
        description: '',
        category: 'GENERAL',
        file: null
    });

    async function fetchDocuments() {
        try {
            setLoading(true);
            const res = await api.get(`/documents`);
            setDocuments(res.data);
        } catch (error: any) {
            console.error("Failed to fetch documents", error);
            toast({
                title: "Error",
                description: "Failed to load documents.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        fetchDocuments();
    }, []);
;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setUploadData({ ...uploadData, file: e.target.files[0] });
        }
    };

    const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!uploadData.file) {
            toast({ title: "Error", description: "Please select a file to upload.", variant: "destructive" });
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', uploadData.file);
        if (uploadData.name) formData.append('name', uploadData.name);
        if (uploadData.description) formData.append('description', uploadData.description);
        formData.append('category', uploadData.category);

        try {
            await api.post(`/documents`, formData, { 
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast({ title: "Success", description: "Document uploaded successfully." });
            setIsUploadModalOpen(false);
            setUploadData({ name: '', description: '', category: 'GENERAL', file: null });
            fetchDocuments();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to upload document.",
                variant: "destructive"
            });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this document?")) return;
        
        try {
            await api.delete(`/documents/${id}`);
            toast({ title: "Success", description: "Document deleted successfully." });
            fetchDocuments();
        } catch (error: any) {
            toast({ title: "Error", description: "Failed to delete document.", variant: "destructive" });
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const filteredDocs = documents.filter((doc: any) => {
        const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = categoryFilter === 'ALL' || doc.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="p-6 space-y-6 animate-in fade-in zoom-in duration-500 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Internal Business Documents
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Securely store and manage internal agreements, SOPs, and company documents.
                    </p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            type="search" 
                            placeholder="Search documents..." 
                            className="pl-8 bg-white dark:bg-slate-900"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[140px] bg-white dark:bg-slate-900">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                <span>{categoryFilter === 'ALL' ? 'All Types' : categoryFilter}</span>
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Types</SelectItem>
                            <SelectItem value="SOPs">SOPs</SelectItem>
                            <SelectItem value="Filings">Filings</SelectItem>
                            <SelectItem value="Agreements">Agreements</SelectItem>
                            <SelectItem value="GENERAL">General</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={() => setIsUploadModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200">
                        <Plus className="mr-2 h-4 w-4" /> Upload Document
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="h-32"></CardContent>
                        </Card>
                    ))}
                </div>
            ) : filteredDocs.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed">
                    <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">No documents found</h3>
                    <p className="text-slate-500 mb-4">Upload internal agreements and SOPs to get started.</p>
                    <Button variant="outline" onClick={() => setIsUploadModalOpen(true)}>Upload First Document</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDocs.map((doc) => (
                        <Card key={doc.id} className="hover:shadow-md transition-shadow group relative overflow-hidden">
                            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg text-indigo-600 dark:text-indigo-300">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <CardTitle className="text-base line-clamp-1" title={doc.name}>{doc.name}</CardTitle>
                                                {doc.category && doc.category !== 'GENERAL' && (
                                                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-medium">{doc.category}</Badge>
                                                )}
                                            </div>
                                            <CardDescription className="text-xs mt-0.5">
                                                {formatBytes(doc.fileSize)} • {format(new Date(doc.createdAt), 'MMM dd, yyyy')}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 pb-4 h-[80px]">
                                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                    {doc.description || 'No description provided.'}
                                </p>
                            </CardContent>
                            <div className="px-6 pb-4 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="sm" variant="outline" className="h-8" asChild>
                                    <a href={`${API_URL.replace('/api', '')}${doc.filePath}`} target="_blank" rel="noreferrer">
                                        <Download className="h-3.5 w-3.5 mr-1" /> View
                                    </a>
                                </Button>
                                <Button size="sm" variant="destructive" className="h-8" onClick={() => handleDelete(doc.id)}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload Internal Document</DialogTitle>
                        <DialogDescription>
                            Upload SOPs, business agreements, or other internal files. Allowed format: PDF only. Max size: 25MB.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpload} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="file">PDF File *</Label>
                            <Input 
                                id="file" 
                                type="file" 
                                accept=".pdf,application/pdf"
                                onChange={handleFileChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Document Name (Optional)</Label>
                            <Input 
                                id="name" 
                                placeholder="Leaves the original filename if empty"
                                value={uploadData.name}
                                onChange={(e) => setUploadData({...uploadData, name: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Category *</Label>
                            <Select value={uploadData.category} onValueChange={(val) => setUploadData({...uploadData, category: val})}>
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SOPs">SOPs</SelectItem>
                                    <SelectItem value="Filings">Filings</SelectItem>
                                    <SelectItem value="Agreements">Agreements</SelectItem>
                                    <SelectItem value="GENERAL">General</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea 
                                id="description" 
                                placeholder="Briefly describe the contents of this document..."
                                value={uploadData.description}
                                onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
                                rows={3}
                            />
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsUploadModalOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={uploading}>
                                {uploading ? 'Uploading...' : 'Upload Document'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
