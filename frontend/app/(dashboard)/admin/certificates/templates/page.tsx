'use client';

import React, { useEffect, useState } from 'react';
import TemplateBuilder from '@/components/admin/certificates/TemplateBuilder';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<any | null>(null);

    const fetchTemplates = async () => {
        try {
            const res = await api.get('/certificates/admin/templates');
            setTemplates(res.data.templates || []);
        } catch (error) {
            toast.error('Failed to load templates');
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this template?')) return;
        try {
            await api.delete(`/certificates/admin/templates/${id}`);
            toast.success('Template deleted');
            fetchTemplates();
        } catch (error) {
            toast.error('Failed to delete template');
        }
    };

    const handleSave = () => {
        setIsCreating(false);
        setEditingTemplate(null);
        fetchTemplates();
        toast.success('Template saved successfully!');
    };

    if (isCreating || editingTemplate) {
        return (
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">
                        {editingTemplate ? 'Edit Template' : 'Create New Template'}
                    </h1>
                    <Button variant="outline" onClick={() => {
                        setIsCreating(false);
                        setEditingTemplate(null);
                    }}>
                        Back to Templates
                    </Button>
                </div>
                <TemplateBuilder 
                    initialData={editingTemplate} 
                    onSave={handleSave} 
                />
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Certificate Templates</h1>
                <Button onClick={() => setIsCreating(true)}>
                    <Plus className="w-4 h-4 mr-2" /> New Template
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(tpl => (
                    <Card key={tpl.id} className="overflow-hidden">
                        <div className="h-40 bg-gray-100 flex items-center justify-center p-2">
                            {tpl.previewUrl ? (
                                <img src={tpl.previewUrl} alt={tpl.name} className="max-h-full object-contain" />
                            ) : (
                                <span className="text-gray-400">No preview</span>
                            )}
                        </div>
                        <CardHeader>
                            <CardTitle className="text-lg">{tpl.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex justify-between">
                            <Button variant="outline" size="sm" onClick={() => setEditingTemplate(tpl)}>
                                <Edit className="w-4 h-4 mr-2" /> Edit
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(tpl.id)}>
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </Button>
                        </CardContent>
                    </Card>
                ))}
                {templates.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        No templates found. Create one to get started.
                    </div>
                )}
            </div>
        </div>
    );
}
