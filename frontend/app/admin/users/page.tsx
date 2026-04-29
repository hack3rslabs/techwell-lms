"use client"

import * as React from 'react'
import { useRouter } from 'next/navigation'
import api, { rbacApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, UserCheck, UserX, Loader2, Users, Download, Eye, CheckCircle, Plus, Trash2, Shield, ShieldAlert, Edit2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { exportToCSV } from '@/lib/export-utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from '@/components/ui/use-toast'
import { useAuth } from '@/lib/auth-context'
import { CreateUserModal } from '@/components/admin/users/CreateUserModal'

interface User {
    id: string
    email: string
    name: string
    role: string
    isActive: boolean
    createdAt: string
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
        canWrite: boolean
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

export default function AdminUsersPage() {
    const router = useRouter()
    const { user: currentUser, hasPermission, isLoading: authLoading } = useAuth()
    const [users, setUsers] = React.useState<User[]>([])
    const [roles, setRoles] = React.useState<Role[]>([])
    const [permissions, setPermissions] = React.useState<Permission[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [searchQuery, setSearchQuery] = React.useState("")
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
            const res = await api.get('/users')
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

    const filterUsers = (type: string) => {
        let filtered = users;
        if (searchQuery) {
            filtered = filtered.filter(u =>
                u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.email.toLowerCase().includes(searchQuery.toLowerCase())
            )
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
        setIsEditingRole(true);
        setRoleToEditId(role.id);
        setNewRoleData({
            name: role.name,
            description: role.description || "",
            permissions: role.rolePermissions.map(rp => ({
                featureId: rp.featureId,
                canRead: rp.canRead,
                canWrite: rp.canWrite,
                isDisabled: rp.isDisabled
            }))
        });
        setIsCreateFormOpen(true);
    }

    const handlePermissionLevelChange = (featureId: string, level: 'canRead' | 'canWrite' | 'isDisabled', value: boolean) => {
        setNewRoleData(prev => {
            const existing = prev.permissions.find(p => p.featureId === featureId);
            let updatedPermissions = [...prev.permissions];
            if (existing) {
                const updated = { ...existing, [level]: value };
                if (level === 'isDisabled' && value) { updated.canRead = false; updated.canWrite = false; }
                if (level === 'canWrite' && value) { updated.canRead = true; updated.isDisabled = false; }
                if ((level === 'canRead' || level === 'canWrite') && value) { updated.isDisabled = false; }
                updatedPermissions = updatedPermissions.map(p => p.featureId === featureId ? updated : p);
            } else {
                const initial = { featureId, canRead: false, canWrite: false, isDisabled: false, [level]: value };
                if (level === 'canWrite' && value) initial.canRead = true;
                updatedPermissions.push(initial);
            }
            return { ...prev, permissions: updatedPermissions };
        });
    }

    const renderTable = (data: User[]) => (
        <div className="rounded-2xl border border-white/10 glass-card overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                            <th className="p-4 font-bold text-muted-foreground uppercase text-[10px]">User Profile</th>
                            <th className="p-4 font-bold text-muted-foreground uppercase text-[10px]">Access Level</th>
                            <th className="p-4 font-bold text-muted-foreground uppercase text-[10px]">Status</th>
                            <th className="p-4 font-bold text-muted-foreground uppercase text-[10px] text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {data.length === 0 ? (
                            <tr><td colSpan={4} className="p-20 text-center opacity-50"><p className="text-sm font-bold">No users found</p></td></tr>
                        ) : (
                            data.map(user => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">{user.name[0]}</div>
                                            <div>
                                                <div className="font-bold">{user.name}</div>
                                                <div className="text-[11px] text-muted-foreground">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <Badge variant="outline" className={`${getRoleBadgeColor(user.role)} text-[10px] uppercase font-bold`}>
                                            {user.systemRole?.name || user.role}
                                        </Badge>
                                    </td>
                                    <td className="p-4">
                                        {user.isActive ? <Badge className="bg-green-500/10 text-green-500 border-none text-[9px]">ACTIVE</Badge> : <Badge className="bg-red-500/10 text-red-500 border-none text-[9px]">LOCKED</Badge>}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/admin/users/${user.id}`)}><Eye className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" className={`h-8 w-8 ${user.isActive ? 'text-red-500' : 'text-green-500'}`} onClick={() => toggleUserStatus(user.id, user.isActive)}>
                                                {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                            </Button>
                                            {currentUser?.role === 'SUPER_ADMIN' && user.id !== currentUser.id && (
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
        <div className="rounded-2xl border border-white/10 glass-card overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                            <th className="p-4 font-bold text-muted-foreground uppercase text-[10px]">Role Name</th>
                            <th className="p-4 font-bold text-muted-foreground uppercase text-[10px]">Description</th>
                            <th className="p-4 font-bold text-muted-foreground uppercase text-[10px] text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {roles.map(role => (
                            <tr key={role.id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="font-bold">{role.name}</div>
                                        {role.isSystem && <Badge className="text-[8px] h-4 px-1 uppercase bg-blue-500/10 text-blue-400 border-none">System</Badge>}
                                    </div>
                                </td>
                                <td className="p-4 text-xs text-muted-foreground">{role.description || "Custom role"}</td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => openEditRoleModal(role)}><Edit2 className="h-4 w-4" /></Button>
                                        {!role.isSystem && (
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-500/10" onClick={() => { setRoleToDelete(role); setIsDeleteRoleOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
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
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight italic uppercase">Users & <span className="text-primary">Roles</span></h1>
                    <p className="text-muted-foreground text-sm">Manage platform accounts and access hierarchies.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg rounded-xl h-11 px-6" onClick={() => setIsUserModalOpen(true)}><Plus className="mr-2 h-4 w-4" /> Create User</Button>
                    <Button variant="secondary" className="glass border-white/10 rounded-xl h-11 px-6" onClick={openCreateRoleModal}><Shield className="mr-2 h-4 w-4" /> Create Role</Button>
                </div>
            </div>

            <Tabs defaultValue="users" className="w-full" onValueChange={setActiveTab}>
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <TabsList className="bg-white/5 border border-white/10 p-1 h-12 rounded-xl">
                        <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-primary h-full px-8 text-xs font-bold uppercase">User Directory</TabsTrigger>
                        <TabsTrigger value="roles" className="rounded-lg data-[state=active]:bg-primary h-full px-8 text-xs font-bold uppercase">Roles & Access</TabsTrigger>
                    </TabsList>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search records..." className="pl-10 h-11 glass-input rounded-xl" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                </div>
                {isLoading ? <div className="flex flex-col items-center py-20 gap-4"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="text-xs font-bold animate-pulse uppercase tracking-widest">Synchronizing...</p></div> : (
                    <><TabsContent value="users">{renderTable(filterUsers('all'))}</TabsContent><TabsContent value="roles">{renderRolesTable()}</TabsContent></>
                )}
            </Tabs>

            <CreateUserModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} onSuccess={fetchUsers} />

            <Dialog open={isCreateFormOpen} onOpenChange={setIsCreateFormOpen}>
                <DialogContent className="max-w-4xl bg-[#0a0a0b] border-white/10 max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle className="text-2xl font-black italic uppercase text-primary">{isEditingRole ? 'Update Role' : 'New System Role'}</DialogTitle></DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-muted-foreground">Internal Name</Label><Input className="glass-input h-11 border-white/10 rounded-xl" value={newRoleData.name} onChange={e => setNewRoleData(prev => ({ ...prev, name: e.target.value }))} /></div>
                            <div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-muted-foreground">Description</Label><Input className="glass-input h-11 border-white/10 rounded-xl" value={newRoleData.description} onChange={e => setNewRoleData(prev => ({ ...prev, description: e.target.value }))} /></div>
                        </div>
                        <div className="border rounded-xl border-white/10 overflow-hidden">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-white/5 border-b border-white/10"><tr><th className="p-3 font-bold uppercase">Module</th><th className="p-3 font-bold uppercase text-center">Read</th><th className="p-3 font-bold uppercase text-center">Write</th><th className="p-3 font-bold uppercase text-center">Disable</th></tr></thead>
                                <tbody>
                                    {Array.from(new Set(permissions.map(p => p.module || 'General'))).map(moduleName => (
                                        <React.Fragment key={moduleName}>
                                            <tr className="bg-white/5"><td colSpan={4} className="p-2 px-3 font-black text-[9px] uppercase text-primary/70">{moduleName}</td></tr>
                                            {permissions.filter(p => (p.module || 'General') === moduleName).map(perm => {
                                                const p = newRoleData.permissions.find(pr => pr.featureId === perm.id) || { canRead: false, canWrite: false, isDisabled: false };
                                                return (
                                                    <tr key={perm.id} className="border-b border-white/5 last:border-0"><td className="p-3 font-medium">{perm.name}</td>
                                                        <td className="p-3 text-center"><Checkbox checked={p.canRead} onCheckedChange={(v) => handlePermissionLevelChange(perm.id, 'canRead', !!v)} /></td>
                                                        <td className="p-3 text-center"><Checkbox checked={p.canWrite} onCheckedChange={(v) => handlePermissionLevelChange(perm.id, 'canWrite', !!v)} /></td>
                                                        <td className="p-3 text-center"><Checkbox checked={p.isDisabled} onCheckedChange={(v) => handlePermissionLevelChange(perm.id, 'isDisabled', !!v)} /></td>
                                                    </tr>
                                                )
                                            })}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <DialogFooter><Button variant="outline" className="glass border-white/10 rounded-xl" onClick={() => setIsCreateFormOpen(false)}>Cancel</Button><Button className="bg-primary hover:bg-primary/90 rounded-xl" onClick={handleSaveRole}>Save Configuration</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteUserOpen} onOpenChange={setIsDeleteUserOpen}>
                <DialogContent className="bg-[#0a0a0b] border-white/10"><DialogHeader><DialogTitle className="text-xl font-black text-red-500 uppercase italic">Delete User</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">Are you sure you want to delete <b>{userToDelete?.name}</b>? This action is permanent.</p>
                    <DialogFooter><Button variant="outline" className="glass" onClick={() => setIsDeleteUserOpen(false)}>Cancel</Button><Button className="bg-red-600 hover:bg-red-700" onClick={handleDeleteUser}>Confirm Delete</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteRoleOpen} onOpenChange={setIsDeleteRoleOpen}>
                <DialogContent className="bg-[#0a0a0b] border-white/10"><DialogHeader><DialogTitle className="text-xl font-black text-red-500 uppercase italic">Delete Role</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">Are you sure you want to delete the <b>{roleToDelete?.name}</b> role?</p>
                    <DialogFooter><Button variant="outline" className="glass" onClick={() => setIsDeleteRoleOpen(false)}>Cancel</Button><Button className="bg-red-600 hover:bg-red-700" onClick={handleDeleteRole}>Confirm Delete</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
