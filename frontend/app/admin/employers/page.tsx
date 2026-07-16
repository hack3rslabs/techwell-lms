"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Check, X, Building2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Employer {
    id: string
    name: string
    email: string
    phone: string
    employerProfile: {
        companyName: string
        status: string
        location: string
    }
    _count: {
        EmployerCampusDrives: number
    }
    createdAt: string
}

export default function AdminEmployersPage() {
    const [employers, setEmployers] = useState<Employer[]>([])
    const [isLoading, setIsLoading] = useState(true)

    async function fetchEmployers() {
        try {
            const res = await api.get('/admin/employers')
            setEmployers(res.data.employers)
        } catch {
            // Error handling
        } finally {
            setIsLoading(false)
        }
    }


    useEffect(() => {
        fetchEmployers()
    }, [])


    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Employer CRM</h1>
                    <p className="text-muted-foreground">Manage corporate partners and hiring companies.</p>
                </div>
            </div>

            {employers.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">
                    <Building2 className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No employers registered yet.</p>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {employers.map((emp) => (
                        <Card key={emp.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <Avatar className="h-10 w-10 border">
                                        <AvatarFallback><Building2 className="h-5 w-5" /></AvatarFallback>
                                    </Avatar>
                                    <Badge variant={emp.employerProfile?.status === 'APPROVED' ? 'default' : 'secondary'}>
                                        {emp.employerProfile?.status || 'PENDING'}
                                    </Badge>
                                </div>
                                <CardTitle className="mt-4">{emp.employerProfile?.companyName || 'Unknown Company'}</CardTitle>
                                <CardDescription>Joined {new Date(emp.createdAt).toLocaleDateString()}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-sm space-y-1">
                                    <p><span className="font-medium">Representative:</span> {emp.name}</p>
                                    <p><span className="font-medium">Email:</span> {emp.email}</p>
                                    <p><span className="font-medium">Phone:</span> {emp.phone || 'N/A'}</p>
                                    <p><span className="font-medium">Location:</span> {emp.employerProfile?.location || 'Remote'}</p>
                                </div>
                                <div className="pt-4 border-t flex justify-between items-center text-sm">
                                    <div className="text-muted-foreground">
                                        <span className="font-bold text-foreground">{emp._count?.EmployerCampusDrives || 0}</span> Drives Hosted
                                    </div>
                                    <Button variant="outline" size="sm">View Details</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
