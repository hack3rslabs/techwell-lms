"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Image as ImageIcon, Globe, Settings, Eye } from 'lucide-react';
import Link from 'next/link';
import api, { uploadApi } from '@/lib/api';
import { useToast } from "@/components/ui/use-toast";
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { getFullImageUrl } from '@/lib/image-utils';
import { Badge } from "@/components/ui/badge";

const PREDEFINED_CATEGORIES = [
    "Business Consulting",
    "IT Consulting",
    "Technology",
    "AI",
    "Software Development",
    "Cyber Security",
    "Cloud",
    "Digital Marketing",
    "Career Guidance"
];

function PostEditorContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const postId = searchParams.get('id');
    const isEdit = !!postId;
    const { toast } = useToast();

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [wordCount, setWordCount] = useState(0);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'Technology',
        status: 'DRAFT',
        coverImage: '',
        tags: '',
        metaTitle: '',
        metaDescription: '',
        canonicalUrl: '',
        slug: ''
    });

    async function fetchPost() {
        try {
            const res = await api.get(`/blogs/${postId}`);
            const post = res.data;
            setFormData({
                title: post.title || '',
                content: post.content || '',
                category: post.category || 'Technology',
                status: post.status || 'DRAFT',
                coverImage: post.coverImage || '',
                tags: Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || ''),
                metaTitle: post.metaTitle || '',
                metaDescription: post.metaDescription || '',
                canonicalUrl: post.canonicalUrl || '',
                slug: post.slug || ''
            });
        } catch (error) {
            console.error("Failed to fetch post", error);
            toast({ title: "Error", description: "Failed to load post.", variant: "destructive" });
            router.push('/admin/posts');
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        if (isEdit && postId) {
            fetchPost();
        }
    }, [isEdit, postId]);

    useEffect(() => {
        // Calculate rough word count
        const text = formData.content.replace(/<[^>]+>/g, '');
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        setWordCount(words);
    }, [formData.content]);
