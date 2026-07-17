'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Edit, Plus, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api';

interface SuccessStory {
    id: string;
    imagePath: string;
    url: string | null;
    altText: string | null;
    isActive: boolean;
    order: number;
}

export default function SuccessStoriesPage() {
    const [stories, setStories] = useState<SuccessStory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    // Form state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [url, setUrl] = useState('');
    const [altText, setAltText] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [order, setOrder] = useState(0);

    const fetchStories = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await api.get('/success-stories/admin', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStories(res.data);
        } catch (error) {
            console.error('Failed to fetch success stories:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStories();
    }, []);

    const resetForm = () => {
        setEditingId(null);
        setImageFile(null);
        setUrl('');
        setAltText('');
        setIsActive(true);
        setOrder(0);
    };

    const handleEdit = (story: SuccessStory) => {
        setEditingId(story.id);
        setUrl(story.url || '');
        setAltText(story.altText || '');
        setIsActive(story.isActive);
        setOrder(story.order);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this success story?')) return;
        try {
            const token = localStorage.getItem('token');
            await api.delete(`/success-stories/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchStories();
        } catch (error) {
            console.error('Failed to delete story:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const formData = new FormData();
        if (imageFile) formData.append('image', imageFile);
        formData.append('url', url);
        formData.append('altText', altText);
        formData.append('isActive', isActive.toString());
        formData.append('order', order.toString());

        try {
            const token = localStorage.getItem('token');
            if (editingId) {
                await api.put(`/success-stories/${editingId}`, formData, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                if (!imageFile) {
                    alert('Please select an image file');
                    return;
                }
                await api.post('/success-stories', formData, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }
            setIsDialogOpen(false);
            resetForm();
            fetchStories();
        } catch (error) {
            console.error('Failed to save story:', error);
            alert('Failed to save success story');
        }
    };

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Success Stories (Google Reviews)</h1>
                <Button className="flex items-center gap-2" onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                    <Plus className="w-4 h-4" /> Add Story
                </Button>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingId ? 'Edit Success Story' : 'Add Success Story'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Image (Screenshot)</label>
                                <Input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                />
                                {!imageFile && editingId && <p className="text-xs text-muted-foreground mt-1">Leave empty to keep current image</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Redirect URL</label>
                                <Input 
                                    type="url" 
                                    placeholder="https://g.page/review/..." 
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Alt Text</label>
                                <Input 
                                    type="text" 
                                    placeholder="Review by Student" 
                                    value={altText}
                                    onChange={(e) => setAltText(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Order</label>
                                    <Input 
                                        type="number" 
                                        value={order}
                                        onChange={(e) => setOrder(parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="flex items-center gap-2 pt-6">
                                    <Switch checked={isActive} onCheckedChange={setIsActive} />
                                    <span className="text-sm">Active</span>
                                </div>
                            </div>
                            <Button type="submit" className="w-full">Save Success Story</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {stories.map((story) => (
                        <Card key={story.id} className={`overflow-hidden transition-all ${!story.isActive ? 'opacity-60 grayscale' : ''}`}>
                            <div className="aspect-video relative bg-muted flex items-center justify-center">
                                <img 
                                    src={`${process.env.NEXT_PUBLIC_API_URL}${story.imagePath}`} 
                                    alt={story.altText || 'Success Story'}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground truncate">
                                    <LinkIcon className="w-4 h-4 flex-shrink-0" />
                                    {story.url ? (
                                        <a href={story.url} target="_blank" rel="noreferrer" className="hover:underline hover:text-primary truncate">
                                            {story.url}
                                        </a>
                                    ) : (
                                        <span>No URL provided</span>
                                    )}
                                </div>
                                <div className="flex justify-between items-center mt-4">
                                    <span className="text-xs bg-muted px-2 py-1 rounded-md">Order: {story.order}</span>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="icon" onClick={() => handleEdit(story)}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="destructive" size="icon" onClick={() => handleDelete(story.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {stories.length === 0 && (
                        <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                            <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No success stories added yet.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
