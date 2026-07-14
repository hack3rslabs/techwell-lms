"use client"

import React, { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { rbacApi } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Shield, Eye, Edit3, Ban, CheckCircle, ChevronDown, ChevronRight } from "lucide-react"

interface Feature {
    id: string
    name: string
    code: string
    module: string | null
}

interface Permission {
    featureId: string
    canRead: boolean
    canCreate: boolean
    canUpdate: boolean
    canDelete: boolean
    isDisabled: boolean
}

interface CreateRoleModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    roleToEdit?: any
}

export function CreateRoleModal({ isOpen, onClose, onSuccess, roleToEdit }: CreateRoleModalProps) {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [features, setFeatures] = useState<Feature[]>([])
    const [permissions, setPermissions] = useState<Record<string, Permission>>({})
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({})
    const { toast } = useToast()

    const loadFeatures = async () => {
        try {
            setIsLoading(true)
            const res = await rbacApi.getFeatures()
            setFeatures(res.data)
            if (!roleToEdit) {
                const initialPerms: Record<string, Permission> = {}
                res.data.forEach((f: Feature) => {
                    initialPerms[f.id] = { featureId: f.id, canRead: false, canCreate: false, canUpdate: false, canDelete: false, isDisabled: false }
                })
                setPermissions(initialPerms)
            }
        } catch {
            toast({ title: "Error", description: "Failed to load features", variant: "destructive" })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (isOpen) {
            loadFeatures()
            if (roleToEdit) {
                setName(roleToEdit.name)
                setDescription(roleToEdit.description || "")
                const initialPerms: Record<string, Permission> = {}
                roleToEdit.rolePermissions?.forEach((rp: any) => {
                    initialPerms[rp.featureId] = {
                        featureId: rp.featureId,
                        canRead: rp.canRead,
                        canCreate: rp.canCreate,
                        canUpdate: rp.canUpdate,
                        canDelete: rp.canDelete,
                        isDisabled: rp.isDisabled
                    }
                })
                setPermissions(initialPerms)
            } else {
                setName("")
                setDescription("")
                setPermissions({})
            }
        }
    }, [isOpen, roleToEdit])

    const handlePermissionChange = (featureId: string, field: keyof Permission, value: boolean) => {
        setPermissions(prev => {
            const current = prev[featureId] || { featureId, canRead: false, canCreate: false, canUpdate: false, canDelete: false, isDisabled: false }
            const updated = { ...current, [field]: value } as Permission
            if (field === 'isDisabled' && value === true) { updated.canRead = false; updated.canCreate = false; updated.canUpdate = false; updated.canDelete = false }
            if (['canCreate', 'canUpdate', 'canDelete'].includes(field as string) && value === true) { updated.canRead = true; updated.isDisabled = false }
            if (field === 'canRead' && value === true) updated.isDisabled = false
            return { ...prev, [featureId]: updated }
        })
    }

    const handleModuleToggleAll = (moduleFeatures: Feature[], field: keyof Permission) => {
        const allChecked = moduleFeatures.every(f => permissions[f.id]?.[field])
        setPermissions(prev => {
            const next = { ...prev }
            moduleFeatures.forEach(f => {
                const current = next[f.id] || { featureId: f.id, canRead: false, canCreate: false, canUpdate: false, canDelete: false, isDisabled: false }
                const updated = { ...current, [field]: !allChecked } as Permission
                if (!allChecked && ['canCreate', 'canUpdate', 'canDelete'].includes(field as string)) { updated.canRead = true; updated.isDisabled = false }
                next[f.id] = updated
            })
            return next
        })
    }

    const handleSave = async () => {
        if (!name) { toast({ title: "Error", description: "Role name is required", variant: "destructive" }); return }
        try {
            setIsSaving(true)
            const payload = { name, description, permissions: Object.values(permissions) }
            if (roleToEdit) {
                await rbacApi.updateRole(roleToEdit.id, payload)
                toast({ title: "Success", description: "Role updated successfully" })
            } else {
                await rbacApi.createRole(payload)
                toast({ title: "Success", description: "Role created successfully" })
            }
            onSuccess()
            onClose()
        } catch (error: any) {
            toast({ title: "Error", description: error.response?.data?.error || "Failed to save role", variant: "destructive" })
        } finally {
            setIsSaving(false)
        }
    }

    const modules = Array.from(new Set(features.map(f => f.module || 'General')))

    const getPermissionSummary = () => {
        const total = features.length
        const enabled = Object.values(permissions).filter(p => p.canRead || p.canCreate || p.canUpdate || p.canDelete).length
        return { total, enabled }
    }

    const { total, enabled } = getPermissionSummary()

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[92vh] overflow-hidden flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-2xl p-0">

                {/* Header Banner */}
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 px-6 pt-6 pb-8 shrink-0">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-white text-xl font-bold">
                            <div className="bg-white/20 rounded-xl p-2">
                                <Shield className="h-5 w-5 text-white" />
                            </div>
                            {roleToEdit ? "Edit Role" : "Create New Role"}
                        </DialogTitle>
                        <p className="text-indigo-100 text-sm mt-1">
                            Configure feature-level read, write and access permissions for this role.
                        </p>
                    </DialogHeader>
                </div>

                {/* Content pulled up over banner */}
                <div className="bg-white dark:bg-slate-900 rounded-t-2xl -mt-4 flex flex-col overflow-hidden flex-1 min-h-0">

                    {/* Role name + desc */}
                    <div className="px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="role-name" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Role Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="role-name"
                                    placeholder="e.g. Content Editor"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="role-desc" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Description
                                </Label>
                                <Input
                                    id="role-desc"
                                    placeholder="Short description of this role"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Permission summary bar */}
                        {total > 0 && (
                            <div className="mt-4 flex items-center gap-3">
                                <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-indigo-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${(enabled / total) * 100}%` }}
                                    />
                                </div>
                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                    {enabled}/{total} features enabled
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Permissions table — scrollable */}
                    <div className="overflow-y-auto flex-1 px-6 py-3">

                        {/* Legend */}
                        <div className="flex items-center gap-4 mb-3 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1.5"><Eye className="h-3 w-3 text-blue-500" /> Read</span>
                            <span className="flex items-center gap-1.5"><Edit3 className="h-3 w-3 text-green-500" /> Write</span>
                            <span className="flex items-center gap-1.5"><Ban className="h-3 w-3 text-red-500" /> Disable</span>
                            <span className="ml-auto text-[11px] italic">Click column headers to toggle all in module</span>
                        </div>

                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-3">
                                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                                <p className="text-sm text-slate-500">Loading permissions...</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {modules.map(moduleName => {
                                    const moduleFeatures = features.filter(f => (f.module || 'General') === moduleName)
                                    const isCollapsed = collapsedModules[moduleName]
                                    const enabledInModule = moduleFeatures.filter(f => permissions[f.id]?.canRead || permissions[f.id]?.canCreate || permissions[f.id]?.canUpdate || permissions[f.id]?.canDelete).length

                                    return (
                                        <div key={moduleName} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                                            {/* Module header */}
                                            <div
                                                className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
                                                onClick={() => setCollapsedModules(prev => ({ ...prev, [moduleName]: !prev[moduleName] }))}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {isCollapsed ? <ChevronRight className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                                                    <span className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">{moduleName}</span>
                                                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                                                        {enabledInModule}/{moduleFeatures.length}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => handleModuleToggleAll(moduleFeatures, 'canRead')}
                                                        className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                                                    >
                                                        All Read
                                                    </button>
                                                    <button
                                                        onClick={() => handleModuleToggleAll(moduleFeatures, 'canCreate')}
                                                        className="text-[10px] text-green-600 dark:text-green-400 hover:underline font-semibold"
                                                    >
                                                        All Create
                                                    </button>
                                                    <button
                                                        onClick={() => handleModuleToggleAll(moduleFeatures, 'canUpdate')}
                                                        className="text-[10px] text-green-600 dark:text-green-400 hover:underline font-semibold"
                                                    >
                                                        All Update
                                                    </button>
                                                    <button
                                                        onClick={() => handleModuleToggleAll(moduleFeatures, 'canDelete')}
                                                        className="text-[10px] text-green-600 dark:text-green-400 hover:underline font-semibold"
                                                    >
                                                        All Delete
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Feature rows */}
                                            {!isCollapsed && (
                                                <table className="w-full text-sm">
                                                    <thead className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                                                        <tr>
                                                            <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400">Feature</th>
                                                            <th className="text-center px-4 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 w-16">
                                                                <span className="flex items-center justify-center gap-1"><Eye className="h-3 w-3" />Read</span>
                                                            </th>
                                                            <th className="text-center px-4 py-2 text-xs font-semibold text-green-600 dark:text-green-400 w-16">
                                                                <span className="flex items-center justify-center gap-1"><Edit3 className="h-3 w-3" />Create</span>
                                                            </th>
                                                            <th className="text-center px-4 py-2 text-xs font-semibold text-green-600 dark:text-green-400 w-16">
                                                                <span className="flex items-center justify-center gap-1"><Edit3 className="h-3 w-3" />Update</span>
                                                            </th>
                                                            <th className="text-center px-4 py-2 text-xs font-semibold text-green-600 dark:text-green-400 w-16">
                                                                <span className="flex items-center justify-center gap-1"><Edit3 className="h-3 w-3" />Delete</span>
                                                            </th>
                                                            <th className="text-center px-4 py-2 text-xs font-semibold text-red-500 w-16">
                                                                <span className="flex items-center justify-center gap-1"><Ban className="h-3 w-3" />Disable</span>
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {moduleFeatures.map((feature, idx) => {
                                                            const perm = permissions[feature.id]
                                                            const isEnabled = perm?.canRead || perm?.canCreate || perm?.canUpdate || perm?.canDelete
                                                            return (
                                                                <tr
                                                                    key={feature.id}
                                                                    className={`border-b last:border-0 border-slate-100 dark:border-slate-800 transition-colors ${
                                                                        isEnabled
                                                                            ? 'bg-blue-50/40 dark:bg-blue-900/10'
                                                                            : idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-800/30'
                                                                    } hover:bg-indigo-50 dark:hover:bg-indigo-900/10`}
                                                                >
                                                                    <td className="px-4 py-2.5">
                                                                        <div className="flex items-center gap-2">
                                                                            {isEnabled && <CheckCircle className="h-3 w-3 text-blue-500 shrink-0" />}
                                                                            <div>
                                                                                <div className="font-medium text-slate-800 dark:text-slate-200 text-sm">{feature.name}</div>
                                                                                <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">{feature.code}</div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-2.5 text-center">
                                                                        <Checkbox
                                                                            checked={perm?.canRead || false}
                                                                            onCheckedChange={(checked) => handlePermissionChange(feature.id, 'canRead', !!checked)}
                                                                            className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                                                                        />
                                                                    </td>
                                                                    <td className="px-4 py-2.5 text-center">
                                                                        <Checkbox
                                                                            checked={perm?.canCreate || false}
                                                                            onCheckedChange={(checked) => handlePermissionChange(feature.id, 'canCreate', !!checked)}
                                                                            className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                                                                        />
                                                                    </td>
                                                                    <td className="px-4 py-2.5 text-center">
                                                                        <Checkbox
                                                                            checked={perm?.canUpdate || false}
                                                                            onCheckedChange={(checked) => handlePermissionChange(feature.id, 'canUpdate', !!checked)}
                                                                            className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                                                                        />
                                                                    </td>
                                                                    <td className="px-4 py-2.5 text-center">
                                                                        <Checkbox
                                                                            checked={perm?.canDelete || false}
                                                                            onCheckedChange={(checked) => handlePermissionChange(feature.id, 'canDelete', !!checked)}
                                                                            className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                                                                        />
                                                                    </td>
                                                                    <td className="px-4 py-2.5 text-center">
                                                                        <Checkbox
                                                                            checked={perm?.isDisabled || false}
                                                                            onCheckedChange={(checked) => handlePermissionChange(feature.id, 'isDisabled', !!checked)}
                                                                            className="data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            )
                                                        })}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 gap-3 shrink-0">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="rounded-xl border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20 gap-2 px-6"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                        {roleToEdit ? "Update Role" : "Create Role"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
