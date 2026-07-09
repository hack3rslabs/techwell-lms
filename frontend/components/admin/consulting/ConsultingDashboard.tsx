"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Briefcase, DollarSign, Users, Activity, FileCode2, LayoutDashboard, Search, Filter } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from '@/lib/api';
import { useToast } from "@/components/ui/use-toast";
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { ConsultingFormModal } from './ConsultingFormModal';

const KANBAN_COLUMNS = [
    { id: 'ONBOARDING', title: 'Onboarding' },
    { id: 'PLANNING', title: 'Planning' },
    { id: 'EXECUTION', title: 'Execution' },
    { id: 'REVIEW', title: 'Review' },
    { id: 'DELIVERY', title: 'Delivery' }
];

export default function ConsultingDashboard({ type: initialType = 'ALL' }) {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState(initialType);
    const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [assigneeFilter, setAssigneeFilter] = useState('ALL');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [staff, setStaff] = useState([]);
    const { toast } = useToast();

    useEffect(() => {
        fetchProjects();
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const res = await api.get(`/users?role=STAFF`);
            if (res.data.success || res.data.users) {
                setStaff(res.data.users || res.data);
            }
        } catch (error) {
            console.error("Failed to fetch staff", error);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this project?")) return;
        try {
            await api.delete(`/consulting-projects/${id}`);
            toast({ title: "Success", description: "Project deleted." });
            fetchProjects();
        } catch (error) {
            console.error("Failed to delete project", error);
            toast({ title: "Error", description: "Failed to delete project.", variant: "destructive" });
        }
    };

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/consulting-projects`);
            if (res.data.success || Array.isArray(res.data)) {
                setProjects(res.data.projects || res.data);
            }
        } catch (error) {
            console.error("Failed to fetch projects", error);
            toast({
                title: "Error",
                description: "Failed to fetch projects.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const newStatus = destination.droppableId;
        
        // Optimistic UI update
        const updatedProjects = [...projects];
        const projectIndex = updatedProjects.findIndex(p => p.id === draggableId);
        if (projectIndex === -1) return;
        
        const oldStatus = updatedProjects[projectIndex].status;
        updatedProjects[projectIndex].status = newStatus;
        setProjects(updatedProjects);

        try {
            await api.put(`/consulting-projects/${draggableId}/status`, { status: newStatus });
            toast({
                title: "Success",
                description: "Project status updated."
            });
        } catch (error) {
            console.error("Failed to update status", error);
            // Revert on failure
            updatedProjects[projectIndex].status = oldStatus;
            setProjects([...updatedProjects]);
            toast({
                title: "Error",
                description: "Failed to update project status.",
                variant: "destructive"
            });
        }
    };

    const openCreateForm = () => {
        setEditingProject(null);
        setIsFormOpen(true);
    };

    const openEditForm = (project) => {
        setEditingProject(project);
        setIsFormOpen(true);
    };

    const onFormSave = () => {
        setIsFormOpen(false);
        fetchProjects();
    };

    const stats = {
        total: projects.length,
        active: projects.filter(p => ['EXECUTION', 'REVIEW'].includes(p.status)).length,
        revenue: projects.reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0),
        completed: projects.filter(p => p.status === 'DELIVERY').length
    };

    const filteredProjects = projects.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (p.client?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesAssignee = assigneeFilter === 'ALL' || p.assigneeId === assigneeFilter;
        const matchesType = typeFilter === 'ALL' || p.type === typeFilter;
        return matchesSearch && matchesAssignee && matchesType;
    });

    const getProjectsByStatus = (status: string) => {
        return filteredProjects.filter(p => p.status === status);
    };

    return (
        <div className="p-6 space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Consulting Management Hub
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage all consulting projects from onboarding to delivery.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Button onClick={openCreateForm} className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">
                        <Plus className="mr-2 h-4 w-4" /> New Engagement
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Engagements</CardTitle>
                        <Briefcase className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                        <Activity className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.active}</div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow border-l-4 border-l-indigo-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Pipeline Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{stats.revenue.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow border-l-4 border-l-purple-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <Users className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.completed}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Kanban Board */}
            <div className="mt-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto flex-1">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search projects or clients..." 
                                className="pl-8 bg-white dark:bg-slate-900"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-[180px] bg-white dark:bg-slate-900">
                                <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Types</SelectItem>
                                <SelectItem value="BUSINESS">Business Consulting</SelectItem>
                                <SelectItem value="IT">IT Consulting</SelectItem>
                                <SelectItem value="SOFTWARE">Software</SelectItem>
                                <SelectItem value="WEB">Web</SelectItem>
                                <SelectItem value="CYBER_SECURITY">Cyber Security</SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                            <SelectTrigger className="w-[180px] bg-white dark:bg-slate-900">
                                <SelectValue placeholder="All Assignees" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Assignees</SelectItem>
                                {staff.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <Tabs value={viewMode} onValueChange={setViewMode} className="w-[200px]">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="kanban">Kanban</TabsTrigger>
                            <TabsTrigger value="list">List</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-muted-foreground">Loading pipeline...</div>
                ) : viewMode === 'kanban' ? (
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            {KANBAN_COLUMNS.map(column => (
                                <Droppable key={column.id} droppableId={column.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className={`bg-slate-100/50 dark:bg-slate-800/30 rounded-xl p-4 min-h-[500px] border ${snapshot.isDraggingOver ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20' : 'border-transparent'}`}
                                        >
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="font-semibold text-slate-700 dark:text-slate-200">{column.title}</h4>
                                                <span className="bg-white dark:bg-slate-800 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm text-slate-600 dark:text-slate-300">
                                                    {getProjectsByStatus(column.id).length}
                                                </span>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                {getProjectsByStatus(column.id).map((project, index) => (
                                                    <Draggable key={project.id} draggableId={project.id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                style={{...provided.draggableProps.style}}
                                                            >
                                                                <Card 
                                                                    className={`shadow-sm cursor-grab active:cursor-grabbing border-l-4 ${
                                                                        project.type === 'IT' ? 'border-l-blue-500' : 'border-l-green-500'
                                                                    } hover:shadow-md transition-shadow ${snapshot.isDragging ? 'shadow-lg ring-2 ring-indigo-500' : ''}`}
                                                                >
                                                                    <CardContent className="p-4">
                                                                        <div className="flex justify-between items-start mb-2">
                                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                                                project.type === 'IT' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                                                            }`}>
                                                                                {project.type}
                                                                            </span>
                                                                            <span className="text-xs font-semibold text-slate-500">
                                                                                ₹{(parseFloat(project.budget) || 0).toLocaleString()}
                                                                            </span>
                                                                        </div>
                                                                        <h5 className="font-semibold text-sm mb-1 leading-tight">{project.title}</h5>
                                                                        <p className="text-xs text-muted-foreground mb-3 truncate">{project.client?.name || 'No Client'}</p>
                                                                        
                                                                        {project.agreement && (
                                                                            <div className="mb-3">
                                                                                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 border">
                                                                                    Agreement: {project.agreement.status}
                                                                                </span>
                                                                            </div>
                                                                        )}

                                                                        <div className="flex justify-between items-center mt-3 pt-3 border-t">
                                                                            <Button variant="ghost" size="sm" className="h-7 text-xs w-full" onClick={() => openEditForm(project)}>
                                                                                View Details
                                                                            </Button>
                                                                        </div>
                                                                    </CardContent>
                                                                </Card>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        </div>
                                    )}
                                </Droppable>
                            ))}
                        </div>
                    </DragDropContext>
                ) : (
                    <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 dark:bg-slate-900/50">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Type</th>
                                        <th className="px-6 py-4 font-medium">Project Name</th>
                                        <th className="px-6 py-4 font-medium">Client</th>
                                        <th className="px-6 py-4 font-medium">Agreement</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                        <th className="px-6 py-4 font-medium">Budget</th>
                                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {filteredProjects.map((project) => (
                                        <tr key={project.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                                                    project.type === 'IT' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                                }`}>
                                                    {project.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{project.title}</td>
                                            <td className="px-6 py-4 text-slate-500">{project.client?.name || 'N/A'}</td>
                                            <td className="px-6 py-4 text-slate-500">
                                                {project.agreement ? (
                                                    <span className="px-2 py-1 bg-slate-100 text-xs rounded border border-slate-200">
                                                        {project.agreement.status}
                                                    </span>
                                                ) : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                                                    project.status === 'EXECUTION' ? 'bg-green-100 text-green-700' :
                                                    project.status === 'DELIVERY' ? 'bg-blue-100 text-blue-700' :
                                                    project.status === 'ONBOARDING' ? 'bg-purple-100 text-purple-700' :
                                                    project.status === 'PLANNING' ? 'bg-indigo-100 text-indigo-700' :
                                                    project.status === 'REVIEW' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-slate-100 text-slate-700'
                                                }`}>
                                                    {project.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-medium">₹{(parseFloat(project.budget) || 0).toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="ghost" size="sm" onClick={() => openEditForm(project)}>Edit</Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredProjects.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                                                No engagements found. Create one to get started.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </div>

            {isFormOpen && (
                <ConsultingFormModal 
                    isOpen={isFormOpen} 
                    onClose={() => setIsFormOpen(false)} 
                    project={editingProject} 
                    onSave={onFormSave} 
                />
            )}
        </div>
    );
}
