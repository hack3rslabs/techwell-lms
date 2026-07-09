"use client";
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from '@/lib/api';
import { useToast } from "@/components/ui/use-toast";
import { Plus, Trash2, ArrowRight, ArrowLeft, CheckCircle2, Briefcase, Users, FileText, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ConsultingFormModal({ isOpen, onClose, project, onSave }) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState([]);
    const [staff, setStaff] = useState([]);
    const [agreements, setAgreements] = useState([]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'BUSINESS',
        clientId: '',
        agreementId: '',
        assigneeId: '',
        status: 'ONBOARDING',
        budget: '',
        startDate: '',
        endDate: '',
        webUrl: '',
        commitment: '',
        notes: ''
    });

    const [contacts, setContacts] = useState([]);

    useEffect(() => {
        if (isOpen) {
            fetchData();
            if (project) {
                setFormData({
                    title: project.title || '',
                    description: project.description || '',
                    type: project.type || 'BUSINESS',
                    clientId: project.clientId || '',
                    agreementId: project.agreementId || '',
                    assigneeId: project.assigneeId || '',
                    status: project.status || 'ONBOARDING',
                    budget: project.budget ? String(project.budget) : '',
                    startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
                    endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
                    webUrl: project.webUrl || '',
                    commitment: project.commitment || '',
                    notes: project.notes || ''
                });
                setContacts(project.contacts && Array.isArray(project.contacts) ? project.contacts : []);
            } else {
                setFormData({
                    title: '',
                    description: '',
                    type: 'BUSINESS',
                    clientId: '',
                    agreementId: '',
                    assigneeId: '',
                    status: 'ONBOARDING',
                    budget: '',
                    startDate: '',
                    endDate: '',
                    webUrl: '',
                    commitment: '',
                    notes: ''
                });
                setContacts([]);
            }
        }
    }, [isOpen, project]);

    const fetchData = async () => {
        try {
            const [usersRes, staffRes, agreementsRes] = await Promise.all([
                api.get('/users?role=STUDENT'), // Using student as client for now
                api.get('/users?role=STAFF'),
                api.get('/crm/agreements').catch(() => ({ data: { agreements: [] } }))
            ]);
            
            if (usersRes.data.success || usersRes.data.users) setClients(usersRes.data.users || usersRes.data);
            if (staffRes.data.success || staffRes.data.users) setStaff(staffRes.data.users || staffRes.data);
            if (agreementsRes.data?.success || agreementsRes.data?.agreements) {
                setAgreements(agreementsRes.data.agreements || []);
            }
        } catch (error) {
            console.error("Failed to fetch form data", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addContact = () => {
        setContacts([...contacts, { name: '', email: '', phone: '' }]);
    };

    const updateContact = (index, field, value) => {
        const newContacts = [...contacts];
        newContacts[index][field] = value;
        setContacts(newContacts);
    };

    const removeContact = (index) => {
        const newContacts = [...contacts];
        newContacts.splice(index, 1);
        setContacts(newContacts);
    };

    const [currentStep, setCurrentStep] = useState(0);
    const steps = [
        { id: 'overview', title: 'Overview', icon: <Briefcase className="w-5 h-5" /> },
        { id: 'client', title: 'Client & CRM', icon: <Users className="w-5 h-5" /> },
        { id: 'delivery', title: 'Delivery & Notes', icon: <FileText className="w-5 h-5" /> }
    ];

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = { ...formData, contacts };

        try {
            if (project) {
                await api.put(`/consulting-projects/${project.id}`, payload);
                toast({ title: "Success", description: "Project updated successfully." });
            } else {
                await api.post(`/consulting-projects`, payload);
                toast({ title: "Success", description: "Project created successfully." });
            }
            onSave();
        } catch (error: any) {
            console.error("Failed to save project", error);
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to save project.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[800px] p-0 border-0 overflow-hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-2xl rounded-2xl">
                <div className="flex flex-col h-full max-h-[90vh]">
                    {/* Header with Gradient */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shrink-0">
                        <DialogTitle className="text-2xl font-bold tracking-tight text-white mb-1">
                            {project ? 'Edit Engagement' : 'Create New Engagement'}
                        </DialogTitle>
                        <DialogDescription className="text-blue-100/80">
                            {project ? 'Update the details for this consulting project.' : 'Add a new Business or IT consulting project.'}
                        </DialogDescription>
                        
                        {/* Premium Wizard Stepper */}
                        <div className="mt-8 flex items-center justify-between relative">
                            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-white/20 -z-0 rounded-full"></div>
                            <div 
                                className="absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-white -z-0 rounded-full transition-all duration-500 ease-in-out"
                                style={{ width: `calc(${currentStep === 0 ? 0 : currentStep === 1 ? 50 : 100}% - ${currentStep === 0 ? 0 : 3}rem)` }}
                            ></div>
                            
                            {steps.map((step, index) => {
                                const isCompleted = index < currentStep;
                                const isCurrent = index === currentStep;
                                
                                return (
                                    <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-all duration-300 shadow-lg",
                                            isCompleted ? "bg-white text-blue-600" : 
                                            isCurrent ? "bg-white text-indigo-600 scale-110 ring-4 ring-white/30" : 
                                            "bg-white/20 text-white backdrop-blur-md border border-white/30"
                                        )}>
                                            {isCompleted ? <Check className="w-6 h-6" /> : step.icon}
                                        </div>
                                        <span className={cn(
                                            "text-xs font-semibold tracking-wide absolute -bottom-6 w-32 text-center",
                                            isCurrent ? "text-white" : "text-white/70"
                                        )}>
                                            {step.title}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 mt-6">
                        <form id="consulting-form" onSubmit={handleSubmit} className="min-h-[400px]">
                            
                            {/* STEP 1: OVERVIEW */}
                            {currentStep === 0 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3 col-span-2">
                                            <Label htmlFor="title" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Project Title *</Label>
                                            <Input id="title" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g. Enterprise Cloud Migration" className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-lg focus-visible:ring-indigo-500" />
                                        </div>
                                        
                                        <div className="space-y-3">
                                            <Label htmlFor="type" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Consulting Type *</Label>
                                            <Select value={formData.type} onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}>
                                                <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-900"><SelectValue placeholder="Select type" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="BUSINESS">Business Consulting</SelectItem>
                                                    <SelectItem value="IT">IT Consulting</SelectItem>
                                                    <SelectItem value="SOFTWARE">Software Development</SelectItem>
                                                    <SelectItem value="WEB">Web Development</SelectItem>
                                                    <SelectItem value="CYBER_SECURITY">Cyber Security</SelectItem>
                                                    <SelectItem value="OTHER">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="status" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Current Status *</Label>
                                            <Select value={formData.status} onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}>
                                                <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-900"><SelectValue placeholder="Select status" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ONBOARDING">Onboarding</SelectItem>
                                                    <SelectItem value="PLANNING">Planning</SelectItem>
                                                    <SelectItem value="EXECUTION">Execution</SelectItem>
                                                    <SelectItem value="REVIEW">Review</SelectItem>
                                                    <SelectItem value="DELIVERY">Delivery</SelectItem>
                                                    <SelectItem value="ON_HOLD">On Hold</SelectItem>
                                                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="budget" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Cost / Budget (₹)</Label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                                                <Input id="budget" name="budget" type="number" value={formData.budget} onChange={handleChange} placeholder="500,000" className="h-12 pl-8 bg-slate-50 dark:bg-slate-900" />
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            <Label htmlFor="assigneeId" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Internal Lead</Label>
                                            <Select value={formData.assigneeId || "none"} onValueChange={(v) => setFormData(prev => ({ ...prev, assigneeId: v === 'none' ? '' : v }))}>
                                                <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-900"><SelectValue placeholder="Assign to..." /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">-- Unassigned --</SelectItem>
                                                    {staff.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="startDate" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Start Date</Label>
                                            <Input id="startDate" name="startDate" type="date" value={formData.startDate} onChange={handleChange} className="h-12 bg-slate-50 dark:bg-slate-900" />
                                        </div>
                                        
                                        <div className="space-y-3">
                                            <Label htmlFor="endDate" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Target Deadline</Label>
                                            <Input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleChange} className="h-12 bg-slate-50 dark:bg-slate-900" />
                                        </div>

                                        <div className="space-y-3 col-span-2">
                                            <Label htmlFor="description" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Executive Summary</Label>
                                            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Outline the main objectives and scope of work..." className="bg-slate-50 dark:bg-slate-900 resize-none" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: CLIENT & CRM */}
                            {currentStep === 1 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                                    <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-5 rounded-xl border border-indigo-100 dark:border-indigo-900/50 space-y-5">
                                        <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                                            <Users className="w-4 h-4" /> Client Details
                                        </h3>
                                        <div className="grid grid-cols-2 gap-5">
                                            <div className="space-y-3 col-span-2 md:col-span-1">
                                                <Label htmlFor="clientId" className="text-sm font-semibold">Client Account (CRM)</Label>
                                                <Select value={formData.clientId || "none"} onValueChange={(v) => setFormData(prev => ({ ...prev, clientId: v === 'none' ? '' : v }))}>
                                                    <SelectTrigger className="h-12 bg-white dark:bg-slate-900"><SelectValue placeholder="Select a client..." /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">-- None --</SelectItem>
                                                        {clients.map((client) => <SelectItem key={client.id} value={client.id}>{client.name} ({client.email})</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-3 col-span-2 md:col-span-1">
                                                <Label htmlFor="agreementId" className="text-sm font-semibold">Client Agreement</Label>
                                                <Select value={formData.agreementId || "none"} onValueChange={(v) => setFormData(prev => ({ ...prev, agreementId: v === 'none' ? '' : v }))}>
                                                    <SelectTrigger className="h-12 bg-white dark:bg-slate-900"><SelectValue placeholder="Select an agreement..." /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">-- None --</SelectItem>
                                                        {agreements.map((a) => <SelectItem key={a.id} value={a.id}>{a.title} ({a.agreementNum})</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-3 col-span-2">
                                                <Label htmlFor="webUrl" className="text-sm font-semibold">Client Website / Related URL</Label>
                                                <Input id="webUrl" name="webUrl" type="url" value={formData.webUrl} onChange={handleChange} placeholder="https://..." className="h-12 bg-white dark:bg-slate-900" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <div className="flex items-center justify-between mb-4">
                                            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Key Stakeholders & Contacts</Label>
                                            <Button type="button" variant="outline" size="sm" onClick={addContact} className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-900/50">
                                                <Plus className="h-4 w-4 mr-1" /> Add Contact
                                            </Button>
                                        </div>
                                        
                                        {contacts.length === 0 ? (
                                            <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
                                                <Users className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                                                <p className="text-sm text-slate-500 font-medium">No external contacts added yet.</p>
                                                <p className="text-xs text-slate-400 mt-1">Add stakeholders to keep track of communications.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {contacts.map((c, index) => (
                                                    <div key={index} className="grid grid-cols-12 gap-3 items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow group relative">
                                                        <div className="col-span-12 md:col-span-4 relative">
                                                            <Input placeholder="Full Name" value={c.name} onChange={(e) => updateContact(index, 'name', e.target.value)} className="h-10 bg-slate-50 dark:bg-slate-950 border-0" />
                                                        </div>
                                                        <div className="col-span-12 md:col-span-4">
                                                            <Input placeholder="Email Address" type="email" value={c.email} onChange={(e) => updateContact(index, 'email', e.target.value)} className="h-10 bg-slate-50 dark:bg-slate-950 border-0" />
                                                        </div>
                                                        <div className="col-span-12 md:col-span-3">
                                                            <Input placeholder="Phone Number" value={c.phone} onChange={(e) => updateContact(index, 'phone', e.target.value)} className="h-10 bg-slate-50 dark:bg-slate-950 border-0" />
                                                        </div>
                                                        <div className="col-span-12 md:col-span-1 flex justify-end">
                                                            <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg" onClick={() => removeContact(index)}>
                                                                <Trash2 className="h-5 w-5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: DELIVERY & NOTES */}
                            {currentStep === 2 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500 h-full flex flex-col">
                                    <div className="space-y-3">
                                        <Label htmlFor="commitment" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Delivery Commitment & Scope Boundaries</Label>
                                        <Textarea id="commitment" name="commitment" value={formData.commitment} onChange={handleChange} rows={5} placeholder="Specifically outline what deliverables were promised to the client, out of scope items, and SLAs..." className="bg-slate-50 dark:bg-slate-900 resize-none text-base p-4 border-slate-200 focus-visible:ring-indigo-500 rounded-xl" />
                                    </div>
                                    
                                    <div className="space-y-3 mt-4">
                                        <Label htmlFor="notes" className="text-sm font-semibold flex items-center gap-2 text-amber-700 dark:text-amber-500">
                                            <FileText className="w-4 h-4" /> Internal Private Notes
                                        </Label>
                                        <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={5} placeholder="Private notes for the internal delivery team. Clients will not see this." className="bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-900/50 resize-none text-base p-4 focus-visible:ring-amber-500 rounded-xl placeholder:text-amber-900/30 dark:placeholder:text-amber-200/30" />
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-between rounded-b-2xl">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={prevStep} 
                            disabled={currentStep === 0}
                            className={cn(
                                "h-12 px-6 rounded-xl font-medium transition-all duration-300",
                                currentStep === 0 ? "opacity-0 pointer-events-none" : "opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700"
                            )}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back
                        </Button>
                        
                        <div className="flex gap-3">
                            <Button type="button" variant="ghost" onClick={onClose} className="h-12 px-6 rounded-xl font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 dark:hover:bg-slate-800">
                                Cancel
                            </Button>
                            
                            {currentStep < steps.length - 1 ? (
                                <Button type="button" onClick={nextStep} className="h-12 px-8 rounded-xl font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 transition-all hover:shadow-indigo-600/40">
                                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            ) : (
                                <Button 
                                    type="submit" 
                                    form="consulting-form"
                                    disabled={loading} 
                                    className="h-12 px-8 rounded-xl font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition-all hover:shadow-emerald-600/40"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <CheckCircle2 className="w-5 h-5" /> Save Project
                                        </span>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
