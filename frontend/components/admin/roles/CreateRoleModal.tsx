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
import { rbacApi } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Shield } from "lucide-react"

interface Feature {
    id: string
    name: string
    code: string
    module: string | null
}

interface Permission {
    featureId: string
    canRead: boolean
    canWrite: boolean
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
    const { toast } = useToast()

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
                        canWrite: rp.canWrite,
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

    const loadFeatures = async () => {
        try {
            setIsLoading(true)
            const res = await rbacApi.getFeatures()
            setFeatures(res.data)
            
            // Initialize permissions for new role if not already set
            if (!roleToEdit) {
                const initialPerms: Record<string, Permission> = {}
                res.data.forEach((f: Feature) => {
                    initialPerms[f.id] = {
                        featureId: f.id,
                        canRead: false,
                        canWrite: false,
                        isDisabled: false
                    }
                })
                setPermissions(initialPerms)
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load features",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handlePermissionChange = (featureId: string, field: keyof Permission, value: boolean) => {
        setPermissions(prev => {
            const current = prev[featureId] || { featureId, canRead: false, canWrite: false, isDisabled: false }
            const updated = { ...current, [field]: value }

            // Logic: Disable overrides Read and Write
            if (field === 'isDisabled' && value === true) {
                updated.canRead = false
                updated.canWrite = false
            }

            // Logic: Write implies Read
            if (field === 'canWrite' && value === true) {
                updated.canRead = true
                updated.isDisabled = false
            }

            // Logic: Enabling Read/Write unchecks Disable
            if ((field === 'canRead' || field === 'canWrite') && value === true) {
                updated.isDisabled = false
            }

            return { ...prev, [featureId]: updated }
        })
    }

    const handleSave = async () => {
        if (!name) {
            toast({ title: "Error", description: "Role name is required", variant: "destructive" })
            return
        }

        try {
            setIsSaving(true)
            const payload = {
                name,
                description,
                permissions: Object.values(permissions)
            }

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
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to save role",
                variant: "destructive"
            })
        } finally {
            setIsSaving(false)
        }
    }

    // Group features by module
    const modules = Array.from(new Set(features.map(f => f.module || 'General')))

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        {roleToEdit ? "Edit Role" : "Create New Role"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Role Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. Content Editor"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                placeholder="Short description of this role"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 border-b">
                                <tr>
                                    <th className="text-left p-3 font-medium">Feature</th>
                                    <th className="text-center p-3 font-medium">Read</th>
                                    <th className="text-center p-3 font-medium">Write</th>
                                    <th className="text-center p-3 font-medium">Disable</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                        </td>
                                    </tr>
                                ) : (
                                    modules.map(moduleName => (
                                        <React.Fragment key={moduleName}>
                                            <tr className="bg-muted/20">
                                                <td colSpan={4} className="p-2 px-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                                                    {moduleName}
                                                </td>
                                            </tr>
                                            {features.filter(f => (f.module || 'General') === moduleName).map(feature => (
                                                <tr key={feature.id} className="border-b last:border-0 hover:bg-muted/10 transition-colors">
                                                    <td className="p-3">
                                                        <div className="font-medium">{feature.name}</div>
                                                        <div className="text-xs text-muted-foreground">{feature.code}</div>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <Checkbox
                                                            checked={permissions[feature.id]?.canRead || false}
                                                            onCheckedChange={(checked) => handlePermissionChange(feature.id, 'canRead', !!checked)}
                                                        />
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <Checkbox
                                                            checked={permissions[feature.id]?.canWrite || false}
                                                            onCheckedChange={(checked) => handlePermissionChange(feature.id, 'canWrite', !!checked)}
                                                        />
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <Checkbox
                                                            checked={permissions[feature.id]?.isDisabled || false}
                                                            className="data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                                                            onCheckedChange={(checked) => handlePermissionChange(feature.id, 'isDisabled', !!checked)}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        {roleToEdit ? "Update Role" : "Create Role"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
