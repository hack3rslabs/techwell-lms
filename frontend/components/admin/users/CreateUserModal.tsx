"use client"

import React, { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { rbacApi } from "@/lib/api"
import api from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, UserPlus, Shield, User, Mail, Lock, Phone, CheckCircle2 } from "lucide-react"

interface Role {
    id: string
    name: string
    isSystem: boolean
}

interface CreateUserModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export function CreateUserModal({ isOpen, onClose, onSuccess }: CreateUserModalProps) {
    const [roles, setRoles] = useState<Role[]>([])
    const [isLoadingRoles, setIsLoadingRoles] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const { toast } = useToast()

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        roleId: ""
    })

    const fetchRoles = async () => {
        try {
            setIsLoadingRoles(true)
            const res = await rbacApi.getRoles()
            setRoles(res.data)
        } catch (error) {
            console.error("Failed to fetch roles", error)
        } finally {
            setIsLoadingRoles(false)
        }
    }

    useEffect(() => {
        if (isOpen) {
            fetchRoles()
            setFormData({ name: "", email: "", password: "", phone: "", roleId: "" })
        }
    }, [isOpen])

    const handleSave = async () => {
        if (!formData.name || !formData.email || !formData.password || !formData.roleId) {
            toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" })
            return
        }
        try {
            setIsSaving(true)
            await api.post("/users", formData)
            toast({ title: "Success", description: "User account created successfully" })
            onSuccess()
            onClose()
        } catch (error: any) {
            toast({ title: "Error", description: error.response?.data?.error || "Failed to create user", variant: "destructive" })
        } finally {
            setIsSaving(false)
        }
    }

    const selectedRole = roles.find(r => r.id === formData.roleId)

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-2xl p-0 overflow-hidden">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 pt-6 pb-8">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-white text-xl font-bold">
                            <div className="bg-white/20 rounded-xl p-2">
                                <UserPlus className="h-5 w-5 text-white" />
                            </div>
                            Create New User
                        </DialogTitle>
                        <DialogDescription className="text-blue-100 text-sm mt-1">
                            Add a new account and assign their access level.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* Form Body — pulled up over banner */}
                <div className="bg-white dark:bg-slate-900 rounded-t-2xl -mt-4 px-6 pt-5 pb-2 space-y-4">

                    {/* Full Name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="cu-name" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <User className="h-3 w-3" /> Full Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="cu-name"
                            placeholder="e.g. Ravi Kumar"
                            className="h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <Label htmlFor="cu-email" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <Mail className="h-3 w-3" /> Email Address <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="cu-email"
                            type="email"
                            placeholder="ravi@example.com"
                            className="h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        />
                    </div>

                    {/* Password + Phone */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="cu-password" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                <Lock className="h-3 w-3" /> Password <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="cu-password"
                                type="password"
                                placeholder="Min 8 chars"
                                className="h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={formData.password}
                                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="cu-phone" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                <Phone className="h-3 w-3" /> Phone
                            </Label>
                            <Input
                                id="cu-phone"
                                placeholder="+91 99999 99999"
                                className="h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={formData.phone}
                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            />
                        </div>
                    </div>

                    {/* Role */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <Shield className="h-3 w-3" /> System Role <span className="text-red-500">*</span>
                        </Label>
                        <Select value={formData.roleId} onValueChange={(value) => setFormData(prev => ({ ...prev, roleId: value }))}>
                            <SelectTrigger className="h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                                <SelectValue placeholder="Select a role..." />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl shadow-xl">
                                {isLoadingRoles ? (
                                    <div className="p-4 flex justify-center">
                                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                    </div>
                                ) : (
                                    roles.map((role) => (
                                        <SelectItem key={role.id} value={role.id} className="rounded-lg cursor-pointer">
                                            <div className="flex items-center gap-2 py-0.5">
                                                <Shield className="h-3.5 w-3.5 text-blue-500" />
                                                <span className="font-medium text-slate-800 dark:text-slate-200">{role.name}</span>
                                                {role.isSystem && <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-bold uppercase">System</span>}
                                            </div>
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Role preview badge */}
                    {selectedRole && (
                        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-2.5">
                            <CheckCircle2 className="h-4 w-4 text-blue-600" />
                            <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                                This user will be assigned the <strong>{selectedRole.name}</strong> role
                            </span>
                        </div>
                    )}
                </div>

                <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 gap-3">
                    <Button
                        variant="outline"
                        className="rounded-xl flex-1 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 flex-1 gap-2"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                        Create Account
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
