'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, MapPin, ExternalLink, GraduationCap, Briefcase, Handshake } from 'lucide-react';
import { publicApi } from '@/lib/api';

export default function OurPartnersPage() {
    const [loading, setLoading] = useState(true);
    const [partners, setPartners] = useState({
        franchises: [],
        institutes: [],
        clients: []
    });

    useEffect(() => {
        const fetchPartners = async () => {
            try {
                // publicApi doesn't require auth token
                const res = await publicApi.get('/partners');
                if (res.data.success) {
                    setPartners(res.data.data);
                }
            } catch (err) {
                console.error('Failed to fetch partners:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPartners();
    }, []);

    const renderPartnerCard = (partner: any, type: string) => {
        const isSuspended = partner.status === 'SUSPENDED';

        return (
            <Card key={partner.id} className={`overflow-hidden transition-all hover:shadow-lg ${isSuspended ? 'opacity-70 grayscale' : ''}`}>
                <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center overflow-hidden border">
                            {partner.logoUrl ? (
                                <img src={partner.logoUrl} alt={partner.name} className="h-full w-full object-cover" />
                            ) : (
                                <Building2 className="h-8 w-8 text-muted-foreground" />
                            )}
                        </div>
                        {isSuspended && (
                            <Badge variant="destructive">Suspended</Badge>
                        )}
                        {!isSuspended && type === 'franchise' && partner.franchiseType && (
                            <Badge variant="outline">{partner.franchiseType}</Badge>
                        )}
                    </div>
                    
                    <div>
                        <h3 className="text-xl font-bold line-clamp-1" title={partner.name}>{partner.name}</h3>
                        {(partner.city || partner.state) && (
                            <p className="text-sm text-muted-foreground flex items-center mt-1">
                                <MapPin className="h-3 w-3 mr-1" />
                                {partner.city}{partner.city && partner.state ? ', ' : ''}{partner.state}
                            </p>
                        )}
                        {partner.description && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{partner.description}</p>
                        )}
                    </div>

                    {partner.website && !isSuspended && (
                        <a 
                            href={partner.website.startsWith('http') ? partner.website : `https://${partner.website}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                        >
                            Visit Website <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                    )}
                </CardContent>
            </Card>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">Our Network & Partners</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Techwell collaborates with leading franchises, colleges, and industry experts to bring you the best learning experience.
                    </p>
                </div>

                <Tabs defaultValue="franchises" className="w-full">
                    <div className="flex justify-center mb-8">
                        <TabsList className="grid w-full max-w-2xl grid-cols-3 h-12">
                            <TabsTrigger value="franchises" className="text-sm sm:text-base">
                                <Handshake className="w-4 h-4 mr-2 hidden sm:inline-block" /> Franchises
                            </TabsTrigger>
                            <TabsTrigger value="colleges" className="text-sm sm:text-base">
                                <GraduationCap className="w-4 h-4 mr-2 hidden sm:inline-block" /> Colleges
                            </TabsTrigger>
                            <TabsTrigger value="companies" className="text-sm sm:text-base">
                                <Briefcase className="w-4 h-4 mr-2 hidden sm:inline-block" /> Companies
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="franchises" className="space-y-8 mt-0 focus-visible:outline-none">
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {partners.franchises.length === 0 ? (
                                <p className="col-span-full text-center text-muted-foreground py-12">No franchises found.</p>
                            ) : (
                                partners.franchises.map((f: any) => renderPartnerCard(f, 'franchise'))
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="colleges" className="space-y-8 mt-0 focus-visible:outline-none">
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {partners.institutes.length === 0 ? (
                                <p className="col-span-full text-center text-muted-foreground py-12">No colleges found.</p>
                            ) : (
                                partners.institutes.map((i: any) => renderPartnerCard(i, 'institute'))
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="companies" className="space-y-8 mt-0 focus-visible:outline-none">
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {partners.clients.length === 0 ? (
                                <p className="col-span-full text-center text-muted-foreground py-12">No corporate partners found.</p>
                            ) : (
                                partners.clients.map((c: any) => renderPartnerCard(c, 'client'))
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
