'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Plus, GraduationCap, Briefcase } from 'lucide-react';
import { api } from '@/lib/api';

export default function PartnersManagementPage() {
    const [loading, setLoading] = useState(true);
    const [partners, setPartners] = useState({
        institutes: [],
        clients: []
    });

    useEffect(() => {
        const fetchPartners = async () => {
            try {
                // Fetch using our public api endpoint for now to view, 
                // but real admin should have separate endpoints to create/delete
                const res = await api.get('/partners');
                if (res.data.success) {
                    setPartners({
                        institutes: res.data.data.institutes || [],
                        clients: res.data.data.clients || []
                    });
                }
            } catch (err) {
                console.error('Failed to fetch partners:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPartners();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Partner Management (CMS)</h2>
                    <p className="text-muted-foreground">Manage Colleges & Companies that appear on the Our Partners page.</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Partner
                </Button>
            </div>

            <Tabs defaultValue="colleges" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="colleges"><GraduationCap className="w-4 h-4 mr-2" /> Colleges / Institutes</TabsTrigger>
                    <TabsTrigger value="companies"><Briefcase className="w-4 h-4 mr-2" /> Corporate Clients</TabsTrigger>
                </TabsList>

                <TabsContent value="colleges">
                    <Card>
                        <CardHeader>
                            <CardTitle>Colleges & Institutes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Logo</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Website</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {partners.institutes.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No colleges found.</TableCell>
                                        </TableRow>
                                    ) : partners.institutes.map((inst: any) => (
                                        <TableRow key={inst.id}>
                                            <TableCell>
                                                {inst.logoUrl ? <img src={inst.logoUrl} alt="Logo" className="w-10 h-10 rounded object-cover" /> : <Building2 className="w-6 h-6 text-muted-foreground" />}
                                            </TableCell>
                                            <TableCell className="font-medium">{inst.name}</TableCell>
                                            <TableCell>{inst.city}, {inst.state}</TableCell>
                                            <TableCell>
                                                {inst.website ? <a href={inst.website} target="_blank" className="text-blue-500 hover:underline">{inst.website}</a> : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge>Active</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="companies">
                    <Card>
                        <CardHeader>
                            <CardTitle>Corporate Clients</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Website</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {partners.clients.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No corporate clients found.</TableCell>
                                        </TableRow>
                                    ) : partners.clients.map((client: any) => (
                                        <TableRow key={client.id}>
                                            <TableCell className="font-medium">{client.name}</TableCell>
                                            <TableCell className="max-w-xs truncate">{client.description}</TableCell>
                                            <TableCell>
                                                {client.url ? <a href={client.url} target="_blank" className="text-blue-500 hover:underline">{client.url}</a> : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge>Active</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
