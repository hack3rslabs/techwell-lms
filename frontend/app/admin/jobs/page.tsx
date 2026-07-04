"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Search, Building2, MapPin, Briefcase, Users, Eye, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { jobsApi } from "@/lib/api";
import Link from "next/link";

interface Job {
    id: string;
    title: string;
    description: string;
    requirements?: string;
    location: string;
    type: string;
    status: string;
    experience?: string;
    salary?: string;
    skills?: string;
    clientName?: string;
    shift?: string;
    _count?: {
        applications: number;
    };
    employer?: {
        name: string;
        employerProfile?: {
            companyName: string;
        }
    }
}

export default function AdminJobs() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingJob, setEditingJob] = useState<Job | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        requirements: "",
        location: "",
        type: "FULL_TIME",
        experience: "",
        salary: "",
        skills: "",
        clientName: "",
        shift: "",
        status: "OPEN"
    });

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const res = await jobsApi.getAdminListings();
            setJobs(res.data);
        } catch (error) {
            console.error("Failed to fetch jobs", error);
            toast.error("Failed to load jobs");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingJob) {
                await jobsApi.update(editingJob.id, formData);
                toast.success("Job updated successfully");
            } else {
                await jobsApi.create(formData);
                toast.success("Job posted successfully");
            }
            setIsDialogOpen(false);
            fetchJobs();
            resetForm();
        } catch (error: any) {
            console.error("Error saving job", error);
            toast.error(error.response?.data?.error || "Failed to save job");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (job: Job) => {
        setEditingJob(job);
        setFormData({
            title: job.title,
            description: job.description,
            requirements: job.requirements || "",
            location: job.location,
            type: job.type,
            experience: job.experience || "",
            salary: job.salary || "",
            skills: job.skills || "",
            clientName: job.clientName || "",
            shift: job.shift || "",
            status: job.status
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this job listing?")) return;
        try {
            await jobsApi.delete(id);
            toast.success("Job deleted successfully");
            fetchJobs();
        } catch (error: any) {
            console.error("Error deleting job", error);
            toast.error(error.response?.data?.error || "Failed to delete job");
        }
    };

    const resetForm = () => {
        setEditingJob(null);
        setFormData({
            title: "",
            description: "",
            requirements: "",
            location: "",
            type: "FULL_TIME",
            experience: "",
            salary: "",
            skills: "",
            clientName: "",
            shift: "",
            status: "OPEN"
        });
    };

    const filteredJobs = jobs.filter((j) =>
        j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.employer?.employerProfile?.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PUBLISHED': return 'bg-green-100 text-green-700 border-green-200';
            case 'OPEN': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'DRAFT': return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'CLOSED': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="p-8 space-y-8 min-h-screen bg-gray-50/30">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Job Board Management</h1>
                    <p className="text-muted-foreground mt-1">Create and manage job listings for students.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm} className="gap-2 bg-primary hover:bg-primary/90 shadow-sm">
                            <Plus className="w-4 h-4" /> Post New Job
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">
                                {editingJob ? "Edit Job Listing" : "Post a New Job"}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-sm font-semibold">Job Title *</Label>
                                    <Input
                                        id="title"
                                        required
                                        placeholder="e.g. Senior Frontend Engineer"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="type" className="text-sm font-semibold">Job Type *</Label>
                                    <Select 
                                        value={formData.type} 
                                        onValueChange={(v) => setFormData({ ...formData, type: v })}
                                    >
                                        <SelectTrigger id="type">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="FULL_TIME">Full Time</SelectItem>
                                            <SelectItem value="PART_TIME">Part Time</SelectItem>
                                            <SelectItem value="INTERNSHIP">Internship</SelectItem>
                                            <SelectItem value="CONTRACT">Contract</SelectItem>
                                            <SelectItem value="FREELANCE">Freelance</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location" className="text-sm font-semibold">Location *</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            id="location"
                                            required
                                            className="pl-9"
                                            placeholder="e.g. Remote, Bangalore, India"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="experience" className="text-sm font-semibold">Experience Required</Label>
                                    <Input
                                        id="experience"
                                        placeholder="e.g. 2-4 years, Freshers"
                                        value={formData.experience}
                                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="salary" className="text-sm font-semibold">Salary Range</Label>
                                    <Input
                                        id="salary"
                                        placeholder="e.g. ₹8L - ₹12L PA"
                                        value={formData.salary}
                                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status" className="text-sm font-semibold">Status *</Label>
                                    <Select 
                                        value={formData.status} 
                                        onValueChange={(v) => setFormData({ ...formData, status: v })}
                                    >
                                        <SelectTrigger id="status">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="OPEN">Open</SelectItem>
                                            <SelectItem value="DRAFT">Draft</SelectItem>
                                            <SelectItem value="CLOSED">Closed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="clientName" className="text-sm font-semibold">Client / Company Name</Label>
                                    <Input
                                        id="clientName"
                                        placeholder="Internal or Client name"
                                        value={formData.clientName}
                                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="skills" className="text-sm font-semibold">Required Skills (Comma separated)</Label>
                                <Input
                                    id="skills"
                                    placeholder="e.g. React, Node.js, TypeScript, AWS"
                                    value={formData.skills}
                                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-sm font-semibold">Job Description *</Label>
                                <Textarea
                                    id="description"
                                    required
                                    className="min-h-[120px]"
                                    placeholder="Describe the role, responsibilities, and team..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="requirements" className="text-sm font-semibold">Requirements / Qualifications</Label>
                                <Textarea
                                    id="requirements"
                                    className="min-h-[100px]"
                                    placeholder="Educational background, specific certifications..."
                                    value={formData.requirements}
                                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Saving..." : (editingJob ? "Update Job" : "Post Job Listing")}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search by title or company..."
                            className="pl-9 bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50">
                                <TableHead className="font-semibold text-gray-700">Job Title</TableHead>
                                <TableHead className="font-semibold text-gray-700">Company</TableHead>
                                <TableHead className="font-semibold text-gray-700">Location</TableHead>
                                <TableHead className="font-semibold text-gray-700">Apps</TableHead>
                                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} className="animate-pulse">
                                        <TableCell colSpan={6} className="h-16 bg-gray-50/50"></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredJobs.map((job) => (
                                <TableRow key={job.id} className="hover:bg-gray-50/80 transition-colors">
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900">{job.title}</span>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className="text-[10px] font-medium uppercase tracking-wider">
                                                    {job.type.replace('_', ' ')}
                                                </Badge>
                                                {job.experience && (
                                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> {job.experience}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                                                <Building2 className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">
                                                {job.employer?.employerProfile?.companyName || "Internal"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                            {job.location}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5">
                                            <Users className="w-4 h-4 text-primary" />
                                            <span className="font-semibold text-gray-900">{job._count?.applications || 0}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`border ${getStatusColor(job.status)} shadow-none font-medium`}>
                                            {job.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/admin/jobs/${job.id}/applications`}>
                                                <Button variant="ghost" size="sm" className="gap-2 h-8">
                                                    <Eye className="w-4 h-4" /> Apps
                                                </Button>
                                            </Link>
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(job)}>
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(job.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredJobs.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-48 py-10">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <Briefcase className="w-12 h-12 mb-2 opacity-20" />
                                            <p className="text-lg font-medium">No job listings found</p>
                                            <p className="text-sm">Start by posting your first job opportunity.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
