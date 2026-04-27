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
import { Loader2, UserPlus, Shield } from "lucide-react"

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

    useEffect(() => {
        if (isOpen) {
            fetchRoles()
            setFormData({
                name: "",
                email: "",
                password: "",
                phone: "",
                roleId: ""
            })
        }
    }, [isOpen])

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

    const handleSave = async () => {
        if (!formData.name || !formData.email || !formData.password || !formData.roleId) {
            toast({
                title: "Error",
                description: "Please fill in all required fields",
                variant: "destructive"
            })
            return
        }

        try {
            setIsSaving(true)
            await api.post("/users", formData)
            toast({
                title: "Success",
                description: "User account created successfully"
            })
            onSuccess()
            onClose()
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to create user",
                variant: "destructive"
            })
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md bg-[#0a0a0b] border-white/10">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl font-black italic tracking-tighter uppercase text-primary">
                        <UserPlus className="h-6 w-6" />
                        Create New User
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground/80">
                        Add a new account to the platform and assign their access level.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                        <Input
                            id="name"
                            placeholder="John Doe"
                            className="glass-input h-11 border-white/10 rounded-xl"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            className="glass-input h-11 border-white/10 rounded-xl"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="glass-input h-11 border-white/10 rounded-xl"
                                value={formData.password}
                                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone (Optional)</Label>
                            <Input
                                id="phone"
                                placeholder="+91 99999 99999"
                                className="glass-input h-11 border-white/10 rounded-xl"
                                value={formData.phone}
                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">System Role</Label>
                        <Select
                            value={formData.roleId}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, roleId: value }))}
                        >
                            <SelectTrigger className="glass-input h-11 border-white/10 rounded-xl">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0a0a0b] border-white/10">
                                {isLoadingRoles ? (
                                    <div className="p-4 flex justify-center">
                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                    </div>
                                ) : (
                                    roles.map((role) => (
                                        <SelectItem key={role.id} value={role.id} className="focus:bg-primary/20">
                                            <div className="flex items-center gap-2">
                                                <Shield className="h-3 w-3 text-primary" />
                                                <span>{role.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter className="gap-3">
                    <Button variant="outline" className="border-white/10 glass rounded-xl flex-1" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button 
                        className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] flex-1"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                        Create Account
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
