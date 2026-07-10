'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Loader2, Search, Briefcase, Plus, ExternalLink } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'
import { format } from 'date-fns'

export default function FranchiseProjectsPage() {
    const [projects, setProjects] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setIsLoading(true)
                const res = await api.get('/projects/consulting') // or whatever endpoint is appropriate for student projects
                setProjects(res.data || [])
            } catch (error) {
                console.error('Failed to load projects', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchProjects()
    }, [])

    const filteredProjects = projects.filter(p => 
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.clientName?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-primary">Project Management</h2>
                    <p className="text-muted-foreground mt-1">Manage and assign projects to your students.</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Create Project
                </Button>
            </div>

            <Card className="border shadow-sm">
                <CardHeader className="bg-muted/30 pb-4">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder="Search projects..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : filteredProjects.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                            <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50 text-primary" />
                            <p className="text-lg font-medium text-foreground">No projects found</p>
                            <p>You haven't assigned any projects yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead>Project Title</TableHead>
                                        <TableHead>Client/Domain</TableHead>
                                        <TableHead>Deadline</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredProjects.map((project) => (
                                        <TableRow key={project.id} className="hover:bg-muted/20">
                                            <TableCell>
                                                <div className="font-semibold text-foreground">{project.title}</div>
                                                <div className="text-xs text-muted-foreground truncate max-w-[200px]">{project.description}</div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium text-sm">{project.clientName || project.domain || '-'}</span>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {project.deadline ? format(new Date(project.deadline), 'MMM dd, yyyy') : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={
                                                    project.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                                                    project.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                                                }>
                                                    {project.status || 'PENDING'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" title="View Project">
                                                    <ExternalLink className="h-4 w-4 text-primary" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
