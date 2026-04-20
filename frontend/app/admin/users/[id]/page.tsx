"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import api from "@/lib/api"
import { userApi } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, ArrowLeft, Mail, Calendar, Shield, Activity, Save } from "lucide-react"

export default function User360Page() {
    const { id } = useParams()
    const router = useRouter()

    interface UserProfile {
        id: string
        name: string
        email: string
        role: string
        avatar?: string
        createdAt: string
        isActive: boolean
        permissions?: string[]
    }
    interface AuditLog {
        id: string
        action: string
        entityType: string
        timestamp: string
        method: string
        path: string
        ipAddress?: string
        userAgent?: string
        details?: unknown
    }

    const [user, setUser] = useState<UserProfile | null>(null)
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
    const [isLoading, setIsLoading] = useState(true)
    
    // RBAC States
    const [isSavingObject, setIsSavingObject] = useState(false)
    const [editedRole, setEditedRole] = useState<string>("")
    const [editedIsActive, setEditedIsActive] = useState<boolean>(true)
    const [editedPermissions, setEditedPermissions] = useState<string[]>([])

    const RBAC_MODULES = [
        { id: "USERS", label: "Users & Roles", desc: "Admin staff and internal profiles" },
        { id: "COURSES", label: "Courses", desc: "Course material and orchestrations" },
        { id: "CERTIFICATES", label: "Certificates", desc: "Issued certificates and templates" },
        { id: "STUDENTS", label: "Students", desc: "Student platform profiles" },
        { id: "EMPLOYERS", label: "Employer Requests", desc: "Enterprise partnership requests" },
        { id: "LEADS", label: "All Leads", desc: "CRM and marketing targets" },
        { id: "MEETINGS", label: "Meetings", desc: "Schedule and tracking" },
        { id: "TASKS", label: "Tasks", desc: "Internal workflow operations" },
        { id: "MESSAGES", label: "Messages", desc: "Direct communications & chat" },
        { id: "BLOGS", label: "Blogs", desc: "Public website articles" },
        { id: "GALLERY", label: "Gallery", desc: "Media library assets" },
        { id: "SKILLCASTS", label: "Skillcasts", desc: "Live streaming & webinars" },
        { id: "REVIEWS", label: "Reviews", desc: "Ratings & feedback moderation" },
        { id: "LIBRARY", label: "Library", desc: "Digital resource centre" },
        { id: "SYSTEM_LOGS", label: "System Logs", desc: "Security forensics" },
    ];

    const ROLES_LIST = ["STUDENT", "INSTRUCTOR", "EMPLOYER", "ADMIN", "SUPER_ADMIN", "STAFF", "INSTITUTE_ADMIN"];

    useEffect(() => {
        fetchData()
    }, [id])

    const fetchData = async () => {
        try {
            const [activityRes, usersRes] = await Promise.all([
                api.get(`/users/${id}/activity`),
                api.get('/users')
            ])

            setAuditLogs(activityRes.data)

            const foundUser = usersRes.data.users.find((u: UserProfile) => u.id === id)
            if (foundUser) {
                const perms = foundUser.permissions || (foundUser.role === 'SUPER_ADMIN' ? ["ALL"] : []);
                foundUser.permissions = perms;
                setUser(foundUser);
                setEditedRole(foundUser.role);
                setEditedIsActive(foundUser.isActive);
                setEditedPermissions(perms);
            }
        } catch (error) {
            console.error("Failed to fetch user data", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleRadioChange = (moduleId: string, value: string) => {
        const viewKey = `VIEW_${moduleId}`;
        const manageKey = `MANAGE_${moduleId}`;
        
        setEditedPermissions(prev => {
            const next = prev.filter(p => p !== viewKey && p !== manageKey);
            
            if (value === "allow") {
                next.push(viewKey, manageKey);
            } else if (value === "view") {
                next.push(viewKey);
            }
            return next;
        });
    }

    const getModuleRadioValue = (moduleId: string) => {
        const hasManage = editedPermissions.includes(`MANAGE_${moduleId}`);
        const hasView = editedPermissions.includes(`VIEW_${moduleId}`);
        
        if (hasManage) return "allow";
        if (hasView) return "view";
        return "deny";
    }

    const handleAllWildcard = (checked: boolean) => {
        if(checked) {
            setEditedPermissions(prev => [...prev.filter(p => p !== 'ALL'), 'ALL']);
        } else {
            setEditedPermissions(prev => prev.filter(p => p !== 'ALL'));
        }
    }

    const saveRBAC = async () => {
        setIsSavingObject(true);
        try {
            await userApi.updatePermissions(id as string, {
                role: editedRole,
                isActive: editedIsActive,
                permissions: editedPermissions
            });
            if (user) {
                setUser({
                    ...user,
                    role: editedRole,
                    isActive: editedIsActive,
                    permissions: editedPermissions
                });
            }
            alert("User Access & Validation settings updated successfully.");
        } catch (error: any) {
            alert(error.response?.data?.error || "Failed to update permissions.");
        } finally {
            setIsSavingObject(false);
        }
    }

    if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-8 w-8" /></div>
    if (!user) return <div className="p-8">User not found</div>

    return (
        <div className="space-y-6">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users
            </Button>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-1">
                    <CardContent className="pt-6 flex flex-col items-center text-center">
                        <Avatar className="h-24 w-24 mb-4">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="text-2xl">{user.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <h2 className="text-2xl font-bold">{user.name}</h2>
                        <Badge variant={user.isActive ? "default" : "destructive"} className="mt-2 mb-4">
                            {user.role} {user.isActive ? "" : "(Disabled)"}
                        </Badge>

                        <div className="w-full space-y-3 text-left">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-4 w-4" /> {user.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" /> Joined {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Shield className="h-4 w-4" /> {user.isActive ? 'Active Account' : 'Deactivated'}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="md:col-span-2">
                    <Tabs defaultValue="access" className="w-full">
                        <TabsList className="mb-4 w-full grid grid-cols-2">
                            <TabsTrigger value="activity">Audit Trail</TabsTrigger>
                            <TabsTrigger value="access">Access & Permissions</TabsTrigger>
                        </TabsList>

                        <TabsContent value="activity">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Activity Log</CardTitle>
                                    <CardDescription>Track every action performed by this user.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-[400px] pr-4">
                                        <div className="space-y-6 relative border-l ml-2 pl-6">
                                            {auditLogs.length === 0 && (
                                                <p className="text-muted-foreground text-sm">No activity recorded for this user yet.</p>
                                            )}
                                            {auditLogs.map((log) => (
                                                <div key={log.id} className="relative">
                                                    <div className={`absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-white bg-blue-500`} />
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-sm">{log.action}</span>
                                                            <Badge variant="secondary" className="text-[10px]">{log.entityType}</Badge>
                                                            <span className="text-xs text-muted-foreground ml-auto">{new Date(log.timestamp).toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="access">
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <Shield className="h-5 w-5 text-orange-600" />
                                                RBAC Security Matrix
                                            </CardTitle>
                                            <CardDescription>Granular Read/Write overrides.</CardDescription>
                                        </div>
                                        <Button onClick={saveRBAC} disabled={isSavingObject} className="gap-2">
                                            {isSavingObject ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            Save 
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-8 pb-10">
                                    <div className="space-y-4">
                                        <h3 className="text-md font-semibold border-b pb-2">Account Level</h3>
                                        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                                            <div className="space-y-0.5">
                                                <Label className="text-base font-semibold">Account Status</Label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">{editedIsActive ? "Active" : "Disabled"}</span>
                                                <Switch checked={editedIsActive} onCheckedChange={setEditedIsActive} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Primary Role</Label>
                                                <Select value={editedRole} onValueChange={setEditedRole}>
                                                    <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                                                    <SelectContent>
                                                        {ROLES_LIST.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between border-b pb-2">
                                            <h3 className="text-md font-semibold">Granular Module Matrix</h3>
                                            <div className="flex items-center gap-2">
                                                <Label htmlFor="allAccess" className="text-sm font-semibold text-orange-600 cursor-pointer">OVERRIDE (ALL)</Label>
                                                <Switch id="allAccess" checked={editedPermissions.includes('ALL')} onCheckedChange={handleAllWildcard} />
                                            </div>
                                        </div>
                                        
                                        <div className="rounded-md border overflow-hidden">
                                            <div className="bg-muted px-4 py-3 grid grid-cols-12 gap-4 items-center">
                                                <div className="col-span-5 font-semibold text-sm">System Module</div>
                                                <div className="col-span-7 font-semibold text-sm">Access Designation</div>
                                            </div>
                                            <div className="divide-y relative">
                                                {editedPermissions.includes('ALL') && (
                                                    <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                                                        <Badge variant="outline" className="bg-background text-orange-600 py-1.5 px-3 border-orange-200">
                                                            ALL PERMISSIONS INHERITED
                                                        </Badge>
                                                    </div>
                                                )}
                                                {RBAC_MODULES.map((module) => {
                                                    return (
                                                        <div key={module.id} className="px-4 py-4 grid grid-cols-12 gap-4 items-center hover:bg-muted/30 transition-colors">
                                                            <div className="col-span-4 flex flex-col">
                                                                <span className="font-semibold text-sm">{module.label}</span>
                                                                <span className="text-[10px] text-muted-foreground hidden lg:block">{module.desc}</span>
                                                            </div>
                                                            <div className="col-span-8">
                                                                <RadioGroup 
                                                                    className="flex flex-col sm:flex-row gap-4 sm:gap-6" 
                                                                    value={getModuleRadioValue(module.id)}
                                                                    onValueChange={(v) => handleRadioChange(module.id, v)}
                                                                >
                                                                    <div className="flex items-center space-x-2">
                                                                        <RadioGroupItem value="allow" id={`allow-${module.id}`} />
                                                                        <Label htmlFor={`allow-${module.id}`} className="cursor-pointer text-sm font-medium">Allow (Full)</Label>
                                                                    </div>
                                                                    <div className="flex items-center space-x-2">
                                                                        <RadioGroupItem value="view" id={`view-${module.id}`} />
                                                                        <Label htmlFor={`view-${module.id}`} className="cursor-pointer text-sm">View Only</Label>
                                                                    </div>
                                                                    <div className="flex items-center space-x-2">
                                                                        <RadioGroupItem value="deny" id={`deny-${module.id}`} />
                                                                        <Label htmlFor={`deny-${module.id}`} className="cursor-pointer text-sm text-destructive">Deny / Hidden</Label>
                                                                    </div>
                                                                </RadioGroup>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
