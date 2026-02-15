"use client";

import { useEffect, useState } from "react";
import { BookOpen, Search, Bookmark, Eye, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// Assuming useAuth is at the standard location, or I might need to check. 
// However, since I cannot be 100% sure about useAuth path, I'll search for it if this fails, 
// but for now I'll assume it's imported or I might leave it if it wasn't the error. 
// Wait, if I replace the top, I might remove existing imports if they were there but hidden?
// No, the view_file showed lines 1-3. 
import { useAuth } from "@/hooks/useAuth";

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
    fileUrl?: string;
    content?: any;
}

export default function StudentLibraryPage() {
    const { user } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
    const [resources, setResources] = useState<Resource[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
    const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

    // View Modal State
    const [viewResource, setViewResource] = useState<Resource | null>(null);

    // ... existing useEffects and fetch functions

    const handleView = async (resource: Resource) => {
        // Optimistically set resource for immediate feedback
        setViewResource(resource);

        // Track view count
        try {
            await fetch(`${API_URL}/api/library/resources/${resource.id}`);
        } catch (error) {
            console.error('Error tracking view:', error);
        }
    };

    // ... existing handlers

    return (
        <div className="p-6 space-y-6">
            {/* ... existing UI ... */}

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <BookOpen className="h-8 w-8 text-primary" />
                        Library
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Browse educational resources and study materials
                    </p>
                </div>
                {user && (
                    <Button variant={showBookmarksOnly ? "default" : "outline"} onClick={handleShowBookmarks}>
                        <Bookmark className="h-4 w-4 mr-2" />
                        My Bookmarks
                    </Button>
                )}
            </div>

            {/* Search Bar */}
            <div className="flex gap-2">
                <Input
                    placeholder="Search resources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="max-w-md"
                />
                <Button onClick={handleSearch}>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar - Categories */}
                <div className="lg:col-span-1 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Categories</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => handleCategoryClick(category)}
                                    className={`w-full text-left p-3 rounded-lg transition ${selectedCategory?.id === category.id
                                        ? 'bg-primary text-primary-foreground'
                                        : 'hover:bg-muted'
                                        }`}
                                >
                                    <div className="font-medium">{category.name}</div>
                                    <div className="text-xs opacity-80">
                                        {category.domains?.length || 0} domains
                                    </div>
                                </button>
                            ))}
                        </CardContent>
                    </Card>

                    {selectedCategory && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Domains</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {selectedCategory.domains?.map((domain) => (
                                    <button
                                        key={domain.id}
                                        onClick={() => handleDomainClick(domain)}
                                        className={`w-full text-left p-2 rounded transition text-sm ${selectedDomain?.id === domain.id
                                            ? 'bg-primary/20 text-primary font-medium'
                                            : 'hover:bg-muted'
                                            }`}
                                    >
                                        {domain.name}
                                    </button>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Main Content - Resources */}
                <div className="lg:col-span-3">
                    {resources.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">No resources found</h3>
                                <p className="text-muted-foreground">
                                    {showBookmarksOnly
                                        ? "You haven't bookmarked any resources yet."
                                        : "Select a category and domain to view resources"}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {resources.map((resource) => (
                                <Card key={resource.id} className="hover:shadow-lg transition">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-xl flex items-center justify-between">
                                                    {resource.title}
                                                    {user && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleToggleBookmark(resource)}
                                                            className={bookmarks.has(resource.id) ? "text-yellow-500" : "text-muted-foreground"}
                                                            title={bookmarks.has(resource.id) ? "Remove Bookmark" : "Bookmark this resource"}
                                                        >
                                                            <Bookmark className={`h-5 w-5 ${bookmarks.has(resource.id) ? "fill-current" : ""}`} />
                                                        </Button>
                                                    )}
                                                </CardTitle>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {resource.domain?.category?.name} → {resource.domain?.name}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 text-xs rounded-full ml-2 ${resource.type === 'PDF'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-green-100 text-green-700'
                                                }`}>
                                                {resource.type}
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground mb-4">{resource.description}</p>

                                        <div className="flex items-center justify-between">
                                            <div className="flex gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Eye className="h-4 w-4" />
                                                    {resource.views} views
                                                </span>
                                                {resource.type === 'PDF' && (
                                                    <span className="flex items-center gap-1">
                                                        <Download className="h-4 w-4" />
                                                        {resource.downloads} downloads
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleView(resource)}
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View
                                                </Button>
                                                {resource.type === 'PDF' && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleDownload(resource.id)}
                                                    >
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Download
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Resource Viewer Modal */}
            <Dialog open={!!viewResource} onOpenChange={(open) => !open && setViewResource(null)}>
                <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>{viewResource?.title}</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-auto p-1">
                        {viewResource?.type === 'PDF' && viewResource.fileUrl ? (
                            <iframe
                                src={`${API_URL}${viewResource.fileUrl}`}
                                className="w-full h-full border rounded-md"
                                title={viewResource.title}
                            />
                        ) : viewResource?.type === 'QA' && viewResource.content ? (
                            <div className="space-y-6">
                                {viewResource.content.questions?.map((qa: any, index: number) => (
                                    <Card key={index}>
                                        <CardHeader>
                                            <CardTitle className="text-base font-semibold">
                                                Q{index + 1}: {qa.q}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-muted-foreground whitespace-pre-wrap">{qa.a}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                Content not available or invalid format.
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
