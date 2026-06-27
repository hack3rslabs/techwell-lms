'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, AlertCircle, Activity, Clock, ShieldCheck, Settings, Monitor, BookOpen, Star, FileText } from 'lucide-react'
import api from '@/lib/api'

interface AuditLog {
    id: string
    action: string
    entityType: string
    entityId: string
    details: any
    ipAddress: string
    userAgent: string
    timestamp: string
}

export function StudentLogs() {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await api.get('/users/my-logs')
                setLogs(response.data.data || [])
            } catch (err) {
                setError('Failed to load activity logs. Please try again later.')
            } finally {
                setLoading(false)
            }
        }
        fetchLogs()
    }, [])

    const getLogIcon = (action: string, entityType: string) => {
        const act = action.toUpperCase()
        const ent = entityType.toUpperCase()

        if (act.includes('LOGIN') || act.includes('LOGOUT') || ent === 'AUTH') return <ShieldCheck className="w-4 h-4 text-emerald-500" />
        if (act.includes('UPDATE') || ent === 'PROFILE') return <Settings className="w-4 h-4 text-blue-500" />
        if (ent === 'COURSE' || ent === 'LESSON') return <BookOpen className="w-4 h-4 text-purple-500" />
        if (ent === 'PAYMENT' || ent === 'ORDER') return <Star className="w-4 h-4 text-yellow-500" />
        if (ent === 'APPLICATION' || ent === 'RESUME') return <FileText className="w-4 h-4 text-pink-500" />
        
        return <Monitor className="w-4 h-4 text-slate-500" />
    }

    const formatAction = (action: string) => {
        return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }

    return (
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 border-border">
            <CardHeader className="bg-muted/30 border-b border-border pb-6">
                <CardTitle className="text-2xl flex items-center gap-2">
                    <Activity className="w-6 h-6 text-primary" />
                    Activity Logs
                </CardTitle>
                <CardDescription>
                    A detailed history of your actions, logins, and progress on the platform.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                {error ? (
                    <div className="text-center py-12 px-4">
                        <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-3 opacity-50" />
                        <p className="text-destructive font-medium">{error}</p>
                    </div>
                ) : loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-16 px-4">
                        <Activity className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground font-medium text-lg">No activity recorded yet</p>
                        <p className="text-muted-foreground/70 text-sm mt-1">Your recent actions will appear here automatically.</p>
                    </div>
                ) : (
                    <div className="relative border-l border-border ml-6 md:ml-8 my-8 pb-4">
                        {logs.map((log, index) => (
                            <div key={log.id} className="mb-8 ml-6 md:ml-8 group">
                                <span className="absolute flex items-center justify-center w-8 h-8 rounded-full -left-4 ring-4 ring-card bg-muted border border-border group-hover:scale-110 transition-transform duration-200">
                                    {getLogIcon(log.action, log.entityType)}
                                </span>
                                <div className="p-4 bg-muted/20 border border-border rounded-lg shadow-sm hover:shadow-md hover:bg-muted/30 transition-all">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                                            {formatAction(log.action)}
                                        </h3>
                                        <time className="text-xs font-medium flex items-center gap-1 text-muted-foreground bg-background px-2 py-1 rounded-md border border-border">
                                            <Clock className="w-3 h-3" />
                                            {new Date(log.timestamp).toLocaleString('en-US', {
                                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </time>
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-2 flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-foreground/80 text-xs uppercase tracking-wider">Entity:</span> 
                                            <Badge variant="secondary" className="text-xs font-mono">{log.entityType}</Badge>
                                        </div>
                                        {log.ipAddress && (
                                            <div className="text-xs text-muted-foreground/70 mt-1">
                                                From IP: <span className="font-mono">{log.ipAddress}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
