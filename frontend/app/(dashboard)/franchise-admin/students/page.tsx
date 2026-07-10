'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Loader2, UserPlus, Mail, Phone, Calendar } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { format } from 'date-fns'

export default function FranchiseStudentsPage() {
    const [students, setStudents] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    
    // Add Student Modal
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [newStudent, setNewStudent] = useState({
        name: '',
        email: '',
        phone: '',
        password: ''
    })

    const fetchStudents = async () => {
        try {
            setIsLoading(true)
            const res = await api.get(`/users?role=STUDENT${searchQuery ? `&search=${searchQuery}` : ''}`)
            setStudents(res.data.users || res.data || [])
        } catch (error) {
            console.error('Failed to fetch students', error)
            toast.error('Failed to load students')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchStudents()
        }, 300)
        return () => clearTimeout(debounce)
    }, [searchQuery])

    const handleAddStudent = async () => {
        if (!newStudent.name || !newStudent.email || !newStudent.password) {
            toast.error('Name, Email, and Password are required')
            return
        }
        try {
            setIsSaving(true)
            await api.post('/users', {
                ...newStudent,
                role: 'STUDENT'
            })
            toast.success('Student added successfully')
            setIsAddModalOpen(false)
            fetchStudents()
            setNewStudent({ name: '', email: '', phone: '', password: '' })
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to add student')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-primary">Student Management</h2>
                    <p className="text-muted-foreground mt-1">Manage and onboard students for your institute.</p>
                </div>
                
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="shadow-sm">
                            <UserPlus className="mr-2 h-4 w-4" /> Onboard Student
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Onboard New Student</DialogTitle>
                            <DialogDescription>Create an account for a new student in your franchise.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Full Name *</label>
                                <Input value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} placeholder="John Doe" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email Address *</label>
                                <Input type="email" value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})} placeholder="john@example.com" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Phone Number</label>
                                <Input value={newStudent.phone} onChange={e => setNewStudent({...newStudent, phone: e.target.value})} placeholder="9876543210" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Temporary Password *</label>
                                <Input type="password" value={newStudent.password} onChange={e => setNewStudent({...newStudent, password: e.target.value})} placeholder="Password123" />
                                <p className="text-xs text-muted-foreground">The student can change this later.</p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleAddStudent} disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Create Student
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border shadow-sm">
                <CardHeader className="bg-muted/30 pb-4">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder="Search students by name or email..."
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
                    ) : students.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                            <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50 text-primary" />
                            <p className="text-lg font-medium text-foreground">No students found</p>
                            <p>Onboard your first student to get started.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead>Student</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Joined Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.map((student) => (
                                        <TableRow key={student.id} className="hover:bg-muted/20">
                                            <TableCell>
                                                <div className="font-semibold text-foreground">{student.name}</div>
                                                <div className="text-xs text-muted-foreground opacity-70">ID: {student.id.substring(0,8)}...</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                                                    <span className="flex items-center"><Mail className="w-3 h-3 mr-2 opacity-70"/>{student.email}</span>
                                                    {student.phone && <span className="flex items-center"><Phone className="w-3 h-3 mr-2 opacity-70"/>{student.phone}</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={student.isActive ? 'default' : 'secondary'} className={student.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}>
                                                    {student.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                <div className="flex items-center">
                                                    <Calendar className="w-3 h-3 mr-2 opacity-70" />
                                                    {format(new Date(student.createdAt), 'dd MMM yyyy')}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm">View Profile</Button>
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