;

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            toast({ title: "Uploading...", description: "Please wait." });
            const res = await uploadApi.upload(uploadData);
            setFormData(prev => ({ ...prev, coverImage: getFullImageUrl(res.data.url) }));
            toast({ title: "Success", description: "Cover image uploaded." });
        } catch (error) {
            console.error("Failed to upload cover", error);
            toast({ title: "Error", description: "Failed to upload image.", variant: "destructive" });
        }
    };

    const handleSave = async (publish: boolean = false) => {
        if (!formData.title) {
            toast({ title: "Validation Error", description: "Title is required.", variant: "destructive" });
            return;
        }

        setSaving(true);
        const payload = {
            ...formData,
            status: publish ? 'PUBLISHED' : (formData.status === 'PUBLISHED' && !publish ? 'DRAFT' : formData.status),
            tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
        };

        try {
            if (isEdit) {
                await api.put(`/blogs/${postId}`, payload);
                toast({ title: "Success", description: "Post updated successfully." });
                if (publish) router.push('/admin/posts');
            } else {
                const res = await api.post(`/blogs`, payload);
                toast({ title: "Success", description: "Post created successfully." });
                router.push(`/admin/posts/edit?id=${res.data.id}`);
            }
        } catch (error: any) {
            console.error("Failed to save post", error);
            toast({ title: "Error", description: error.response?.data?.error || "Failed to save post.", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-10 text-center"><div className="animate-spin h-8 w-8 mx-auto border-4 border-blue-600 border-t-transparent rounded-full"></div></div>;
    }

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/posts">
                        <Button variant="outline" size="icon" className="rounded-full">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">{isEdit ? 'Edit Post' : 'Add New Post'}</h1>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                            Standard CMS Editor 
                            {formData.status === 'PUBLISHED' ? (
                                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none">Published</Badge>
                            ) : (
                                <Badge variant="secondary" className="border-none">Draft</Badge>
                            )}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Draft
                    </Button>
                    <Button onClick={() => handleSave(true)} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                        <Globe className="mr-2 h-4 w-4" />
                        {formData.status === 'PUBLISHED' ? 'Update Published' : 'Publish Now'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Main Content */}
                <div className="lg:col-span-8 xl:col-span-9 space-y-6">
                    <div className="space-y-2">
                        <Input
                            placeholder="Enter your compelling title here..."
                            className="text-2xl md:text-3xl font-bold h-auto py-3 px-4 border-none shadow-sm focus-visible:ring-1 focus-visible:ring-blue-500 bg-white dark:bg-slate-950"
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                        />
                    </div>
                    
                    <div className="rounded-lg shadow-sm border bg-white dark:bg-slate-950 overflow-hidden">
                        <RichTextEditor
                            value={formData.content}
                            onChange={(val) => handleChange('content', val)}
                            placeholder="Start writing your article..."
                        />
                        <div className="bg-muted/30 px-4 py-2 border-t flex items-center justify-between text-xs text-muted-foreground">
                            <span>Words: <strong className="text-slate-700 dark:text-slate-300">{wordCount}</strong></span>
                            <span>{Math.ceil(wordCount / 200)} min read</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Settings */}
                <div className="lg:col-span-4 xl:col-span-3 space-y-6">
                    
                    <Card className="shadow-sm">
                        <CardHeader className="py-4">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Settings className="h-4 w-4 text-blue-600" /> Organization
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select value={formData.category} onValueChange={(val) => handleChange('category', val)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PREDEFINED_CATEGORIES.map(cat => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Tags (comma separated)</Label>
                                <Input 
                                    placeholder="e.g. AI, Future, Cloud" 
                                    value={formData.tags}
                                    onChange={(e) => handleChange('tags', e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardHeader className="py-4">
                            <CardTitle className="text-base flex items-center gap-2">
                                <ImageIcon className="h-4 w-4 text-emerald-600" /> Featured Image
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {formData.coverImage ? (
                                <div className="relative rounded-md overflow-hidden border group aspect-video">
                                    <img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <Button variant="secondary" size="sm" onClick={() => document.getElementById('cover-upload')?.click()}>Change</Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleChange('coverImage', '')}>Remove</Button>
                                    </div>
                                </div>
                            ) : (
                                <div 
                                    className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors aspect-video"
                                    onClick={() => document.getElementById('cover-upload')?.click()}
                                >
                                    <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                                    <p className="text-sm font-medium">Click to upload cover</p>
                                    <p className="text-xs text-muted-foreground mt-1">1200 x 630px recommended</p>
                                </div>
                            )}
                            <input 
                                type="file" 
                                id="cover-upload" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={handleImageUpload} 
                            />
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-blue-100 dark:border-blue-900/50">
                        <CardHeader className="py-4 bg-blue-50/50 dark:bg-blue-950/20 border-b">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Globe className="h-4 w-4 text-blue-600" /> SEO Optimization
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Meta Title</Label>
                                    <span className={`text-xs ${formData.metaTitle.length > 60 ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                                        {formData.metaTitle.length} / 60
                                    </span>
                                </div>
                                <Input 
                                    placeholder="Enter SEO Title" 
                                    value={formData.metaTitle}
                                    onChange={(e) => handleChange('metaTitle', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Meta Description</Label>
                                    <span className={`text-xs ${formData.metaDescription.length > 160 ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                                        {formData.metaDescription.length} / 160
                                    </span>
                                </div>
                                <Textarea 
                                    placeholder="Brief summary for search engines..." 
                                    value={formData.metaDescription}
                                    onChange={(e) => handleChange('metaDescription', e.target.value)}
                                    rows={4}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Custom Slug (Optional)</Label>
                                <Input 
                                    placeholder="e.g. my-awesome-post" 
                                    value={formData.slug}
                                    onChange={(e) => handleChange('slug', e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}

export default function PostEditor() {
    return (
        <Suspense fallback={<div className="p-10 text-center"><div className="animate-spin h-8 w-8 mx-auto border-4 border-blue-600 border-t-transparent rounded-full"></div></div>}>
            <PostEditorContent />
        </Suspense>
    );
}
