'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Megaphone, FileText, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SuperAdminFranchiseResourcesPage() {
    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddMode, setIsAddMode] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        title: '',
        resourceType: 'DOCUMENT',
        fileUrl: ''
    });

    const fetchResources = async () => {
        try {
            setLoading(true);
            const res = await api.get('/franchise/resources');
            if (res.data.success) {
                setResources(res.data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResources();
    }, []);

    const handleAddResource = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/franchise/resources', formData);
            if (res.data.success) {
                setResources([res.data.data, ...resources]);
                setIsAddMode(false);
                setFormData({ title: '', resourceType: 'DOCUMENT', fileUrl: '' });
                alert('Resource published to all franchises successfully.');
            }
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to add resource');
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Marketing & Resources</h1>
                    <p className="text-gray-500 mt-1">Manage global materials available to all franchise partners.</p>
                </div>
                <Button onClick={() => setIsAddMode(!isAddMode)}>
                    {isAddMode ? 'Cancel' : <><Plus className="mr-2 h-4 w-4" /> Add New Resource</>}
                </Button>
            </div>

            {isAddMode && (
                <Card className="mb-6 border-blue-200 shadow-sm">
                    <CardHeader>
                        <CardTitle>Publish New Resource</CardTitle>
                        <CardDescription>This will be visible to all active franchise owners.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddResource} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Resource Title</label>
                                <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Diwali Promo Banner" />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Resource Type</label>
                                <Select value={formData.resourceType} onValueChange={val => setFormData({...formData, resourceType: val})}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DOCUMENT">Document / PDF</SelectItem>
                                        <SelectItem value="BANNER">Banner / Image</SelectItem>
                                        <SelectItem value="VIDEO">Video Link</SelectItem>
                                        <SelectItem value="OTHER">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium">File URL</label>
                                <Input required type="url" value={formData.fileUrl} onChange={e => setFormData({...formData, fileUrl: e.target.value})} placeholder="https://drive.google.com/..." />
                                <p className="text-xs text-gray-500 mt-1">Provide a publicly accessible link (e.g. Google Drive, AWS S3).</p>
                            </div>
                            <div className="md:col-span-2 flex justify-end mt-2">
                                <Button type="submit">Publish Resource</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Global Library</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-center py-4">Loading resources...</p>
                    ) : resources.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {resources.map((r: any) => (
                                <div key={r.id} className="border p-4 rounded-md shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center space-x-2">
                                            {r.resourceType === 'BANNER' ? <Megaphone className="w-5 h-5 text-blue-500" /> : <FileText className="w-5 h-5 text-purple-500" />}
                                            <h3 className="font-semibold truncate w-40">{r.title}</h3>
                                        </div>
                                        <Badge variant="outline">{r.resourceType}</Badge>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Added: {new Date(r.createdAt).toLocaleDateString()}</p>
                                    <a 
                                        href={r.fileUrl} 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        View/Download Resource <ExternalLink className="w-3 h-3 ml-1" />
                                    </a>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500 border border-dashed rounded-md">
                            <Megaphone className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">No resources available</p>
                            <p className="text-sm mt-1">Publish banners, docs, and assets for franchises here.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
