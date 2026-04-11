"use client"

import * as React from 'react'
import { useRouter } from 'next/navigation'
import api, { rbacApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, UserCheck, UserX, Loader2, Users, Download, Eye, CheckCircle, Plus, Trash2, Shield, ShieldAlert, AlertCircle, Edit2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { exportToCSV } from '@/lib/export-utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from '@/components/ui/use-toast'
import { useAuth } from '@/lib/auth-context'

interface User {
    id: string
    email: string
    name: string
    role: string
    isActive: boolean
    createdAt: string
    employerProfile?: { status: string }
    totalPaid?: number
}

interface Role {
    id: string
    name: string
    description?: string
    isSystem: boolean
    permissions: string[]
    _count?: { users: number }
}

interface Permission {
    id: string
    code: string
    name: string
    module: string
}

export default function AdminUsersPage() {
    const router = useRouter()
    const { hasPermission, isLoading: authLoading } = useAuth()
    const [users, setUsers] = React.useState<User[]>([])
    const [roles, setRoles] = React.useState<Role[]>([])
    const [permissions, setPermissions] = React.useState<Permission[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [_activeTab, setActiveTab] = React.useState<string>('all')

    // Role Modals
    const [isCreateRoleOpen, setIsCreateRoleOpen] = React.useState(false)
    const [isDeleteRoleOpen, setIsDeleteRoleOpen] = React.useState(false)
    const [isCreateFormOpen, setIsCreateFormOpen] = React.useState(false)
    const [isUserFormOpen, setIsUserFormOpen] = React.useState(false)
    const [roleToDelete, setRoleToDelete] = React.useState<Role | null>(null)
    const [selectedRoleId, setSelectedRoleId] = React.useState<string>('')
    const [selectedRoleName, setSelectedRoleName] = React.useState<string>('')
    const [isEditingRole, setIsEditingRole] = React.useState(false)
    const [roleToEditId, setRoleToEditId] = React.useState<string | null>(null)

    // User Deletion State
    const [isDeleteUserOpen, setIsDeleteUserOpen] = React.useState(false)
    const [userToDelete, setUserToDelete] = React.useState<User | null>(null)
    const [isDeleting, setIsDeleting] = React.useState(false)
    const [currentUser, setCurrentUser] = React.useState<User | null>(null)

    // Form State
    const [newRoleData, setNewRoleData] = React.useState({
        name: "",
        description: "",
        permissions: [] as string[]
    })

    const [newUserData, setNewUserData] = React.useState({
        name: "",
        email: "",
        password: "",
        phone: ""
    })

    const fetchUsers = async () => {
        if (!hasPermission('MANAGE_USERS')) {
            console.error('User does not have MANAGE_USERS permission')
            setIsLoading(false)
            return
        }

        try {
            const res = await api.get('/users')
            setUsers(res.data.users || [])
        } catch (error: any) {
            console.error('Failed to fetch users:', error)
            if (error.response?.status === 401 || error.response?.status === 403) {
                // Token expired or insufficient permissions, redirect to login
                router.push('/login')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const fetchRoles = async () => {
        try {
            const res = await rbacApi.getRoles()
            setRoles(res.data)
        } catch (error: any) {
            console.error('Failed to fetch roles:', error)
            if (error.response?.status === 401 || error.response?.status === 403) {
                router.push('/login')
            }
        }
    }

    const fetchPermissions = async () => {
        try {
            const res = await rbacApi.getPermissions()
            setPermissions(res.data)
        } catch (error: any) {
            console.error('Failed to fetch permissions:', error)
            if (error.response?.status === 401 || error.response?.status === 403) {
                router.push('/login')
            }
        }
    }

    React.useEffect(() => {
        if (!authLoading) {
            fetchUsers()
            fetchRoles()
            fetchPermissions()
        }
    }, [authLoading])

    const handleApprove = async (userId: string, status: 'APPROVED' | 'REJECTED') => {
        try {
            await api.patch(`/users/${userId}/approve`, { status, notes: "Admin Action" })
            fetchUsers()
        } catch (error) {
            console.error("Approval failed", error)
        }
    }

    const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
        try {
            await api.patch(`/users/${userId}/status`, { isActive: !currentStatus })
            fetchUsers()
        } catch (error) {
            console.error("Failed to toggle status", error)
        }
    }

    const filterUsers = (tab: string) => {
        let filtered = users;
        if (searchQuery) {
            filtered = filtered.filter(u =>
                u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.email.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        switch (tab) {
            case 'employers': return filtered.filter(u => u.role === 'EMPLOYER')
            case 'staff': return filtered.filter(u => ['ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR', 'STAFF'].includes(u.role))
            case 'students': return filtered.filter(u => u.role === 'STUDENT')
            default: return filtered
        }
    }

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'SUPER_ADMIN': return 'bg-purple-500/10 text-purple-600 border-purple-200'
            case 'ADMIN': return 'bg-purple-500/10 text-purple-600 border-purple-200'
            case 'INSTRUCTOR': return 'bg-blue-500/10 text-blue-600 border-blue-200'
            case 'EMPLOYER': return 'bg-orange-500/10 text-orange-600 border-orange-200'
            case 'STUDENT': return 'bg-green-500/10 text-green-600 border-green-200'
            default: return 'bg-gray-500/10 text-gray-600 border-gray-200'
        }
    }

    const handleSaveRole = async () => {
        try {
            if (!newRoleData.name) {
                toast({ title: "Role name is required", variant: "destructive" });
                return;
            }

            if (isEditingRole && roleToEditId) {
                await rbacApi.updateRole(roleToEditId, newRoleData);
                toast({ title: "Role updated successfully" });
            } else {
                await rbacApi.createRole(newRoleData);
                toast({ title: "Role created successfully" });
            }

            setIsCreateFormOpen(false);
            setIsCreateRoleOpen(false);
            setIsEditingRole(false);
            setRoleToEditId(null);
            fetchRoles();
            setNewRoleData({ name: "", description: "", permissions: [] });
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            toast({ 
                title: isEditingRole ? "Failed to update role" : "Failed to create role", 
                description: err.response?.data?.error || "Error", 
                variant: "destructive" 
            });
        }
    }

    const openCreateRoleModal = () => {
        setIsEditingRole(false);
        setRoleToEditId(null);
        setNewRoleData({ name: "", description: "", permissions: [] });
        setIsCreateFormOpen(true);
    }

    const openCreateUserModal = () => {
        setSelectedRoleId('');
        setSelectedRoleName('');
        setNewUserData({ name: "", email: "", password: "", phone: "" });
        setIsCreateRoleOpen(true);
    }

    const openEditRoleModal = (role: Role) => {
        setIsEditingRole(true);
        setRoleToEditId(role.id);
        setNewRoleData({
            name: role.name,
            description: role.description || "",
            permissions: [...role.permissions]
        });
        setIsCreateFormOpen(true);
    }

    const handleCreateUser = async () => {
        try {
            if (!newUserData.name || !newUserData.email || !newUserData.password) {
                toast({ title: "Required fields missing", variant: "destructive" });
                return;
            }
            await api.post('/users', {
                ...newUserData,
                roleId: selectedRoleId
            });
            toast({ title: "User created successfully" });
            setIsUserFormOpen(false);
            fetchUsers();
            setNewUserData({ name: "", email: "", password: "", phone: "" });
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            toast({ 
                title: "Failed to create user", 
                description: err.response?.data?.error || "Error checking duplicates or validation.", 
                variant: "destructive" 
            });
        }
    }

    const handleDeleteRole = async () => {
        if (!roleToDelete) return;
        try {
            await rbacApi.deleteRole(roleToDelete.id);
            toast({ title: "Role deleted successfully" });
            setIsDeleteRoleOpen(false);
            fetchRoles();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            toast({ title: "Failed to delete role", description: err.response?.data?.error || "Error", variant: "destructive" });
        }
    }

    const handleDeleteUser = async () => {
        if (!userToDelete) {
            console.error("No user selected for deletion");
            return;
        }

        try {
            setIsDeleting(true);
            // Use userToDelete.id directly to be safe
            const userId = userToDelete.id;
            const userName = userToDelete.name;
            
            const res = await api.delete(`/users/${userId}`);
            
            console.log("Response from server:", res.data);
            toast({ 
                title: "User deleted permanently", 
                description: `Account for ${userName} has been removed.` 
            });
            setIsDeleteUserOpen(false);
            setUserToDelete(null);
            fetchUsers();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            console.error("Deletion error FULL:", error);
            console.error("Response data:", err.response?.data);
            toast({
                title: "Failed to delete user",
                description: err.response?.data?.error || "This user might have active relations (Jobs, Projects) that prevent deletion.",
                variant: "destructive"
            });
        } finally {
            setIsDeleting(false);
        }
    }

    const startWithTemplate = (role: Role) => {
        setSelectedRoleId(role.id);
        setSelectedRoleName(role.name);
        setIsCreateRoleOpen(false);
        setIsUserFormOpen(true);
    }

    const togglePermission = (code: string) => {
        setNewRoleData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(code)
                ? prev.permissions.filter(p => p !== code)
                : [...prev.permissions, code]
        }));
    }

    const renderTable = (data: User[]) => (
        <div className="rounded-2xl border border-white/10 glass-card overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-white/5 text-left border-b border-white/10">
                            <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">User Profile</th>
                            <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Access Level</th>
                            <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Verified Status</th>
                            <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Financials</th>
                            <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider text-[10px] text-right">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {data.map((user) => (
                            <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-primary shadow-inner">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-foreground">{user.name}</div>
                                            <div className="text-muted-foreground text-xs">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <Badge variant="outline" className={`${getRoleBadgeColor(user.role)} font-bold text-[10px] px-2 py-0.5`}>
                                        {user.role}
                                    </Badge>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        {user.isActive ? (
                                            <Badge variant="secondary" className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-transparent text-[10px] font-bold">
                                                ACTIVE
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-transparent text-[10px] font-bold">
                                                INACTIVE
                                            </Badge>
                                        )}
                                        {user.role === 'EMPLOYER' && (
                                            <Badge variant="outline" className={`text-[10px] font-bold ${user.employerProfile?.status === 'APPROVED' ? 'bg-blue-500/10 text-blue-600 border-blue-200' : 'bg-yellow-500/10 text-yellow-600 border-yellow-200'
                                                }`}>
                                                {user.employerProfile?.status || 'PENDING'}
                                            </Badge>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="text-xs font-semibold text-foreground">
                                        ₹{(user.totalPaid || 0).toLocaleString()}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground">Lifetime Value</div>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10" onClick={() => router.push(`/admin/users/${user.id}`)}>
                                            <Eye className="h-4 w-4" />
                                        </Button>

                                        {user.role === 'EMPLOYER' && user.employerProfile?.status !== 'APPROVED' && (
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:bg-blue-50" onClick={() => handleApprove(user.id, 'APPROVED')}>
                                                <CheckCircle className="h-4 w-4" />
                                            </Button>
                                        )}

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={`h-8 w-8 ${user.isActive ? "text-red-500 hover:bg-red-50" : "text-green-500 hover:bg-green-50"}`}
                                            onClick={() => toggleUserStatus(user.id, user.isActive)}
                                        >
                                            {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                        </Button>

                                        {currentUser?.role === 'SUPER_ADMIN' && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-600 hover:bg-red-100/50"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setUserToDelete(user);
                                                    setIsDeleteUserOpen(true);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {data.length === 0 && (
                <div className="p-20 text-center text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p className="font-medium">No users found match your criteria</p>
                </div>
            )}
        </div>
    )

    const renderRolesTable = () => (
        <div className="rounded-2xl border border-white/10 glass-card overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-white/5 text-left border-b border-white/10">
                            <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Role Name</th>
                            <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Description</th>
                            <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Permissions</th>
                            <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Users</th>
                            <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider text-[10px] text-right">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {roles.map((role) => (
                            <tr key={role.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="font-bold text-foreground">{role.name}</div>
                                        {role.isSystem && (
                                            <Badge variant="outline" className="text-[8px] px-1 py-0 bg-blue-500/5 text-blue-400 border-blue-500/20">SYSTEM</Badge>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 text-muted-foreground text-xs">{role.description || "No description"}</td>
                                <td className="p-4">
                                    <div className="flex flex-wrap gap-1">
                                        {role.permissions.slice(0, 3).map(p => (
                                            <Badge key={p} variant="secondary" className="text-[9px] px-1.5 py-0 bg-white/5 border-white/10">{p}</Badge>
                                        ))}
                                        {role.permissions.length > 3 && (
                                            <Badge variant="outline" className="text-[9px] px-1.5 py-0">+{role.permissions.length - 3} more</Badge>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 text-xs font-semibold">{role._count?.users || 0}</td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 text-blue-500 hover:bg-blue-500/10" 
                                            onClick={() => openEditRoleModal(role)}
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-500/10" onClick={() => { setRoleToDelete(role); setIsDeleteRoleOpen(true); }}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {roles.length === 0 && (
                <div className="p-20 text-center text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p className="font-medium">No roles defined</p>
                </div>
            )}
        </div>
    )

    // Check permissions before rendering
    if (!hasPermission('MANAGE_USERS')) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                    <ShieldAlert className="h-16 w-16 text-muted-foreground mb-4" />
                    <h2 className="text-2xl font-semibold text-foreground mb-2">Access Denied</h2>
                    <p className="text-muted-foreground max-w-md">
                        You don't have permission to manage users. Please contact your administrator if you believe this is an error.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">User <span className="text-primary">Governance</span></h1>
                    <p className="text-muted-foreground mt-1">Audit platform access, verify employers, and manage user lifecycles.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" className="glass hover:bg-primary/20 border-white/10 shadow-lg text-primary" onClick={openCreateUserModal}>
                        <Plus className="mr-2 h-4 w-4" /> Create User
                    </Button>
                    <Button variant="secondary" className="glass hover:bg-primary/20 border-white/10 shadow-lg text-primary" onClick={openCreateRoleModal}>
                        <Plus className="mr-2 h-4 w-4" /> Create Role
                    </Button>
                    <Button variant="outline" className="glass hover:bg-white/20 border-white/20 shadow-none" onClick={() => exportToCSV(users as unknown as Record<string, unknown>[], { filename: 'users_export', headers: ['name', 'email', 'role', 'isActive'] })}>
                        <Download className="mr-2 h-4 w-4" /> Export Audit
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card p-4 rounded-2xl border-l-4 border-l-primary">
                    <p className="text-xs uppercase font-bold text-muted-foreground tracking-widest">Total Population</p>
                    <h3 className="text-2xl font-black mt-1">{users.length}</h3>
                </div>
                <div className="glass-card p-4 rounded-2xl border-l-4 border-l-orange-500">
                    <p className="text-xs uppercase font-bold text-muted-foreground tracking-widest">Active Employers</p>
                    <h3 className="text-2xl font-black mt-1">{users.filter(u => u.role === 'EMPLOYER' && u.isActive).length}</h3>
                </div>
                <div className="glass-card p-4 rounded-2xl border-l-4 border-l-green-500">
                    <p className="text-xs uppercase font-bold text-muted-foreground tracking-widest">Verified Students</p>
                    <h3 className="text-2xl font-black mt-1">{users.filter(u => u.role === 'STUDENT' && u.isActive).length}</h3>
                </div>
                <div className="glass-card p-4 rounded-2xl border-l-4 border-l-blue-500">
                    <p className="text-xs uppercase font-bold text-muted-foreground tracking-widest">Instructors</p>
                    <h3 className="text-2xl font-black mt-1">{users.filter(u => u.role === 'INSTRUCTOR').length}</h3>
                </div>
            </div>

            <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
                <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4">
                    <TabsList className="bg-white/5 border border-white/10 p-1 h-12 rounded-xl">
                        <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white h-full px-6 text-xs font-bold uppercase tracking-wider">All Access</TabsTrigger>
                        <TabsTrigger value="roles" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white h-full px-6 text-xs font-bold uppercase tracking-wider">Roles & Permissions</TabsTrigger>
                        <TabsTrigger value="employers" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white h-full px-6 text-xs font-bold uppercase tracking-wider">Employers</TabsTrigger>
                        <TabsTrigger value="staff" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white h-full px-6 text-xs font-bold uppercase tracking-wider">Governance Staff</TabsTrigger>
                        <TabsTrigger value="students" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white h-full px-6 text-xs font-bold uppercase tracking-wider">Learning Bench</TabsTrigger>
                    </TabsList>

                    <div className="relative w-full md:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Filter by name or email..."
                            className="pl-10 h-11 border-white/10 glass-input rounded-xl focus:ring-primary/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm font-medium animate-pulse">Syncing User Directory...</p>
                    </div>
                ) : (
                    <div className="animate-in slide-in-from-bottom-4 duration-500">
                        <TabsContent value="all" className="m-0">{renderTable(filterUsers('all'))}</TabsContent>
                        <TabsContent value="roles" className="m-0">{renderRolesTable()}</TabsContent>
                        <TabsContent value="employers" className="m-0">{renderTable(filterUsers('employers'))}</TabsContent>
                        <TabsContent value="staff" className="m-0">{renderTable(filterUsers('staff'))}</TabsContent>
                        <TabsContent value="students" className="m-0">{renderTable(filterUsers('students'))}</TabsContent>
                    </div>
                )}
            </Tabs>

            {/* Template Selection Dialog */}
            <Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
                <DialogContent className="max-w-2xl bg-[#0a0a0b] border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase text-primary">Select System Role</DialogTitle>
                        <DialogDescription className="text-muted-foreground/80">Choose the access level for the new user account.</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                        {roles.map(role => (
                            <div
                                key={role.id}
                                className="glass-card hover:bg-white/10 border border-white/5 rounded-2xl p-5 cursor-pointer transition-all duration-300 flex items-start gap-4 group hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(37,99,235,0.1)]"
                                onClick={() => startWithTemplate(role)}
                            >
                                <div className="mt-1 p-3 rounded-xl bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-white group-hover:rotate-6">
                                    <Shield className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-extrabold text-foreground flex items-center gap-2 text-lg">
                                        {role.name}
                                        {role.isSystem && <Badge className="text-[8px] h-4 px-1.5 uppercase bg-primary/20 text-primary border-none">System</Badge>}
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">{role.description || `Full access as ${role.name}`}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Create User Form Dialog */}
            <Dialog open={isUserFormOpen} onOpenChange={setIsUserFormOpen}>
                <DialogContent className="max-w-2xl bg-[#0a0a0b] border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase text-primary">User Details ({selectedRoleName})</DialogTitle>
                        <DialogDescription className="text-muted-foreground/80">Enter the credentials for the new {selectedRoleName} account.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                                <Input
                                    placeholder="John Doe"
                                    className="glass-input h-11 border-white/10 rounded-xl"
                                    value={newUserData.name}
                                    onChange={e => setNewUserData(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                                <Input
                                    type="email"
                                    placeholder="john@example.com"
                                    className="glass-input h-11 border-white/10 rounded-xl"
                                    value={newUserData.email}
                                    onChange={e => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Initial Password</Label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    className="glass-input h-11 border-white/10 rounded-xl"
                                    value={newUserData.password}
                                    onChange={e => setNewUserData(prev => ({ ...prev, password: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone (Optional)</Label>
                                <Input
                                    placeholder="+91 99999 99999"
                                    className="glass-input h-11 border-white/10 rounded-xl"
                                    value={newUserData.phone}
                                    onChange={e => setNewUserData(prev => ({ ...prev, phone: e.target.value }))}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="border-white/10 glass rounded-xl" onClick={() => setIsUserFormOpen(false)}>Cancel</Button>
                        <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)]" onClick={handleCreateUser}>Create Account</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Role Form Dialog */}
            <Dialog open={isCreateFormOpen} onOpenChange={setIsCreateFormOpen}>
                <DialogContent className="max-w-3xl bg-[#0a0a0b] border-white/10 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">{isEditingRole ? 'Modify Role & Permissions' : 'Configure New Role'}</DialogTitle>
                        <DialogDescription>{isEditingRole ? `Updating existing configuration for ${newRoleData.name}` : 'Define permissions and role metadata for a new system role.'}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Internal Name</Label>
                                    <Input
                                        placeholder="e.g. Marketing Manager"
                                        className="glass-input h-11 border-white/10 rounded-xl"
                                        value={newRoleData.name}
                                        onChange={e => setNewRoleData(prev => ({ ...prev, name: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</Label>
                                    <Input
                                        placeholder="Brief purpose of this role"
                                        className="glass-input h-11 border-white/10 rounded-xl"
                                        value={newRoleData.description}
                                        onChange={e => setNewRoleData(prev => ({ ...prev, description: e.target.value }))}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Permissions</Label>
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px]">{newRoleData.permissions.length} Selected</Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6 h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {permissions.map(perm => (
                                    <div key={perm.id} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 group">
                                        <Checkbox
                                            id={perm.id}
                                            checked={newRoleData.permissions.includes(perm.code)}
                                            onCheckedChange={() => togglePermission(perm.code)}
                                            className="mt-1 border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                        />
                                        <div className="space-y-0.5 pointer-events-none">
                                            <Label htmlFor={perm.id} className="text-sm font-bold block cursor-pointer">{perm.name}</Label>
                                            <div className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                                <Badge variant="outline" className="text-[8px] h-3 px-1 border-white/10">{perm.module}</Badge>
                                                <span>•</span>
                                                <code>{perm.code}</code>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="border-white/10 glass rounded-xl" onClick={() => setIsCreateFormOpen(false)}>Cancel</Button>
                        <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)]" onClick={handleSaveRole}>
                            {isEditingRole ? 'Save Changes' : 'Confirm Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteRoleOpen} onOpenChange={setIsDeleteRoleOpen}>
                <DialogContent className="bg-[#0a0a0b] border-white/10">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-500">
                            <ShieldAlert className="h-6 w-6" />
                            Permanent Deletion
                        </DialogTitle>
                        <DialogDescription className="text-foreground/80">
                            This action will permanently delete the role <span className="font-bold text-white">&quot;{roleToDelete?.name}&quot;</span> from the system.
                            {roleToDelete?.isSystem && (
                                <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs flex gap-3">
                                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                    WARNING: This is a system role. Deleting it may impact system functionality for users assigned to it.
                                </div>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10" onClick={() => setIsDeleteRoleOpen(false)}>Cancel</Button>
                        <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={handleDeleteRole}>Delete Permanently</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* User Delete Confirmation Dialog */}
            <Dialog open={isDeleteUserOpen} onOpenChange={(open) => {
                setIsDeleteUserOpen(open);
                if (!open && !isDeleting) setUserToDelete(null);
            }}>
                <DialogContent className="bg-[#0a0a0b] border-white/10">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-500">
                            <ShieldAlert className="h-6 w-6" />
                            Permanent User Deletion
                        </DialogTitle>
                        {userToDelete ? (
                            <DialogDescription className="text-foreground/80">
                                You are about to permanently delete <span className="font-bold text-white">&quot;{ userToDelete.name }&quot;</span> ({userToDelete.email}).
                            </DialogDescription>
                        ) : (
                            <div className="py-6 flex justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        )}
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            className="bg-white/5 border-white/10 hover:bg-white/10"
                            onClick={() => setIsDeleteUserOpen(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700 text-white font-bold"
                            onClick={handleDeleteUser}
                            disabled={isDeleting || !userToDelete}
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Confirm Permanent Delete"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

