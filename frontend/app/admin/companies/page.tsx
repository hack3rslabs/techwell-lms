"use client";

import * as React from "react"
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Loader2, Check, X as XIcon, Building2, MapPin, Globe, Mail, Phone } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"

type EmployerUser = {
    id: string;
    email: string;
    name: string;
    phone: string | null;
    isActive: boolean;
    createdAt: string;
}

type Employer = {
    id: string;
    userId: string;
    companyName: string;
    industry: string | null;
    status: string;
    location: string | null;
    website: string | null;
    createdAt: string;
    user?: EmployerUser;
};

export default function AdminCompanies() {
    const { user, hasPermission } = useAuth();
    const [employers, setEmployers] = useState<Employer[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const fetchEmployers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filter !== 'ALL') params.append('status', filter);
            if (debouncedSearch) params.append('search', debouncedSearch);

            const res = await api.get(`/employers/all?${params.toString()}`);
            setEmployers(res.data);
        } catch (error) {
            console.error('Error fetching employers:', error);
            toast({
                title: "Error fetching employers",
                description: "There was a problem communicating with the server.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (user && user.role === 'SUPER_ADMIN') {
            fetchEmployers();
        }
    }, [user, filter, debouncedSearch]);

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        if (!confirm(`Are you sure you want to mark this company as ${newStatus}?`)) return;
        
        setUpdatingId(id);
        try {
            await api.put(`/employers/${id}/status`, { status: newStatus });
            toast({ title: `Company marked as ${newStatus}` });
            fetchEmployers();
        } catch (error) {
            console.error('Error updating status:', error);
            toast({
                title: "Update failed",
                description: "Could not change the employer status.",
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
            case 'CANCELLED_APPROVAL': return <Badge className="bg-gray-500/10 text-gray-600 border-none font-bold uppercase text-[10px]">Cancelled</Badge>;
            default: return <Badge variant="outline" className="font-bold uppercase text-[10px]">{status}</Badge>;
        }
    }

    if (!user || user.role !== 'SUPER_ADMIN') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Building2 className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h2 className="text-xl font-bold">Access Denied</h2>
                <p className="text-muted-foreground text-sm">You do not have permission to view this page.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight italic uppercase">Companies <span className="text-primary">Directory</span></h1>
                    <p className="text-muted-foreground text-sm">Manage employer profiles, view requests, and update approval statuses.</p>
                </div>
            </div>

            <Card className="border-white/10 glass-card">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search by company name, email, or contact person..." 
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
                                    <SelectItem value="REJECTED">Rejected</SelectItem>
                                    <SelectItem value="CANCELLED_APPROVAL">Cancelled</SelectItem>
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
                                <th className="p-4 font-bold text-muted-foreground uppercase text-[10px]">Company Details</th>
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
                                            <span className="text-xs font-bold animate-pulse uppercase tracking-widest text-muted-foreground">Loading companies...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : employers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-16 text-center opacity-60">
                                        <Building2 className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                        <p className="text-sm font-bold">No companies found</p>
                                        <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters or search query.</p>
                                    </td>
                                </tr>
                            ) : (
                                employers.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 align-top">
                                            <div className="flex items-start gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary flex-shrink-0">
                                                    {emp.companyName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-base">{emp.companyName}</div>
                                                    {emp.industry && <div className="text-[11px] text-muted-foreground mb-1">Industry: {emp.industry}</div>}
                                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1.5">
                                                        {emp.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {emp.location}</span>}
                                                        {emp.website && <a href={emp.website.startsWith('http') ? emp.website : `https://${emp.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline"><Globe className="h-3 w-3" /> Website</a>}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 align-top">
                                            {emp.user ? (
                                                <div className="space-y-1">
                                                    <div className="font-semibold text-sm">{emp.user.name}</div>
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <Mail className="h-3 w-3 flex-shrink-0" />
                                                        <span className="truncate max-w-[150px]">{emp.user.email}</span>
                                                    </div>
                                                    {emp.user.phone && (
                                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                            <Phone className="h-3 w-3 flex-shrink-0" />
                                                            <span>{emp.user.phone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground italic">No linked account</span>
                                            )}
                                        </td>
                                        <td className="p-4 align-top">
                                            <div className="flex flex-col gap-1 items-start">
                                                {getStatusBadge(emp.status)}
                                                <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Joined {new Date(emp.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 align-top text-right">
                                            <div className="flex justify-end gap-2">
                                                {emp.status === 'PENDING' && (
                                                    <>
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline" 
                                                            className="h-8 border-green-500/20 text-green-500 hover:bg-green-500/10 hover:text-green-600 rounded-lg text-xs"
                                                            onClick={() => handleStatusUpdate(emp.id, 'APPROVED')}
                                                            disabled={updatingId === emp.id}
                                                        >
                                                            {updatingId === emp.id ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Check className="h-3 w-3 mr-1" />}
                                                            Approve
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline" 
                                                            className="h-8 border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-600 rounded-lg text-xs"
                                                            onClick={() => handleStatusUpdate(emp.id, 'REJECTED')}
                                                            disabled={updatingId === emp.id}
                                                        >
                                                            <XIcon className="h-3 w-3 mr-1" />
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}
                                                {emp.status === 'APPROVED' && (
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline" 
                                                        className="h-8 border-gray-500/20 text-gray-400 hover:bg-gray-500/10 hover:text-gray-300 rounded-lg text-xs"
                                                        onClick={() => handleStatusUpdate(emp.id, 'CANCELLED_APPROVAL')}
                                                        disabled={updatingId === emp.id}
                                                        title="Revoke Approval"
                                                    >
                                                        Revoke Access
                                                    </Button>
                                                )}
                                                 {emp.status === 'REJECTED' && (
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline" 
                                                        className="h-8 border-green-500/20 text-green-500 hover:bg-green-500/10 hover:text-green-600 rounded-lg text-xs"
                                                        onClick={() => handleStatusUpdate(emp.id, 'APPROVED')}
                                                        disabled={updatingId === emp.id}
                                                    >
                                                        Re-Approve
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
