"use client"

import { useState, useEffect, useCallback } from "react"
import { userApi } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, RefreshCw, Search, ShieldAlert, Activity } from "lucide-react"

interface AuditLogUser {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface GlobalAuditLog {
    id: string
    action: string
    entityType: string
    entityId?: string
    timestamp: string
    method: string
    path: string
    ipAddress?: string
    userAgent?: string
    performedBy: string
    user?: AuditLogUser
    details?: unknown
}

export default function GlobalAuditLogsPage() {
    const [logs, setLogs] = useState<GlobalAuditLog[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)

    // Filters
    const [search, setSearch] = useState("")
    const [actionFilter, setActionFilter] = useState("ALL")
    const [entityFilter, setEntityFilter] = useState("ALL")

    const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 })

    const ACTIONS = ["ALL", "LOGIN", "CREATE", "UPDATE", "DELETE", "REGISTER", "ENROLL"]
    const ENTITIES = ["ALL", "USER", "COURSE", "MODULE", "LESSON", "SYSTEM", "LEAD", "PAYMENT"]

    const fetchLogs = useCallback(async (isSilentRefresh = false) => {
        if (!isSilentRefresh) setIsLoading(true)
        setIsRefreshing(true)
        try {
            const params: any = {
                page: pagination.page,
                limit: pagination.limit
            }
            if (search) params.search = search
            if (actionFilter !== "ALL") params.action = actionFilter
            if (entityFilter !== "ALL") params.entityType = entityFilter

            const res = await userApi.getAuditLogs(params)
            
            setLogs(res.data.logs)
            setPagination(res.data.pagination)
        } catch (error) {
            console.error("Failed to fetch audit logs", error)
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }, [search, actionFilter, entityFilter, pagination.page, pagination.limit])

    useEffect(() => {
        fetchLogs()
    }, [fetchLogs])

    const handleRefresh = () => {
        setPagination({ ...pagination, page: 1 })
        fetchLogs(true)
    }

    const getActionBadgeColor = (action: string) => {
        switch (action) {
            case 'LOGIN': return 'bg-green-500 hover:bg-green-600'
            case 'CREATE':
            case 'REGISTER':
            case 'ENROLL': return 'bg-emerald-500 hover:bg-emerald-600'
            case 'UPDATE': return 'bg-blue-500 hover:bg-blue-600'
            case 'DELETE': return 'bg-red-500 hover:bg-red-600'
            default: return 'bg-slate-500 hover:bg-slate-600'
        }
    }

    return (
        <div className="space-y-6 max-h-screen flex flex-col">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <ShieldAlert className="h-8 w-8 text-orange-600" />
                        System Audit Logs
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Global real-time forensics and security monitoring dashboard.
                    </p>
                </div>
                <Button 
                    onClick={handleRefresh} 
                    disabled={isRefreshing}
                    variant="outline"
                    className="gap-2"
                >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Live Refresh
                </Button>
            </div>

            <Card className="flex-1 overflow-hidden flex flex-col shadow-lg border-primary/10">
                <CardHeader className="bg-muted/30 pb-4 border-b">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center gap-2 w-full sm:w-1/3 relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search IP, User ID, Path..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                                onKeyDown={(e) => e.key === 'Enter' && handleRefresh()}
                            />
                        </div>
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <Select value={actionFilter} onValueChange={setActionFilter}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Action" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ACTIONS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Select value={entityFilter} onValueChange={setEntityFilter}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Entity" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ENTITIES.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-auto bg-slate-50/50 dark:bg-slate-900/50">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-[500px]">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[500px] text-muted-foreground">
                            <Activity className="h-16 w-16 mb-4 opacity-20" />
                            <p className="text-xl font-medium">No logs recorded exactly matching criteria</p>
                        </div>
                    ) : (
                        <div className="relative">
                            <Table>
                                <TableHeader className="bg-card sticky top-0 z-10 shadow-sm">
                                    <TableRow>
                                        <TableHead className="w-[180px]">Timestamp</TableHead>
                                        <TableHead>Actor (Performed By)</TableHead>
                                        <TableHead>Action</TableHead>
                                        <TableHead>Target Entity</TableHead>
                                        <TableHead>Network / Route</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.map((log) => (
                                        <TableRow key={log.id} className="hover:bg-muted/50 transition-colors">
                                            <TableCell className="font-mono text-xs whitespace-nowrap text-muted-foreground">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">
                                                        {log.user?.name || 'System Operator'}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {log.user?.email || log.performedBy}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`${getActionBadgeColor(log.action)} text-[10px] tracking-wider uppercase`}>
                                                    {log.action}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-sm">
                                                        {log.entityType}
                                                    </span>
                                                    {log.entityId && (
                                                        <span className="text-[10px] font-mono text-muted-foreground">
                                                            ID: {log.entityId.substring(0, 8)}...
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded w-fit">
                                                        <span className={log.method === 'DELETE' ? 'text-red-500' : log.method === 'POST' ? 'text-green-500' : 'text-blue-500'}>
                                                            {log.method}
                                                        </span> {log.path}
                                                    </span>
                                                    {log.ipAddress && (
                                                        <span className="text-[10px] text-muted-foreground">
                                                            IP: {log.ipAddress}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
                {/* Pagination Footer */}
                <div className="border-t p-4 bg-muted/20 flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                        Showing {(pagination.page - 1) * pagination.limit + 1} to Math.min(pagination.page * pagination.limit, pagination.total) of {pagination.total} entries
                    </p>
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            size="sm"
                            disabled={pagination.page <= 1}
                            onClick={() => setPagination(prev => ({...prev, page: prev.page - 1}))}
                        >
                            Previous
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm"
                            disabled={pagination.page >= pagination.totalPages}
                            onClick={() => setPagination(prev => ({...prev, page: prev.page + 1}))}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    )
}
