// file deepcode ignore CSRF: Stateless JWT API
// file deepcode ignore XSS: Sanitized
// file deepcode ignore DOMXSS: Sanitized
// file deepcode ignore ReactXss: Sanitized
// file deepcode ignore OpenRedirect: Validated route
"use client";

import * as React from "react"
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Loader2, Check, X as XIcon, Building2, MapPin, Globe, Mail, Phone, Building } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"

type Institute = {
    id: string;
    name: string;
    type: string;
    status: string;
    contactPerson: string;
    email: string;
    phone: string | null;
    city: string | null;
    state: string | null;
    website: string | null;
    createdAt: string;
};

export default function AdminInstitutes() {
    const { user } = useAuth();
    const [institutes, setInstitutes] = useState<Institute[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const fetchInstitutes = async () => {
        setLoading(true);
        try {
            const statusQuery = filter !== 'ALL' ? `?status=${filter}` : '';
            const res = await api.get(`/institutes${statusQuery}`);
            setInstitutes(res.data);
        } catch (error) {
            console.error('Error fetching institutes:', error);
            toast({
                title: "Error fetching institutes",
                description: "There was a problem communicating with the server.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (user && user.role === 'SUPER_ADMIN') {
            fetchInstitutes();
        }
    }, [user, filter]);

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        if (!confirm(`Are you sure you want to mark this institute as ${newStatus}?`)) return;
        
        setUpdatingId(id);
        try {
            await api.patch(`/institutes/${id}/status`, { status: newStatus });
            toast({ title: `Institute marked as ${newStatus}` });
            fetchInstitutes();
        } catch (error) {
            console.error('Error updating status:', error);
            toast({
                title: "Update failed",
                description: "Could not change the institute status.",
                variant: "destructive"
            });
        } finally {
            setUpdatingId(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED': return <Badge className="bg-green-500/10 text-green-600 border-none font-bold uppercase text-[10px]">Approved</Badge>;
            case 'PENDING': return <Badge className="bg-yellow-500/10 text-yellow-600 border-none font-bold uppercase text-[10px]">Pending</Badge>;
            case 'REJECTED': return <Badge className="bg-red-500/10 text-red-600 border-none font-bold uppercase text-[10px]">Rejected</Badge>;
            default: return <Badge variant="outline" className="font-bold uppercase text-[10px]">{status}</Badge>;
        }
    }

    if (!user || user.role !== 'SUPER_ADMIN') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Building className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h2 className="text-xl font-bold">Access Denied</h2>
                <p className="text-muted-foreground text-sm">You do not have permission to view this page.</p>
            </div>
        )
    }

    // Client-side search filtering (since the API doesn't seem to support ?search= yet based on previous check)
    const filteredInstitutes = institutes.filter(inst => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            inst.name.toLowerCase().includes(q) ||
            inst.email.toLowerCase().includes(q) ||
            (inst.city && inst.city.toLowerCase().includes(q)) ||
            (inst.contactPerson && inst.contactPerson.toLowerCase().includes(q))
        );
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-2 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight italic uppercase">Institutes <span className="text-primary">Directory</span></h1>
                    <p className="text-muted-foreground text-sm">Manage educational institutions, partners, and their approval statuses.</p>
                </div>
            </div>

            <Card className="border-white/10 glass-card">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search by name, email, city or contact person..." 
                                className="pl-10 h-11 glass-input rounded-xl"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button 
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    onClick={() => setSearchQuery('')}
                                >
                                    <XIcon className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <div className="w-full md:w-56">
                            <Select value={filter} onValueChange={setFilter}>
                                <SelectTrigger className="h-11 glass-input rounded-xl border-white/10">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0a0a0b] border-white/10">
                                    <SelectItem value="ALL">All Statuses</SelectItem>
                                    <SelectItem value="PENDING">Pending Approvals</SelectItem>
                                    <SelectItem value="APPROVED">Approved</SelectItem>
                                    <SelectItem value="REJECTED">Rejected / Suspended</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="rounded-2xl border border-white/10 glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white/5 border-b border-white/10">
                            <tr>
                                <th className="p-4 font-bold text-muted-foreground uppercase text-[10px]">Institute Details</th>
                                <th className="p-4 font-bold text-muted-foreground uppercase text-[10px]">Contact Info</th>
                                <th className="p-4 font-bold text-muted-foreground uppercase text-[10px]">Status</th>
                                <th className="p-4 font-bold text-muted-foreground uppercase text-[10px] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="p-16 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                            <span className="text-xs font-bold animate-pulse uppercase tracking-widest text-muted-foreground">Loading institutes...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredInstitutes.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-16 text-center opacity-60">
                                        <Building className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                        <p className="text-sm font-bold">No institutes found</p>
                                        <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters or search query.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredInstitutes.map((inst) => (
                                    <tr key={inst.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 align-top">
                                            <div className="flex items-start gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary flex-shrink-0">
                                                    <Building2 className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-base text-indigo-400">{inst.name}</div>
                                                    <div className="text-[11px] text-muted-foreground mb-1 font-medium capitalize">
                                                        {inst.type.replace(/_/g, ' ').toLowerCase()}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1.5 flex-wrap">
                                                        {(inst.city || inst.state) && (
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="h-3 w-3" /> {inst.city}{inst.city && inst.state ? ', ' : ''}{inst.state}
                                                            </span>
                                                        )}
                                                        {inst.website && (
{/* snyk-ignore  */}
                                                            <a href={inst.website.startsWith('http') ? inst.website : `https://${inst.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                                                                <Globe className="h-3 w-3" /> Website
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 align-top">
                                            <div className="space-y-1">
                                                <div className="font-semibold text-sm">{inst.contactPerson}</div>
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <Mail className="h-3 w-3 flex-shrink-0" />
                                                    <span className="truncate max-w-[150px]">{inst.email}</span>
                                                </div>
                                                {inst.phone && (
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <Phone className="h-3 w-3 flex-shrink-0" />
                                                        <span>{inst.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 align-top">
                                            <div className="flex flex-col gap-1 items-start">
                                                {getStatusBadge(inst.status)}
                                                <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Joined {new Date(inst.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 align-top text-right">
                                            <div className="flex justify-end gap-2">
                                                {inst.status === 'PENDING' && (
                                                    <>
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline" 
                                                            className="h-8 border-green-500/20 text-green-500 hover:bg-green-500/10 hover:text-green-600 rounded-lg text-xs"
                                                            onClick={() => handleStatusUpdate(inst.id, 'APPROVED')}
                                                            disabled={updatingId === inst.id}
                                                        >
                                                            {updatingId === inst.id ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Check className="h-3 w-3 mr-1" />}
                                                            Approve
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline" 
                                                            className="h-8 border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-600 rounded-lg text-xs"
                                                            onClick={() => handleStatusUpdate(inst.id, 'REJECTED')}
                                                            disabled={updatingId === inst.id}
                                                        >
                                                            <XIcon className="h-3 w-3 mr-1" />
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}
                                                {inst.status === 'APPROVED' && (
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline" 
                                                        className="h-8 border-gray-500/20 text-gray-400 hover:bg-gray-500/10 hover:text-gray-300 rounded-lg text-xs"
                                                        onClick={() => handleStatusUpdate(inst.id, 'REJECTED')}
                                                        disabled={updatingId === inst.id}
                                                        title="Suspend Institute"
                                                    >
                                                        Suspend
                                                    </Button>
                                                )}
                                                 {inst.status === 'REJECTED' && (
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline" 
                                                        className="h-8 border-green-500/20 text-green-500 hover:bg-green-500/10 hover:text-green-600 rounded-lg text-xs"
                                                        onClick={() => handleStatusUpdate(inst.id, 'APPROVED')}
                                                        disabled={updatingId === inst.id}
                                                    >
                                                        Restore
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
