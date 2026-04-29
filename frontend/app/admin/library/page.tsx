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
import { useToast } from '@/components/ui/use-toast';

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
    isPaid?: boolean;
    publishedAt?: string;
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
    isPaid: boolean;
    publishedAt: string;
}

const initialResourceForm: ResourceFormState = {
    title: '',
    description: '',
    domainId: '',
    file: null,
    qaContent: [{ q: '', a: '' }],
    syncToAI: false,
    isPaid: false,
    publishedAt: ''
};

export default function LibraryManagementPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [domains, setDomains] = useState<Domain[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [showDomainForm, setShowDomainForm] = useState(false);
    const [showResourceForm, setShowResourceForm] = useState(false);
    const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
    const [resourceType, setResourceType] = useState('PDF');

    const [categoryForm, setCategoryForm] = useState({ name: '', description: '', icon: '' });
    const [domainForm, setDomainForm] = useState({ name: '', description: '', categoryId: '' });
    const [resourceForm, setResourceForm] = useState<ResourceFormState>({ ...initialResourceForm });

    const { toast } = useToast();

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
            toast({
                title: "Error",
                description: "Failed to fetch library data",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCategory = async () => {
        if (!categoryForm.name) return;
        try {
            await api.post('/library/categories', categoryForm);
            setCategoryForm({ name: '', description: '', icon: '' });
            setShowCategoryForm(false);
            fetchData();
            toast({
                title: "Success",
                description: "Category created successfully",
            });
        } catch (error) {
            console.error('Error creating category:', error);
            toast({
                title: "Error",
                description: "Failed to create category",
                variant: "destructive"
            });
        }
    };

    const handleCreateDomain = async () => {
        if (!domainForm.name || !domainForm.categoryId) return;
        try {
            await api.post('/library/domains', domainForm);
            setDomainForm({ name: '', description: '', categoryId: '' });
            setShowDomainForm(false);
            fetchData();
            toast({
                title: "Success",
                description: "Domain created successfully",
            });
        } catch (error) {
            console.error('Error creating domain:', error);
            toast({
                title: "Error",
                description: "Failed to create domain",
                variant: "destructive"
            });
        }
    };

    const handleSaveResource = async () => {
        try {
            // Validation
            if (!resourceForm.title) {
                toast({ title: "Validation Error", description: "Please enter a title", variant: "destructive" });
                return;
            }
            if (!resourceForm.domainId) {
                toast({ title: "Validation Error", description: "Please select a category/domain", variant: "destructive" });
                return;
            }

            if (editingResourceId) {
                // Update logic
                const updateData: any = {
                    title: resourceForm.title,
                    description: resourceForm.description,
                    isPaid: resourceForm.isPaid,
                    publishedAt: resourceForm.publishedAt || null,
                };

                if (resourceType === 'QA') {
                    const validQuestions = resourceForm.qaContent.filter(qa => qa.q && qa.a);
                    updateData.content = { questions: validQuestions };
                }

                await api.put(`/library/resources/${editingResourceId}`, updateData);
                toast({ title: "Success", description: "Resource updated successfully" });
            } else {
                // Create logic
                if (resourceType === 'PDF') {
                    if (!resourceForm.file) {
                        toast({ title: "Validation Error", description: "Please select a PDF file", variant: "destructive" });
                        return;
                    }
                    const formData = new FormData();
                    formData.append('file', resourceForm.file);
                    formData.append('title', resourceForm.title);
                    formData.append('description', resourceForm.description);
                    formData.append('domainId', resourceForm.domainId);
                    formData.append('createdBy', 'admin'); 
                    formData.append('isPaid', String(resourceForm.isPaid));
                    if (resourceForm.publishedAt) {
                        formData.append('publishedAt', resourceForm.publishedAt);
                    }

                    await api.post('/library/resources/pdf', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                } else {
                    // Q&A type
                    const validQuestions = resourceForm.qaContent.filter(qa => qa.q && qa.a);
                    if (validQuestions.length === 0) {
                        toast({ title: "Validation Error", description: "Please add at least one valid Q&A pair", variant: "destructive" });
                        return;
                    }

                    const content = {
                        questions: validQuestions
                    };

                    await api.post('/library/resources/qa', {
                        title: resourceForm.title,
                        description: resourceForm.description,
                        domainId: resourceForm.domainId,
                        createdBy: 'admin',
                        content,
                        syncToAI: resourceForm.syncToAI,
                        isPaid: resourceForm.isPaid,
                        publishedAt: resourceForm.publishedAt || null
                    });
                }
                toast({
                    title: "Success",
                    description: `Library ${resourceType === 'PDF' ? 'PDF' : 'Q&A'} resource created successfully`,
                });
            }

            setResourceForm({ ...initialResourceForm });
            setShowResourceForm(false);
            setEditingResourceId(null);
            fetchData();
        } catch (error: any) {
            console.error('Error saving resource:', error);
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to save resource",
                variant: "destructive"
            });
        }
    };

    const handleEditResource = (resource: Resource) => {
        setEditingResourceId(resource.id);
        setResourceType(resource.type);
        setResourceForm({
            title: resource.title,
            description: resource.description || '',
            domainId: resource.domainId,
            file: null, // Files can't be easily pre-populated for edit in this flow
            qaContent: resource.type === 'QA' && resource.content && Array.isArray((resource.content as any).questions) 
                ? (resource.content as any).questions 
                : [{ q: '', a: '' }],
            syncToAI: false, // Don't re-sync by default
            isPaid: resource.isPaid || false,
            publishedAt: resource.publishedAt ? new Date(resource.publishedAt).toISOString().split('T')[0] : ''
        });
        setShowResourceForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteResource = async (id: string) => {
        if (!confirm("Are you sure you want to delete this resource?")) return;
        try {
            await api.delete(`/library/resources/${id}`);
            toast({ title: "Success", description: "Resource deleted successfully" });
            fetchData();
        } catch (error) {
            console.error('Error deleting resource:', error);
            toast({ title: "Error", description: "Failed to delete resource", variant: "destructive" });
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

    {/* 🔥 TOP CARDS */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">All Library</p>
          <h2 className="text-2xl font-bold">{resources.length}</h2>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Paid</p>
          <h2 className="text-2xl font-bold">
            {resources.filter(r => r.isPaid).length}
          </h2>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Free</p>
          <h2 className="text-2xl font-bold">
            {resources.filter(r => !r.isPaid).length}
          </h2>
        </CardContent>
      </Card>

    </div>

    {/* 🔥 QUICK ACTIONS */}
    <div className="flex flex-wrap gap-4 justify-between items-center bg-muted/20 p-4 rounded-lg border border-dashed">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setShowCategoryForm(!showCategoryForm)}>
          <BookOpen className="h-4 w-4 mr-2" />
          {showCategoryForm ? "Cancel Category" : "New Category"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setShowDomainForm(!showDomainForm)}>
          <FolderTree className="h-4 w-4 mr-2" />
          {showDomainForm ? "Cancel Domain" : "New Domain"}
        </Button>
      </div>
      
      <Button onClick={() => {
          setShowResourceForm(!showResourceForm);
          if (showResourceForm) setEditingResourceId(null);
        }} className="shadow-lg">
        <Plus className="h-4 w-4 mr-2" />
        {showResourceForm ? "Close Form" : "Add Library Post"}
      </Button>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 🔥 CATEGORY FORM */}
        {showCategoryForm && (
            <Card className="border-primary/30">
                <CardHeader>
                    <CardTitle className="text-lg">Create New Category</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Category Name</Label>
                        <Input 
                            value={categoryForm.name}
                            onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                            placeholder="e.g. Artificial Intelligence"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea 
                            value={categoryForm.description}
                            onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                            placeholder="Brief overview..."
                        />
                    </div>
                    <Button onClick={handleCreateCategory} className="w-full">Save Category</Button>
                </CardContent>
            </Card>
        )}

        {/* 🔥 DOMAIN FORM */}
        {showDomainForm && (
            <Card className="border-primary/30">
                <CardHeader>
                    <CardTitle className="text-lg">Create New Domain</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Parent Category</Label>
                        <select
                            className="w-full p-2 border rounded bg-background"
                            value={domainForm.categoryId}
                            onChange={(e) => setDomainForm({...domainForm, categoryId: e.target.value})}
                        >
                            <option value="">Select Category</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label>Domain Name</Label>
                        <Input 
                            value={domainForm.name}
                            onChange={(e) => setDomainForm({...domainForm, name: e.target.value})}
                            placeholder="e.g. Prompt Engineering"
                        />
                    </div>
                    <Button onClick={handleCreateDomain} className="w-full">Save Domain</Button>
                </CardContent>
            </Card>
        )}
    </div>

    {/* 🔥 FORM */}
    {showResourceForm && (
      <Card>
        <CardHeader>
          <CardTitle>{editingResourceId ? "Edit Library Resource" : "Add Library"}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Resource Type Tabs */}
          <Tabs defaultValue="PDF" onValueChange={(v) => setResourceType(v)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="PDF" disabled={!!editingResourceId && resourceType !== 'PDF'}>PDF Document</TabsTrigger>
              <TabsTrigger value="QA" disabled={!!editingResourceId && resourceType !== 'QA'}>Q&A / Interview</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Name */}
          <div className="pt-4">
            <Label>Resource Title</Label>
            <Input
              placeholder="e.g. Frontend Interview Preparation Guide"
              value={resourceForm.title}
              onChange={(e) =>
                setResourceForm({ ...resourceForm, title: e.target.value })
              }
            />
          </div>

          {/* Category */}
          <div>
            <Label>Domain / Category</Label>
            <select
              className="w-full p-2 border rounded bg-background"
              value={resourceForm.domainId}
              onChange={(e) =>
                setResourceForm({ ...resourceForm, domainId: e.target.value })
              }
            >
              <option value="">Select Domain</option>
              {domains.map((domain) => (
                <option key={domain.id} value={domain.id}>
                  {domain.category ? `${domain.category.name} - ${domain.name}` : domain.name}
                </option>
              ))}
            </select>
          </div>

          {/* PDF Specific Fields */}
          {resourceType === 'PDF' && (
            <div className="space-y-4 border p-4 rounded-lg bg-muted/30">
              <div>
                <Label>PDF File {editingResourceId && "(Leave empty to keep current file)"}</Label>
                <Input
                  type="file"
                  accept=".pdf"
                  className="bg-background"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setResourceForm({
                        ...resourceForm,
                        file: e.target.files[0],
                      });
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* QA Specific Fields */}
          {resourceType === 'QA' && (
            <div className="space-y-4 border p-4 rounded-lg bg-muted/30">
              <div className="flex items-center justify-between">
                <Label>Questions & Answers</Label>
                <Button variant="outline" size="sm" onClick={addQAPair}>
                  <Plus className="h-4 w-4 mr-1" /> Add QA
                </Button>
              </div>
              
              <div className="space-y-4">
                {resourceForm.qaContent.map((qa, index) => (
                  <div key={index} className="space-y-2 p-3 border rounded bg-background relative">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-1 right-1 h-6 w-6 text-red-500"
                      onClick={() => removeQAPair(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Input 
                      placeholder="Question" 
                      value={qa.q} 
                      onChange={(e) => updateQAPair(index, 'q', e.target.value)}
                    />
                    <Textarea 
                      placeholder="Answer" 
                      value={qa.a} 
                      onChange={(e) => updateQAPair(index, 'a', e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="syncToAI" 
                  checked={resourceForm.syncToAI}
                  onChange={(e) => setResourceForm({...resourceForm, syncToAI: e.target.checked})}
                />
                <Label htmlFor="syncToAI" className="cursor-pointer">Sync to AI Interview Database</Label>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Access */}
            <div>
              <Label>Access Type</Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="isPaid"
                    checked={!resourceForm.isPaid}
                    onChange={() => setResourceForm({ ...resourceForm, isPaid: false })}
                  />
                  <span className="text-sm">Free</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="isPaid"
                    checked={resourceForm.isPaid}
                    onChange={() => setResourceForm({ ...resourceForm, isPaid: true })}
                  />
                  <span className="text-sm">Paid</span>
                </label>
              </div>
            </div>

            {/* Published Date */}
            <div>
              <Label>Published Date</Label>
              <Input
                type="date"
                value={resourceForm.publishedAt}
                onChange={(e) => setResourceForm({ ...resourceForm, publishedAt: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Description (Optional)</Label>
            <Textarea
              placeholder="Provide a brief overview of this resource..."
              value={resourceForm.description}
              onChange={(e) =>
                setResourceForm({ ...resourceForm, description: e.target.value })
              }
            />
          </div>

          <Button className="w-full" onClick={handleSaveResource}>
            {editingResourceId ? "Update" : "Add"} {resourceType === 'PDF' ? 'Document' : 'Interview Q&A'}
          </Button>

        </CardContent>
      </Card>
    )}

    {/* 🔥 LIST */}
    <div className="space-y-4">
      {resources.map((r) => (
        <Card key={r.id}>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{r.title}</h3>
              <p className="text-sm text-muted-foreground">{r.description}</p>
            </div>

            <div className="flex gap-2 items-center">
              <span className={`text-xs px-2 py-1 rounded h-fit ${r.isPaid ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                {r.isPaid ? "Paid" : "Free"}
              </span>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => handleEditResource(r)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => handleDeleteResource(r.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

  </div>
)
}