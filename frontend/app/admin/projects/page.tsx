"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Plus, BarChart3, FolderGit2, Users, IndianRupee, Eye, Pencil, Trash2, Globe, Lock } from "lucide-react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CreateProjectModal } from "./CreateProjectModal";
import { EditProjectModal } from "./EditProjectModal";
import { ViewProjectModal } from "./ViewProjectModal";

interface DashboardStats {
    totalProjects: number;
    totalRequests: number;
    totalSell: number;
    recentProjects: any[];
    recentRequests: any[];
}

export default function AdminProjectsDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Modals state
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<any>(null);

    const fetchStats = async () => {
        try {
            const res = await api.get('/projects/dashboard-stats');
            setStats(res.data);
        } catch (error) {
            console.error("Failed to fetch dashboard stats", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
        try {
            await api.delete(`/projects/${id}`);
            toast.success("Project deleted successfully");
            fetchStats();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete project");
        }
    };

    const handleTogglePublish = async (project: any) => {
        try {
            await api.put(`/projects/${project.id}`, {
                ...project,
                isPublished: !project.isPublished
            });
            toast.success(`Project ${!project.isPublished ? 'Published' : 'Drafted'}`);
            fetchStats();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update project status");
        }
    };

    const openEdit = (project: any) => {
        setSelectedProject(project);
        setEditModalOpen(true);
    };

    const openView = (project: any) => {
        setSelectedProject(project);
        setViewModalOpen(true);
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-[400px]">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Project Management Dashboard</h1>
                    <p className="text-muted-foreground">Monitor projects, requests, and total sales.</p>
                </div>
                <CreateProjectModal onSuccess={fetchStats} />
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                        <FolderGit2 className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalProjects || 0}</div>
                        <p className="text-xs text-muted-foreground">Total projects listed</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                        <Users className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalRequests || 0}</div>
                        <p className="text-xs text-muted-foreground">From students</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Sell</CardTitle>
                        <IndianRupee className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{stats?.totalSell.toLocaleString("en-IN") || 0}</div>
                        <p className="text-xs text-muted-foreground">Approved requests revenue</p>
                    </CardContent>
                </Card>
            </div>

            {/* Lists */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Manage Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats?.recentProjects?.map((project) => (
                                <div key={project.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-4 last:border-0 last:pb-0">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-lg">{project.title}</h4>
                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${project.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                {project.isPublished ? 'Published' : 'Draft'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{project.category} • ₹{project.price}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleTogglePublish(project)}>
                                            {project.isPublished ? <Lock className="w-4 h-4 mr-1" /> : <Globe className="w-4 h-4 mr-1" />}
                                            {project.isPublished ? "Draft" : "Publish"}
                                        </Button>
                                        <Button variant="outline" size="icon" onClick={() => openView(project)}>
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                        <Button variant="outline" size="icon" onClick={() => openEdit(project)}>
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button variant="outline" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(project.id, project.title)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {stats?.recentProjects?.length === 0 && <p className="text-sm text-muted-foreground">No projects found.</p>}
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats?.recentRequests?.map((req) => (
                                <div key={req.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                    <div>
                                        <h4 className="font-semibold">{req.user?.name}</h4>
                                        <p className="text-sm text-muted-foreground">{req.project?.title}</p>
                                    </div>
                                    <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                                        req.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                        req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                        {req.status}
                                    </div>
                                </div>
                            ))}
                            {stats?.recentRequests?.length === 0 && <p className="text-sm text-muted-foreground">No requests found.</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <EditProjectModal 
                open={editModalOpen} 
                onOpenChange={setEditModalOpen} 
                onSuccess={fetchStats} 
                project={selectedProject} 
            />
            
            <ViewProjectModal 
                open={viewModalOpen} 
                onOpenChange={setViewModalOpen} 
                project={selectedProject} 
            />
        </div>
    );
}
