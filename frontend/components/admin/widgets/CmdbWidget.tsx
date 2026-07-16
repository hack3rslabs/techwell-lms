import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Server, Laptop, Shield } from 'lucide-react'

export function CmdbWidget() {
    return (
        <Card className="h-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="pb-2 relative z-10">
                <CardTitle className="text-sm font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase flex items-center gap-2">
                    <Server className="h-4 w-4 text-indigo-500" />
                    CMDB Status
                </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
                <div className="space-y-3 mt-2">
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <Laptop className="h-4 w-4 text-slate-400" />
                            Active Devices
                        </div>
                        <span className="font-bold">42</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <Server className="h-4 w-4 text-slate-400" />
                            Servers
                        </div>
                        <span className="font-bold">8</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <Shield className="h-4 w-4 text-slate-400" />
                            Software Licenses
                        </div>
                        <span className="font-bold">115</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

