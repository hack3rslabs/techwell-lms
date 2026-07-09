"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Briefcase, Activity, Calendar, Clock, Server, FileText } from 'lucide-react';
import axios from 'axios';
import { useToast } from "@/components/ui/use-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ClientConsultingDashboard() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await axios.get(`${API_URL}/consulting-projects`, { withCredentials: true });
            if (res.data.success) {
                setProjects(res.data.projects);
            }
        } catch (error) {
            console.error("Failed to fetch projects", error);
            toast({
                title: "Error",
                description: "Failed to load your consulting engagements.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-12 text-center text-muted-foreground animate-pulse">Loading your engagements...</div>;
    }

    if (projects.length === 0) {
        return (
            <div className="p-8">
                <h1 className="text-3xl font-bold tracking-tight mb-6">My Consulting Engagements</h1>
                <Card className="bg-slate-50 dark:bg-slate-900 border-dashed border-2">
                    <CardContent className="p-12 text-center text-muted-foreground">
                        <Briefcase className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                        <h3 className="text-xl font-medium text-slate-900 dark:text-slate-100 mb-2">No Active Engagements</h3>
                        <p>You currently do not have any active consulting projects assigned to your account.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    My Consulting Engagements
                </h1>
                <p className="text-muted-foreground mt-2">
                    Track the progress of your IT and Business consulting projects.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {projects.map((project) => (
                    <Card key={project.id} className={`overflow-hidden border-t-4 shadow-sm hover:shadow-md transition-shadow ${
                        project.type === 'IT' ? 'border-t-blue-500' : 'border-t-green-500'
                    }`}>
                        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                            project.type === 'IT' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                        }`}>
                                            {project.type} CONSULTING
                                        </span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                            project.status === 'ACTIVE' ? 'bg-indigo-100 text-indigo-700' :
                                            project.status === 'COMPLETED' ? 'bg-slate-200 text-slate-700' :
                                            'bg-purple-100 text-purple-700'
                                        }`}>
                                            {project.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <CardTitle className="text-xl mt-2">{project.title}</CardTitle>
                                </div>
                                {project.type === 'IT' ? <Server className="text-blue-400 opacity-50" /> : <Activity className="text-green-400 opacity-50" />}
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 line-clamp-3">
                                {project.description || "No specific description provided for this engagement."}
                            </p>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Calendar className="h-4 w-4" />
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-slate-400">Start Date</p>
                                        <p className="font-medium text-slate-700 dark:text-slate-200">
                                            {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'TBD'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Clock className="h-4 w-4" />
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-slate-400">Target End</p>
                                        <p className="font-medium text-slate-700 dark:text-slate-200">
                                            {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'TBD'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Milestones Preview */}
                            {project.milestones && project.milestones.length > 0 && (
                                <div className="mt-6 pt-6 border-t">
                                    <h4 className="text-xs font-bold uppercase text-slate-400 mb-3 flex items-center gap-2">
                                        <FileText className="h-3 w-3" /> Recent Milestones
                                    </h4>
                                    <div className="space-y-3">
                                        {project.milestones.slice(0, 3).map(m => (
                                            <div key={m.id} className="flex justify-between items-center text-sm bg-slate-50 dark:bg-slate-800/50 p-2 rounded">
                                                <span className="font-medium">{m.title}</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                                    m.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {m.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
