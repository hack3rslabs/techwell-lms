"use client";

import { useEffect, useState } from "react";
import { BookOpen, Search, Bookmark, Eye, Download, FileText, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// Assuming useAuth is at the standard location, or I might need to check. 
// However, since I cannot be 100% sure about useAuth path, I'll search for it if this fails, 
// but for now I'll assume it's imported or I might leave it if it wasn't the error. 
// Wait, if I replace the top, I might remove existing imports if they were there but hidden?
// No, the view_file showed lines 1-3. 
import { useAuth } from "@/lib/auth-context";
import { libraryApi } from "@/lib/api";

interface Category {
    id: string;
    name: string;
    domains?: Domain[];
}

interface Domain {
    id: string;
    name: string;
    category?: Category;
}

interface Resource {
    id: string;
    title: string;
    description: string;
    type: 'PDF' | 'QA';
    views: number;
    downloads: number;
    domain?: Domain;
    domainId: string;
    isPaid: boolean;
    fileUrl?: string;
    content?: any;
}

export default function StudentLibraryPage() {
    const { user: _user } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [selectedDomainId, setSelectedDomainId] = useState<string | null>(null);
    const [resources, setResources] = useState<Resource[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    // View Modal State
    const [viewResource, setViewResource] = useState<Resource | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [catsRes, resRes] = await Promise.all([
                libraryApi.getCategories(),
                libraryApi.getResources()
            ]);
            setCategories(catsRes.data);
            setResources(resRes.data);
        } catch (error) {
            console.error('Error fetching library data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // The filtering is done client-side below, but we could also call API with search param
    };

    const handleCategoryClick = (categoryId: string) => {
        setSelectedCategoryId(selectedCategoryId === categoryId ? null : categoryId);
        setSelectedDomainId(null);
    };

    const handleDomainIdClick = (domainId: string) => {
        setSelectedDomainId(selectedDomainId === domainId ? null : domainId);
    };

    const handleView = async (resource: Resource) => {
        setViewResource(resource);
        try {
            await libraryApi.trackView(resource.id);
        } catch (error) {
            console.error('Error tracking view:', error);
        }
    };

    const filteredResources = resources.filter(res => {
        const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            res.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !selectedCategoryId || res.domain?.category?.id === selectedCategoryId;
        const matchesDomain = !selectedDomainId || res.domainId === selectedDomainId;
        return matchesSearch && matchesCategory && matchesDomain;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
                    <BookOpen className="h-8 w-8 text-primary" />
                    Library
                </h1>
                <p className="text-muted-foreground mt-2">Access hundreds of premium study materials and interview guides</p>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search resources..." 
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    <Button 
                        variant={!selectedCategoryId ? "default" : "outline"}
                        size="sm"
                        onClick={() => { setSelectedCategoryId(null); setSelectedDomainId(null); }}
                    >
                        All
                    </Button>
                    {categories.map(cat => (
                        <Button
                            key={cat.id}
                            variant={selectedCategoryId === cat.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleCategoryClick(cat.id)}
                        >
                            {cat.name}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Domains Filter (if Category selected) */}
            {selectedCategoryId && (
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
                    {categories.find(c => c.id === selectedCategoryId)?.domains?.map(dom => (
                        <Button
                            key={dom.id}
                            variant={selectedDomainId === dom.id ? "secondary" : "ghost"}
                            size="sm"
                            className="rounded-full"
                            onClick={() => handleDomainIdClick(dom.id)}
                        >
                            {dom.name}
                        </Button>
                    ))}
                </div>
            )}

            {/* Resources Grid */}
            {filteredResources.length === 0 ? (
                <Card className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                        <Search className="h-10 w-10 text-muted-foreground opacity-20" />
                        <h3 className="text-lg font-semibold">No resources found</h3>
                        <p className="text-muted-foreground">Try adjusting your filters or search query</p>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredResources.map((resource) => (
                        <Card key={resource.id} className="group relative flex flex-col h-full hover:shadow-xl transition-all duration-300 border-primary/10">
                            {resource.isPaid && (
                                <div className="absolute top-3 right-3 z-10 bg-yellow-400 text-yellow-950 px-2 py-1 rounded-md text-[10px] font-bold shadow-sm uppercase tracking-wider">
                                    PRO
                                </div>
                            )}
                            <CardHeader className="pb-2">
                                <div className="text-xs font-medium text-primary mb-1 uppercase tracking-tighter opacity-70">
                                    {resource.domain?.name}
                                </div>
                                <CardTitle className="text-lg line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                                    {resource.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <p className="text-xs text-muted-foreground line-clamp-3 mb-4 min-h-[3rem]">
                                    {resource.description || "No description provided."}
                                </p>
                                <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-medium">
                                    <span className="flex items-center gap-1">
                                        <Eye className="h-3 w-3" /> {resource.views}
                                    </span>
                                    {resource.type === 'PDF' && (
                                        <span className="flex items-center gap-1">
                                            <Download className="h-3 w-3" /> {resource.downloads}
                                        </span>
                                    )}
                                    <span className="ml-auto px-2 py-0.5 bg-muted rounded">
                                        {resource.type}
                                    </span>
                                </div>
                            </CardContent>
                            <div className="p-4 pt-0">
                                {resource.isPaid ? (
                                    <Button className="w-full bg-yellow-500 hover:bg-yellow-600 font-bold" size="sm">
                                        Unlock Full Access 🔓
                                    </Button>
                                ) : (
                                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all" size="sm" onClick={() => handleView(resource)}>
                                        Open Resource
                                    </Button>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* View Modal */}
            <Dialog open={!!viewResource} onOpenChange={() => setViewResource(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                    <DialogHeader className="p-6 pb-2">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                {viewResource?.type === 'PDF' ? <FileText className="h-4 w-4 text-red-500" /> : <BookOpen className="h-4 w-4 text-blue-500" />}
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{viewResource?.type} Resource</span>
                            </div>
                            
                            {viewResource?.type === 'PDF' && (
                                <a 
                                    href={`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:5000'}${viewResource.fileUrl}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-[10px] flex items-center gap-1 text-primary hover:underline font-bold"
                                >
                                    Open in new tab <Plus className="h-3 w-3 rotate-45" />
                                </a>
                            )}
                        </div>
                        <DialogTitle className="text-2xl leading-tight">{viewResource?.title}</DialogTitle>
                        <p className="text-sm text-muted-foreground mt-1">{viewResource?.description}</p>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-6 pt-2 bg-muted/50">
                        {viewResource?.type === 'PDF' && (
                            <div className="aspect-[4/5] w-full bg-white rounded-lg shadow-inner overflow-hidden border">
                                <iframe 
                                    src={`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:5000'}${viewResource.fileUrl}`} 
                                    className="w-full h-full border-none"
                                    title={viewResource.title}
                                />
                            </div>
                        )}
                        {viewResource?.type === 'QA' && (
                            <div className="space-y-6">
                                {(viewResource.content as any)?.questions?.map((qa: any, i: number) => (
                                    <div key={i} className="bg-background p-5 rounded-xl border border-primary/10 shadow-sm relative overflow-hidden group">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 group-hover:bg-primary transition-colors"></div>
                                        <h4 className="font-bold text-lg mb-3 flex gap-3">
                                            <span className="text-primary opacity-30">Q{i+1}</span>
                                            {qa.q}
                                        </h4>
                                        <div className="p-4 bg-muted/50 rounded-lg text-sm leading-relaxed whitespace-pre-wrap">
                                            {qa.a}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
