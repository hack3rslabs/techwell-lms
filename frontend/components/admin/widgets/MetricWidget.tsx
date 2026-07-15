import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

export interface MetricWidgetProps {
    id: string
    title: string
    value: string | number
    icon: LucideIcon
    colorScheme: 'emerald' | 'red' | 'blue' | 'yellow' | 'orange' | 'sky' | 'purple' | 'indigo' | 'rose' | 'green' | 'cyan' | 'slate'
    subtitle?: string
    trend?: {
        value: string
        icon: LucideIcon
    }
    onClick?: () => void
    className?: string
}

const colorMaps = {
    emerald: {
        bg: 'from-emerald-500/5 to-teal-500/5',
        iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
        iconBorder: 'border-emerald-200/50 dark:border-emerald-800/50',
        text: 'text-emerald-600 dark:text-emerald-400',
        badgeBg: 'bg-emerald-50 dark:bg-emerald-500/10',
        badgeBorder: 'border-emerald-100 dark:border-emerald-800',
    },
    red: {
        bg: 'from-red-500/5 to-rose-500/5',
        iconBg: 'bg-red-100 dark:bg-red-900/30',
        iconBorder: 'border-red-200/50 dark:border-red-800/50',
        text: 'text-red-600 dark:text-red-400',
        badgeBg: 'bg-red-50 dark:bg-red-500/10',
        badgeBorder: 'border-red-100 dark:border-red-800',
    },
    blue: {
        bg: 'from-blue-500/5 to-indigo-500/5',
        iconBg: 'bg-blue-100 dark:bg-blue-900/30',
        iconBorder: 'border-blue-200/50 dark:border-blue-800/50',
        text: 'text-blue-600 dark:text-blue-400',
        badgeBg: 'bg-blue-50 dark:bg-blue-500/10',
        badgeBorder: 'border-blue-100 dark:border-blue-800',
    },
    yellow: {
        bg: 'from-yellow-500/5 to-amber-500/5',
        iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
        iconBorder: 'border-yellow-200/50 dark:border-yellow-800/50',
        text: 'text-yellow-600 dark:text-yellow-400',
        badgeBg: 'bg-yellow-50 dark:bg-yellow-500/10',
        badgeBorder: 'border-yellow-100 dark:border-yellow-800',
    },
    orange: {
        bg: 'from-orange-500/5 to-amber-500/5',
        iconBg: 'bg-orange-100 dark:bg-orange-900/30',
        iconBorder: 'border-orange-200/50 dark:border-orange-800/50',
        text: 'text-orange-600 dark:text-orange-400',
        badgeBg: 'bg-orange-50 dark:bg-orange-500/10',
        badgeBorder: 'border-orange-100 dark:border-orange-800',
    },
    sky: {
        bg: 'from-sky-500/5 to-blue-500/5',
        iconBg: 'bg-sky-100 dark:bg-sky-900/30',
        iconBorder: 'border-sky-200/50 dark:border-sky-800/50',
        text: 'text-sky-600 dark:text-sky-400',
        badgeBg: 'bg-sky-50 dark:bg-sky-500/10',
        badgeBorder: 'border-sky-100 dark:border-sky-800',
    },
    purple: {
        bg: 'from-purple-500/5 to-pink-500/5',
        iconBg: 'bg-purple-100 dark:bg-purple-900/30',
        iconBorder: 'border-purple-200/50 dark:border-purple-800/50',
        text: 'text-purple-600 dark:text-purple-400',
        badgeBg: 'bg-purple-50 dark:bg-purple-500/10',
        badgeBorder: 'border-purple-100 dark:border-purple-800',
    },
    indigo: {
        bg: 'from-indigo-500/5 to-cyan-500/5',
        iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
        iconBorder: 'border-indigo-200/50 dark:border-indigo-800/50',
        text: 'text-indigo-600 dark:text-indigo-400',
        badgeBg: 'bg-indigo-50 dark:bg-indigo-500/10',
        badgeBorder: 'border-indigo-100 dark:border-indigo-800',
    },
    rose: {
        bg: 'from-rose-500/5 to-red-500/5',
        iconBg: 'bg-rose-100 dark:bg-rose-900/30',
        iconBorder: 'border-rose-200/50 dark:border-rose-800/50',
        text: 'text-rose-600 dark:text-rose-400',
        badgeBg: 'bg-rose-50 dark:bg-rose-500/10',
        badgeBorder: 'border-rose-100 dark:border-rose-800',
    },
    green: {
        bg: 'from-green-500/5 to-emerald-500/5',
        iconBg: 'bg-green-100 dark:bg-green-900/30',
        iconBorder: 'border-green-200/50 dark:border-green-800/50',
        text: 'text-green-600 dark:text-green-400',
        badgeBg: 'bg-green-50 dark:bg-green-500/10',
        badgeBorder: 'border-green-100 dark:border-green-800',
    },
    cyan: {
        bg: 'from-cyan-500/5 to-teal-500/5',
        iconBg: 'bg-cyan-100 dark:bg-cyan-900/30',
        iconBorder: 'border-cyan-200/50 dark:border-cyan-800/50',
        text: 'text-cyan-600 dark:text-cyan-400',
        badgeBg: 'bg-cyan-50 dark:bg-cyan-500/10',
        badgeBorder: 'border-cyan-100 dark:border-cyan-800',
    },
    slate: {
        bg: 'from-slate-500/5 to-slate-400/5',
        iconBg: 'bg-slate-100 dark:bg-slate-800/30',
        iconBorder: 'border-slate-200/50 dark:border-slate-700/50',
        text: 'text-slate-600 dark:text-slate-400',
        badgeBg: 'bg-slate-50 dark:bg-slate-800/10',
        badgeBorder: 'border-slate-200 dark:border-slate-700',
    }
}

export function MetricWidget({ title, value, icon: Icon, colorScheme, subtitle, trend, onClick, className = '' }: MetricWidgetProps) {
    const colors = colorMaps[colorScheme]

    return (
        <Card
            className={`cursor-pointer group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-500 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 h-full ${className}`}
            onClick={onClick}
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                <CardTitle className="text-sm font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                    {title}
                </CardTitle>
                <div className={`h-8 w-8 rounded-lg ${colors.iconBg} border ${colors.iconBorder} flex items-center justify-center ${colors.text} font-bold shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                    <Icon className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent className="relative z-10 mt-2">
                <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</div>
                {(subtitle || trend) && (
                    <div className={`flex items-center gap-1.5 mt-2 text-xs font-medium ${trend ? colors.text : 'text-slate-500 dark:text-slate-400'} ${trend ? colors.badgeBg : 'bg-slate-100 dark:bg-slate-800'} w-fit px-2 py-1 rounded-full border ${trend ? colors.badgeBorder : 'border-slate-200 dark:border-slate-700'}`}>
                        {trend && trend.icon && <trend.icon className="h-3 w-3" />}
                        <span>{trend ? trend.value : subtitle}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
