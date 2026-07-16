'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Megaphone, FileText, ExternalLink, Download, Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth-context';

export default function FranchiseMarketingPage() {
    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

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

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Marketing Material</h1>
                    <p className="text-gray-500 mt-1">Download official Techwell banners, brochures, and promo videos to grow your franchise.</p>
                </div>
            </div>

            <Card className="border-blue-100 bg-blue-50/50 dark:bg-slate-900/50 dark:border-slate-800">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Share2 className="w-5 h-5 text-blue-500" />
                        Your Custom Referral Link
                    </CardTitle>
                    <CardDescription>
                        Share this link on your social media or with prospective students. Any signups from this link will be automatically attributed to your franchise!
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Input 
                            readOnly 
                            value={`https://techwell.co.in/register?ref=${user?.franchiseId || 'YOUR_ID'}`} 
                            className="font-mono bg-white dark:bg-slate-950 flex-1" 
                        />
                        <Button variant="default" onClick={() => {
                            navigator.clipboard.writeText(`https://techwell.co.in/register?ref=${user?.franchiseId || 'YOUR_ID'}`);
                            alert("Copied to clipboard!");
                        }}>
                            Copy Link
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Resource Library</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-center py-4">Loading resources...</p>
                    ) : resources.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {resources.map((r: any) => (
                                <div key={r.id} className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all group">
                                    <div className="bg-blue-50 dark:bg-gray-900 p-6 flex justify-center items-center">
                                        {r.resourceType === 'BANNER' ? (
                                            <Megaphone className="w-16 h-16 text-blue-400 group-hover:scale-110 transition-transform" />
                                        ) : r.resourceType === 'VIDEO' ? (
                                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-red-500 border-b-8 border-b-transparent ml-1"></div>
                                            </div>
                                        ) : (
                                            <FileText className="w-16 h-16 text-purple-400 group-hover:scale-110 transition-transform" />
                                        )}
                                    </div>
                                    <div className="p-4 bg-white dark:bg-gray-950">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-semibold text-lg truncate pr-2" title={r.title}>{r.title}</h3>
                                            <Badge variant="secondary" className="flex-shrink-0">{r.resourceType}</Badge>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-4">Published: {new Date(r.createdAt).toLocaleDateString()}</p>
                                        <a 
                                            href={r.fileUrl} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors"
                                        >
                                            <Download className="w-4 h-4" />
                                            <span>Download Asset</span>
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-gray-500 border border-dashed rounded-md bg-gray-50 dark:bg-gray-900/50">
                            <Megaphone className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">Check back soon!</p>
                            <p className="text-sm mt-1 max-w-sm mx-auto">Techwell hasn't uploaded any marketing resources yet. We will notify you when new banners or documents are available.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
