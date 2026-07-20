"use client"

import * as React from 'react'
import { useRouter } from 'next/navigation'
import api, { rbacApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, UserCheck, UserX, Loader2, Eye, Plus, Trash2, Shield, ShieldAlert, Edit2, Download } from 'lucide-react'
import ExcelJS from 'exceljs'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { exportToCSV } from '@/lib/export-utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from '@/components/ui/use-toast'
import { useAuth } from '@/lib/auth-context'
import { CreateUserModal } from '@/components/admin/users/CreateUserModal'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface User {
    id: string
    email: string
    name: string
    role: string
    isActive: boolean
    createdAt: string
    regId?: string
    phone?: string
    employerProfile?: { status: string }
    systemRole?: { name: string }
    totalPaid?: number
}

interface Role {
    id: string
    name: string
    description?: string
    isSystem: boolean
    rolePermissions: Array<{
        featureId: string
        canRead: boolean
        canCreate: boolean
        canUpdate: boolean
        canDelete: boolean
        isDisabled: boolean
    }>
    _count?: { users: number }
}

interface Permission {
    id: string
    code: string
    name: string
    module: string
}

const isSuperAdminRole = (roleName?: string) => {
    return (roleName || "").replace(/[^a-z0-9]/gi, "").toUpperCase() === "SUPERADMIN"
}

