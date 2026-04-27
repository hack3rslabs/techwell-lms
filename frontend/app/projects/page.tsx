"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ProjectCard } from "@/components/projects/ProjectCard";

interface Project {
    id: string;
    title: string;
    description: string;
    price: string;
    originalPrice?: string;
    image: string;
    category: string;
    techStack: string | string[];
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");

    useEffect(() => {
        // Fetch projects from backend
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        fetch(`${API_URL}/projects`)
            .then((res) => res.json())
            .then((data) => {
                setProjects(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch projects:", err);
                setLoading(false);
            });
    }, []);

    const filteredProjects = projects.filter((project) => {
        const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (Array.isArray(project.techStack) && project.techStack.some((t: string) => t.toLowerCase().includes(searchTerm.toLowerCase())));
        const matchesCategory = categoryFilter === "all" || project.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="container px-4 mx-auto relative z-10">
                    <div className="max-w-3xl mx-auto text-center mb-12">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-bold mb-6 tracking-tight"
                        >
                            Final Year <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Projects</span> Marketplace
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-muted-foreground"
                        >
                            Discover high-quality, ready-to-submit projects with complete source code, documentation, and support.
                        </motion.p>
                    </div>

                    {/* Search and Filter */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto mb-16 bg-card/50 backdrop-blur-md p-4 rounded-2xl border border-border/50"
                    >
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Search projects by title, tech stack..."
                                className="pl-10 bg-background/50 border-border/50"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="w-full md:w-48">
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="bg-background/50 border-border/50">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    <SelectItem value="AI & ML">AI & ML</SelectItem>
                                    <SelectItem value="Web">Web Development</SelectItem>
                                    <SelectItem value="Blockchain">Blockchain</SelectItem>
                                    <SelectItem value="IoT">IoT</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button className="md:w-auto w-full gap-2">
                            <Filter className="w-4 h-4" />
                            Apply Filters
                        </Button>
                    </motion.div>
                </div>
            </section>

            {/* Projects Grid */}
            <section className="container px-4 mx-auto pb-24">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProjects.map((project: any, index: number) => (
                            <ProjectCard
                                key={project.id}
                                {...project}
                                index={index}
                            />
                        ))}
                        {filteredProjects.length === 0 && (
                            <div className="col-span-full text-center py-10 text-muted-foreground">
                                No projects found matching your criteria.
                            </div>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}
