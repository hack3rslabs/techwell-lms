"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, BookOpen, FolderTree, FileText, Upload, Trash2, Edit, Save, X } from 'lucide-react';

import api from '@/lib/api';

interface Category {
    id: string;
    name: string;
    description?: string;
    domains?: Domain[];
}

interface Domain {
    id: string;
    name: string;
    description?: string;
    categoryId: string;
    category?: Category;
    _count?: { resources: number };
}

interface Resource {
    id: string;
    title: string;
    description?: string;
    type: 'PDF' | 'QA';
    domainId: string;
    domain?: Domain;
    views: number;
    downloads: number;
    url?: string;
    content?: Record<string, unknown>;
}

interface QAItem {
    q: string;
    a: string;
}

interface ResourceFormState {
    title: string;
    description: string;
    domainId: string;
    file: File | null;
    qaContent: QAItem[];
    syncToAI: boolean;
}


export default function LibraryManagementPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [domains, setDomains] = useState<Domain[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [showDomainForm, setShowDomainForm] = useState(false);
    const [showResourceForm, setShowResourceForm] = useState(false);
    const [resourceType, setResourceType] = useState('PDF');

    const [categoryForm, setCategoryForm] = useState({ name: '', description: '', icon: '' });
    const [domainForm, setDomainForm] = useState({ name: '', description: '', categoryId: '' });
    const [resourceForm, setResourceForm] = useState<ResourceFormState>({
        title: '',
        description: '',
        domainId: '',
        file: null,
        qaContent: [{ q: '', a: '' }],
        syncToAI: false
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [cats, doms, res] = await Promise.all([
                api.get('/library/categories').then(r => r.data),
                api.get('/library/domains').then(r => r.data),
                api.get('/library/resources').then(r => r.data)
            ]);
            setCategories(cats);
            setDomains(doms);
            setResources(res);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCategory = async () => {
        try {
            await api.post('/library/categories', categoryForm);
            setCategoryForm({ name: '', description: '', icon: '' });
            setShowCategoryForm(false);
            fetchData();
        } catch (error) {
            console.error('Error creating category:', error);
        }
    };

    const handleCreateDomain = async () => {
        try {
            await api.post('/library/domains', domainForm);
            setDomainForm({ name: '', description: '', categoryId: '' });
            setShowDomainForm(false);
            fetchData();
        } catch (error) {
            console.error('Error creating domain:', error);
        }
    };

    const handleCreateResource = async () => {
        try {
            if (resourceType === 'PDF') {
                const formData = new FormData();
                if (resourceForm.file) {
                    formData.append('file', resourceForm.file);
                }
                formData.append('title', resourceForm.title);
                formData.append('description', resourceForm.description);
                formData.append('domainId', resourceForm.domainId);
                formData.append('createdBy', 'admin'); // TODO: Get from auth

                await api.post('/library/resources/pdf', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // Q&A type
                const content = {
                    questions: resourceForm.qaContent.filter(qa => qa.q && qa.a)
                };

                await api.post('/library/resources/qa', {
                    title: resourceForm.title,
                    description: resourceForm.description,
                    domainId: resourceForm.domainId,
                    createdBy: 'admin',
                    content,
                    syncToAI: resourceForm.syncToAI
                });
            }

            setResourceForm({
                title: '',
                description: '',
                domainId: '',
                file: null,
                qaContent: [{ q: '', a: '' }],
                syncToAI: false
            });
            setShowResourceForm(false);
            fetchData();
        } catch (error) {
            console.error('Error creating resource:', error);
        }
    };

    const addQAPair = () => {
        setResourceForm({
            ...resourceForm,
            qaContent: [...resourceForm.qaContent, { q: '', a: '' }]
        });
    };

    const updateQAPair = (index: number, field: keyof QAItem, value: string) => {
        const updated = [...resourceForm.qaContent];
        updated[index][field] = value;
        setResourceForm({ ...resourceForm, qaContent: updated });
    };

    const removeQAPair = (index: number) => {
        const updated = resourceForm.qaContent.filter((_, i) => i !== index);
        setResourceForm({ ...resourceForm, qaContent: updated });
    };

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <BookOpen className="h-8 w-8 text-primary" />
                        Library Management
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Manage categories, domains, and educational resources
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Categories</CardTitle>
                        <FolderTree className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{categories.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Domains</CardTitle>
                        <FolderTree className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{domains.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Resources</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{resources.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Management Tabs */}
            <Tabs defaultValue="categories" className="w-full">
                <TabsList>
                    <TabsTrigger value="categories">Categories</TabsTrigger>
                    <TabsTrigger value="domains">Domains</TabsTrigger>
                    <TabsTrigger value="resources">Resources</TabsTrigger>
                </TabsList>

                {/* Categories Tab */}
                <TabsContent value="categories" className="space-y-4">
                    <div className="flex justify-end">
                        <Button onClick={() => setShowCategoryForm(!showCategoryForm)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Category
                        </Button>
                    </div>

                    {showCategoryForm && (
                        <Card>
                            <CardHeader>
                                <CardTitle>New Category</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Name</Label>
                                    <Input
                                        value={categoryForm.name}
                                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                        placeholder="e.g., Interview Prep"
                                    />
                                </div>
                                <div>
                                    <Label>Description</Label>
                                    <Textarea
                                        value={categoryForm.description}
                                        onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                                        placeholder="Brief description"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={handleCreateCategory}>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save
                                    </Button>
                                    <Button variant="outline" onClick={() => setShowCategoryForm(false)}>
                                        <X className="h-4 w-4 mr-2" />
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.map((cat) => (
                            <Card key={cat.id}>
                                <CardHeader>
                                    <CardTitle className="text-lg">{cat.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-2">{cat.description}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {cat.domains?.length || 0} domains
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Domains Tab */}
                <TabsContent value="domains" className="space-y-4">
                    <div className="flex justify-end">
                        <Button onClick={() => setShowDomainForm(!showDomainForm)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Domain
                        </Button>
                    </div>

                    {showDomainForm && (
                        <Card>
                            <CardHeader>
                                <CardTitle>New Domain</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Category</Label>
                                    <select
                                        className="w-full p-2 border rounded"
                                        value={domainForm.categoryId}
                                        onChange={(e) => setDomainForm({ ...domainForm, categoryId: e.target.value })}
                                        aria-label="Select Category"
                                    >
                                        <option value="">Select category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label>Name</Label>
                                    <Input
                                        value={domainForm.name}
                                        onChange={(e) => setDomainForm({ ...domainForm, name: e.target.value })}
                                        placeholder="e.g., JavaScript"
                                    />
                                </div>
                                <div>
                                    <Label>Description</Label>
                                    <Textarea
                                        value={domainForm.description}
                                        onChange={(e) => setDomainForm({ ...domainForm, description: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={handleCreateDomain}>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save
                                    </Button>
                                    <Button variant="outline" onClick={() => setShowDomainForm(false)}>
                                        <X className="h-4 w-4 mr-2" />
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {domains.map((domain) => (
                            <Card key={domain.id}>
                                <CardHeader>
                                    <CardTitle className="text-lg">{domain.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-2">{domain.description}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Category: {domain.category?.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {domain._count?.resources || 0} resources
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Resources Tab */}
                <TabsContent value="resources" className="space-y-4">
                    <div className="flex justify-end">
                        <Button onClick={() => setShowResourceForm(!showResourceForm)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Resource
                        </Button>
                    </div>

                    {showResourceForm && (
                        <Card>
                            <CardHeader>
                                <CardTitle>New Resource</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Type</Label>
                                    <div className="flex gap-4 mt-2">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                checked={resourceType === 'PDF'}
                                                onChange={() => setResourceType('PDF')}
                                                aria-label="Select PDF Upload Type"
                                            />
                                            PDF Upload
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                checked={resourceType === 'QA'}
                                                onChange={() => setResourceType('QA')}
                                                aria-label="Select Q&A Content Type"
                                            />
                                            Q&A Content
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <Label>Domain</Label>
                                    <select
                                        className="w-full p-2 border rounded"
                                        value={resourceForm.domainId}
                                        onChange={(e) => setResourceForm({ ...resourceForm, domainId: e.target.value })}
                                        aria-label="Select Domain"
                                    >
                                        <option value="">Select domain</option>
                                        {domains.map((domain) => (
                                            <option key={domain.id} value={domain.id}>
                                                {domain.category?.name} → {domain.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <Label>Title</Label>
                                    <Input
                                        value={resourceForm.title}
                                        onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                                        placeholder="Resource title"
                                    />
                                </div>

                                <div>
                                    <Label>Description</Label>
                                    <Textarea
                                        value={resourceForm.description}
                                        onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                                    />
                                </div>

                                {resourceType === 'PDF' ? (
                                    <div>
                                        <Label>PDF File</Label>
                                        <Input
                                            type="file"
                                            accept=".pdf"
                                            title="Upload PDF Resource"
                                            aria-label="Upload PDF Resource"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    setResourceForm({ ...resourceForm, file: e.target.files[0] });
                                                }
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={resourceForm.syncToAI}
                                                onChange={(e) => setResourceForm({ ...resourceForm, syncToAI: e.target.checked })}
                                            />
                                            <Label>Sync to AI Training Data</Label>
                                        </div>

                                        {resourceForm.qaContent.map((qa, index) => (
                                            <Card key={index} className="p-4">
                                                <div className="space-y-2">
                                                    <div>
                                                        <Label>Question {index + 1}</Label>
                                                        <Textarea
                                                            value={qa.q}
                                                            onChange={(e) => updateQAPair(index, 'q', e.target.value)}
                                                            placeholder="Enter question"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Answer</Label>
                                                        <Textarea
                                                            value={qa.a}
                                                            onChange={(e) => updateQAPair(index, 'a', e.target.value)}
                                                            placeholder="Enter answer"
                                                            rows={4}
                                                        />
                                                    </div>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => removeQAPair(index)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Remove
                                                    </Button>
                                                </div>
                                            </Card>
                                        ))}

                                        <Button variant="outline" onClick={addQAPair}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Q&A Pair
                                        </Button>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <Button onClick={handleCreateResource}>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save
                                    </Button>
                                    <Button variant="outline" onClick={() => setShowResourceForm(false)}>
                                        <X className="h-4 w-4 mr-2" />
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="space-y-4">
                        {resources.map((resource) => (
                            <Card key={resource.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg">{resource.title}</CardTitle>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {resource.domain?.category?.name} → {resource.domain?.name}
                                            </p>
                                        </div>
                                        <span className="px-2 py-1 text-xs rounded bg-primary/10 text-primary">
                                            {resource.type}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-2">{resource.description}</p>
                                    <div className="flex gap-4 text-xs text-muted-foreground">
                                        <span>Views: {resource.views}</span>
                                        {resource.type === 'PDF' && <span>Downloads: {resource.downloads}</span>}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