export default function AdminUsersPage() {
    const router = useRouter()
    const { user: currentUser, hasPermission, isLoading: authLoading } = useAuth()
    const [users, setUsers] = React.useState<User[]>([])
    const [roles, setRoles] = React.useState<Role[]>([])
    const [permissions, setPermissions] = React.useState<Permission[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [selectedRole, setSelectedRole] = React.useState<string>("all")
    const [activeTab, setActiveTab] = React.useState<string>('users')

    // Modals State
    const [isCreateRoleOpen, setIsCreateRoleOpen] = React.useState(false)
    const [isDeleteRoleOpen, setIsDeleteRoleOpen] = React.useState(false)
    const [isCreateFormOpen, setIsCreateFormOpen] = React.useState(false)
    const [isUserModalOpen, setIsUserModalOpen] = React.useState(false)
    const [roleToDelete, setRoleToDelete] = React.useState<Role | null>(null)
    const [isEditingRole, setIsEditingRole] = React.useState(false)
    const [roleToEditId, setRoleToEditId] = React.useState<string | null>(null)
    const [isDeleteUserOpen, setIsDeleteUserOpen] = React.useState(false)
    const [userToDelete, setUserToDelete] = React.useState<User | null>(null)
    const [isEditUserOpen, setIsEditUserOpen] = React.useState(false)
    const [userToEdit, setUserToEdit] = React.useState<User | null>(null)
    const [editUserData, setEditUserData] = React.useState({ name: '', phone: '', isActive: true, role: '' })

    // Form State for Role
    const [newRoleData, setNewRoleData] = React.useState({
        name: "",
        description: "",
        permissions: [] as any[]
    })

    const fetchUsers = async () => {
        if (!hasPermission('USERS')) {
            setIsLoading(false)
            return
        }
        try {
            const res = await api.get('/users?excludeRole=STUDENT&limit=500')
            setUsers(res.data.users || [])
        } catch (error) {
            console.error('Failed to fetch users:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchRoles = async () => {
        try {
            const res = await rbacApi.getRoles()
            setRoles(res.data)
        } catch (error) {
            console.error('Failed to fetch roles:', error)
        }
    }

    const fetchPermissions = async () => {
        try {
            const res = await rbacApi.getFeatures()
            setPermissions(res.data)
        } catch (error) {
            console.error('Failed to fetch features:', error)
        }
    }

    React.useEffect(() => {
        if (!authLoading) {
            fetchUsers()
            fetchRoles()
            fetchPermissions()
        }
    }, [authLoading])

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        try {
            await api.delete(`/users/${userToDelete.id}`);
            toast({ title: "User deleted successfully" });
            setIsDeleteUserOpen(false);
            fetchUsers();
        } catch (error: any) {
            toast({ title: "Failed to delete user", description: error.response?.data?.error, variant: "destructive" });
        }
    }

    const handleDeleteRole = async () => {
        if (!roleToDelete) return;
        try {
            await rbacApi.deleteRole(roleToDelete.id);
            toast({ title: "Role deleted successfully" });
            setIsDeleteRoleOpen(false);
            fetchRoles();
        } catch (error: any) {
            toast({ title: "Failed to delete role", description: error.response?.data?.error, variant: "destructive" });
        }
    }

    const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
        try {
            await api.patch(`/users/${userId}/status`, { isActive: !currentStatus })
            fetchUsers()
            toast({ title: "User status updated" })
        } catch (error) {
            console.error("Failed to toggle status", error)
        }
    }

    const openEditUserModal = (user: User) => {
        setUserToEdit(user)
        setEditUserData({ name: user.name, phone: user.phone || '', isActive: user.isActive, role: user.role })
        setIsEditUserOpen(true)
    }

    const handleUpdateUser = async () => {
        if (!userToEdit) return
        try {
            await api.patch(`/users/${userToEdit.id}`, editUserData)
            toast({ title: "User updated successfully" })
            setIsEditUserOpen(false)
            fetchUsers()
        } catch (error: any) {
            toast({ title: "Failed to update user", description: error.response?.data?.error, variant: "destructive" })
        }
    }

    const handleExportExcel = () => {
        try {
            const dataToExport = filterUsers('all').map(u => ({
                ID: u.id,
                Name: u.name,
                Email: u.email,
                Role: u.systemRole?.name || u.role,
                Status: u.isActive ? 'ACTIVE' : 'LOCKED',
                'Joined At': new Date(u.createdAt).toLocaleDateString()
            }))
            
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Users");
        
        if (dataToExport && dataToExport.length > 0) {
            worksheet.columns = Object.keys(dataToExport[0]).map(key => ({ header: key, key }));
            worksheet.addRows(dataToExport);
        }
        
        workbook.xlsx.writeBuffer().then((buffer) => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Users_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
            toast({ title: "Exported successfully" })
        } catch (error) {
            toast({ title: "Failed to export", variant: "destructive" })
        }
    }

    const filterUsers = (type: string) => {
        let filtered = users;
        if (searchQuery) {
            filtered = filtered.filter(u =>
                u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.email.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }
        if (selectedRole !== "all") {
            filtered = filtered.filter(u => {
                const userRoleName = (u.systemRole?.name || u.role).toUpperCase().replace(/\s+/g, '_');
                const selectedRoleName = selectedRole.toUpperCase().replace(/\s+/g, '_');
                return userRoleName === selectedRoleName;
            })
        }
        return filtered
    }

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'SUPER_ADMIN': return 'bg-purple-500/10 text-purple-600 border-purple-200'
            case 'ADMIN': return 'bg-blue-500/10 text-blue-600 border-blue-200'
            case 'EMPLOYER': return 'bg-orange-500/10 text-orange-600 border-orange-200'
            case 'STUDENT': return 'bg-green-500/10 text-green-600 border-green-200'
            default: return 'bg-gray-500/10 text-gray-600 border-gray-200'
        }
    }

    const handleSaveRole = async () => {
        try {
            if (!newRoleData.name) return toast({ title: "Role name is required", variant: "destructive" });
            if (isEditingRole && roleToEditId) {
                await rbacApi.updateRole(roleToEditId, newRoleData);
                toast({ title: "Role updated" });
            } else {
                await rbacApi.createRole(newRoleData);
                toast({ title: "Role created" });
            }
            setIsCreateFormOpen(false);
            fetchRoles();
        } catch (error: any) {
            toast({ title: "Operation failed", description: error.response?.data?.error, variant: "destructive" });
        }
    }

    const openCreateRoleModal = () => {
        setIsEditingRole(false);
        setRoleToEditId(null);
        setNewRoleData({ name: "", description: "", permissions: [] });
        setIsCreateFormOpen(true);
    }

    const openEditRoleModal = (role: Role) => {
        if (isSuperAdminRole(role.name)) return;

        setIsEditingRole(true);
        setRoleToEditId(role.id);
        setNewRoleData({
            name: role.name,
            description: role.description || "",
            permissions: role.rolePermissions.map(rp => ({
                featureId: rp.featureId,
                canRead: rp.canRead,
                canCreate: rp.canCreate,
                canUpdate: rp.canUpdate,
                canDelete: rp.canDelete,
                isDisabled: rp.isDisabled
            }))
        });
        setIsCreateFormOpen(true);
    }

    const handlePermissionLevelChange = (featureId: string, level: 'canRead' | 'canCreate' | 'canUpdate' | 'canDelete' | 'isDisabled', value: boolean) => {
        setNewRoleData(prev => {
            const existing = prev.permissions.find(p => p.featureId === featureId);
            let updatedPermissions = [...prev.permissions];
            if (existing) {
                const updated = { ...existing, [level]: value };
                if (level === 'isDisabled' && value) { updated.canRead = false; updated.canCreate = false; updated.canUpdate = false; updated.canDelete = false; }
                if (['canCreate', 'canUpdate', 'canDelete'].includes(level) && value) { updated.canRead = true; updated.isDisabled = false; }
                if (level === 'canRead' && value) { updated.isDisabled = false; }
                updatedPermissions = updatedPermissions.map(p => p.featureId === featureId ? updated : p);
            } else {
                const initial = { featureId, canRead: false, canCreate: false, canUpdate: false, canDelete: false, isDisabled: false, [level]: value };
                if (['canCreate', 'canUpdate', 'canDelete'].includes(level) && value) initial.canRead = true;
                updatedPermissions.push(initial);
            }
            return { ...prev, permissions: updatedPermissions };
        });
    }

    const renderTable = (data: User[]) => (
        <div className="rounded-3xl border border-slate-200/60 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-500 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-700/80">
                        <tr>
                            <th className="p-5 font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase text-[11px]">User Profile</th>
                            <th className="p-5 font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase text-[11px]">Access Level</th>
                            <th className="p-5 font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase text-[11px]">Status</th>
                            <th className="p-5 font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase text-[11px] text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {data.length === 0 ? (
                            <tr><td colSpan={4} className="p-20 text-center opacity-50"><p className="text-sm font-bold">No users found</p></td></tr>
                        ) : (
                            data.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors duration-300 group">
                                    <td className="p-5">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 border border-indigo-200/50 dark:border-indigo-700/50 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300 shadow-sm transition-transform group-hover:scale-105">{user.name[0]}</div>
                                            <div>
                                                <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center">{user.name} {user.regId && <Badge variant="outline" className="ml-2 text-[9px] px-1.5 h-5 border-slate-200 dark:border-slate-700 text-slate-500 bg-white/50 dark:bg-slate-900/50">{user.regId}</Badge>}</div>
                                                <div className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <Badge variant="outline" className={`${getRoleBadgeColor(user.role)} text-[10px] uppercase tracking-wider font-bold shadow-sm`}>
                                            {user.systemRole?.name || user.role}
                                        </Badge>
                                    </td>
                                    <td className="p-5">
                                        {user.isActive ? <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/50 text-[10px] shadow-sm uppercase tracking-wider">ACTIVE</Badge> : <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-800/50 text-[10px] shadow-sm uppercase tracking-wider">LOCKED</Badge>}
                                    </td>
                                    <td className="p-5 text-right">
                                        <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30 rounded-full transition-colors" onClick={() => openEditUserModal(user)}><Edit2 className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-full transition-colors" onClick={() => router.push(`/admin/users/${user.id}`)}><Eye className="h-4 w-4" /></Button>
                                            {!isSuperAdminRole(user.systemRole?.name || user.role) && (
                                                <Button variant="ghost" size="icon" className={`h-8 w-8 rounded-full transition-colors ${user.isActive ? 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30' : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'}`} onClick={() => toggleUserStatus(user.id, user.isActive)}>
                                                    {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                                </Button>
                                            )}
                                            {currentUser?.role === 'SUPER_ADMIN' && user.id !== currentUser.id && !isSuperAdminRole(user.systemRole?.name || user.role) && (
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-500/10" onClick={() => { setUserToDelete(user); setIsDeleteUserOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )

    const renderRolesTable = () => (
        <div className="rounded-3xl border border-slate-200/60 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-500 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-700/80">
                        <tr>
                            <th className="p-5 font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase text-[11px]">Role Name</th>
                            <th className="p-5 font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase text-[11px]">Description</th>
                            <th className="p-5 font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase text-[11px] text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {roles.map(role => (
                            <tr key={role.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors duration-300 group">
                                <td className="p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="font-bold text-slate-900 dark:text-slate-100">{role.name}</div>
                                        {role.isSystem && <Badge className="text-[9px] h-5 px-2 uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/50 shadow-sm tracking-wider">System</Badge>}
                                    </div>
                                </td>
                                <td className="p-5 text-xs text-slate-500 dark:text-slate-400">{role.description || "Custom role"}</td>
                                <td className="p-5 text-right">
                                    <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                        {!isSuperAdminRole(role.name) && (
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30 rounded-full transition-colors" onClick={() => openEditRoleModal(role)}><Edit2 className="h-4 w-4" /></Button>
                                        )}
                                        {!role.isSystem && (
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/30 rounded-full transition-colors" onClick={() => { setRoleToDelete(role); setIsDeleteRoleOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )

    if (authLoading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    if (!hasPermission('USERS')) return <div className="flex flex-col items-center justify-center min-h-[400px] text-center"><ShieldAlert className="h-16 w-16 text-muted-foreground mb-4" /><h2 className="text-2xl font-bold">Access Denied</h2></div>

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Users & Roles</h1>
                    <p className="text-muted-foreground text-sm">Manage platform accounts and access hierarchies.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className=" border-border rounded-xl h-11 px-6" onClick={handleExportExcel}><Download className="mr-2 h-4 w-4" /> Export</Button>
                    <Button className="bg-primary hover:bg-primary/90  shadow-lg rounded-xl h-11 px-6" onClick={() => setIsUserModalOpen(true)}><Plus className="mr-2 h-4 w-4" /> Create User</Button>
                    <Button variant="secondary" className=" border-border rounded-xl h-11 px-6" onClick={openCreateRoleModal}><Shield className="mr-2 h-4 w-4" /> Create Role</Button>
                </div>
            </div>

            <Tabs defaultValue="users" className="w-full" onValueChange={setActiveTab}>
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <TabsList className="bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 p-1.5 h-14 rounded-2xl shadow-sm backdrop-blur-md">
                        <TabsTrigger value="users" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm h-full px-8 text-xs font-bold uppercase tracking-wider text-slate-500 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white transition-all">User Directory</TabsTrigger>
                        <TabsTrigger value="roles" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm h-full px-8 text-xs font-bold uppercase tracking-wider text-slate-500 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white transition-all">Roles & Access</TabsTrigger>
                    </TabsList>
                    <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                        <div className="w-full md:w-48">
                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                                <SelectTrigger className="h-11 bg-background rounded-xl border-border">
                                    <SelectValue placeholder="All Roles" />
                                </SelectTrigger>
                                <SelectContent className="bg-background border-border">
                                    <SelectItem value="all">All Roles</SelectItem>
                                    {roles.map(role => (
                                        <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search records..." className="pl-10 h-11 bg-background rounded-xl" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                    </div>
                </div>
                {isLoading ? <div className="flex flex-col items-center py-20 gap-4"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="text-xs font-bold animate-pulse uppercase tracking-widest">Synchronizing...</p></div> : (
                    <><TabsContent value="users">{renderTable(filterUsers('all'))}</TabsContent><TabsContent value="roles">{renderRolesTable()}</TabsContent></>
                )}
            </Tabs>

            <CreateUserModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} onSuccess={fetchUsers} />

            <Dialog open={isCreateFormOpen} onOpenChange={setIsCreateFormOpen}>
                <DialogContent className="max-w-4xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto text-slate-900 dark:text-slate-100">
                    <DialogHeader><DialogTitle className="text-2xl font-black italic uppercase text-primary">{isEditingRole ? 'Update Role' : 'New System Role'}</DialogTitle></DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Internal Name</Label><Input className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 h-11 border-slate-200 dark:border-slate-800 rounded-xl" value={newRoleData.name} onChange={e => setNewRoleData(prev => ({ ...prev, name: e.target.value }))} /></div>
                            <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Description</Label><Input className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 h-11 border-slate-200 dark:border-slate-800 rounded-xl" value={newRoleData.description} onChange={e => setNewRoleData(prev => ({ ...prev, description: e.target.value }))} /></div>
                        </div>
                        <div className="border rounded-xl border-slate-200 dark:border-slate-800 overflow-hidden">
                            <table className="w-full text-xs text-left text-slate-900 dark:text-slate-100">
                                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800"><tr><th className="p-3 font-bold uppercase text-slate-500 dark:text-slate-400">Module</th><th className="p-3 font-bold uppercase text-center text-slate-500 dark:text-slate-400">Read</th><th className="p-3 font-bold uppercase text-center text-slate-500 dark:text-slate-400">Create</th><th className="p-3 font-bold uppercase text-center text-slate-500 dark:text-slate-400">Update</th><th className="p-3 font-bold uppercase text-center text-slate-500 dark:text-slate-400">Delete</th><th className="p-3 font-bold uppercase text-center text-slate-500 dark:text-slate-400">Disable</th></tr></thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {Array.from(new Set(permissions.map(p => p.module || 'General'))).map(moduleName => (
                                        <React.Fragment key={moduleName}>
                                            <tr className="bg-indigo-50/50 dark:bg-indigo-900/10"><td colSpan={6} className="p-2 px-3 font-black text-[10px] tracking-wider uppercase text-indigo-600 dark:text-indigo-400">{moduleName}</td></tr>
                                            {permissions.filter(p => (p.module || 'General') === moduleName).map(perm => {
                                                const p = newRoleData.permissions.find(pr => pr.featureId === perm.id) || { canRead: false, canCreate: false, canUpdate: false, canDelete: false, isDisabled: false };
                                                return (
                                                    <tr key={perm.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"><td className="p-3 font-medium text-slate-700 dark:text-slate-300">{perm.name}</td>
                                                        <td className="p-3 text-center"><Checkbox className="border-slate-300 dark:border-slate-600 data-[state=checked]:bg-primary" checked={p.canRead} onCheckedChange={(v) => handlePermissionLevelChange(perm.id, 'canRead', !!v)} /></td>
                                                        <td className="p-3 text-center"><Checkbox className="border-slate-300 dark:border-slate-600 data-[state=checked]:bg-primary" checked={p.canCreate} onCheckedChange={(v) => handlePermissionLevelChange(perm.id, 'canCreate', !!v)} /></td>
                                                        <td className="p-3 text-center"><Checkbox className="border-slate-300 dark:border-slate-600 data-[state=checked]:bg-primary" checked={p.canUpdate} onCheckedChange={(v) => handlePermissionLevelChange(perm.id, 'canUpdate', !!v)} /></td>
                                                        <td className="p-3 text-center"><Checkbox className="border-slate-300 dark:border-slate-600 data-[state=checked]:bg-primary" checked={p.canDelete} onCheckedChange={(v) => handlePermissionLevelChange(perm.id, 'canDelete', !!v)} /></td>
                                                        <td className="p-3 text-center"><Checkbox className="border-slate-300 dark:border-slate-600 data-[state=checked]:bg-rose-500" checked={p.isDisabled} onCheckedChange={(v) => handlePermissionLevelChange(perm.id, 'isDisabled', !!v)} /></td>
                                                    </tr>
                                                )
                                            })}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <DialogFooter className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-4 -mx-6 -mb-4 sm:rounded-b-lg">
                        <Button variant="outline" className="border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl" onClick={() => setIsCreateFormOpen(false)}>Cancel</Button>
                        <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-md" onClick={handleSaveRole}>Save Configuration</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteUserOpen} onOpenChange={setIsDeleteUserOpen}>
                <DialogContent className="bg-background border-border"><DialogHeader><DialogTitle className="text-xl font-black text-red-500 uppercase italic">Delete User</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">Are you sure you want to delete <b>{userToDelete?.name}</b>? This action is permanent.</p>
                    <DialogFooter><Button variant="outline" className="" onClick={() => setIsDeleteUserOpen(false)}>Cancel</Button><Button className="bg-red-600 hover:bg-red-700" onClick={handleDeleteUser}>Confirm Delete</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteRoleOpen} onOpenChange={setIsDeleteRoleOpen}>
                <DialogContent className="bg-background border-border"><DialogHeader><DialogTitle className="text-xl font-black text-red-500 uppercase italic">Delete Role</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">Are you sure you want to delete the <b>{roleToDelete?.name}</b> role?</p>
                    <DialogFooter><Button variant="outline" className="" onClick={() => setIsDeleteRoleOpen(false)}>Cancel</Button><Button className="bg-red-600 hover:bg-red-700" onClick={handleDeleteRole}>Confirm Delete</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
                <DialogContent className="bg-background border-border">
                    <DialogHeader><DialogTitle className="text-xl font-black uppercase italic text-primary">Edit User</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input className="bg-background border-border" value={editUserData.name} onChange={e => setEditUserData(prev => ({ ...prev, name: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input className="bg-background border-border" value={editUserData.phone} onChange={e => setEditUserData(prev => ({ ...prev, phone: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <div className="flex items-center space-x-2 mt-2">
                                <Checkbox id="active" checked={editUserData.isActive} onCheckedChange={(v) => setEditUserData(prev => ({ ...prev, isActive: !!v }))} />
                                <Label htmlFor="active" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Active User</Label>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="" onClick={() => setIsEditUserOpen(false)}>Cancel</Button>
                        <Button className="bg-primary hover:bg-primary/90" onClick={handleUpdateUser}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
