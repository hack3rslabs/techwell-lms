import * as React from 'react'
import { MetricWidget } from './MetricWidget'
import { CmdbWidget } from './CmdbWidget'
import { 
    IndianRupee, 
    Calendar, 
    Users, 
    Building2, 
    GraduationCap, 
    Magnet, 
    CheckSquare, 
    BrainCircuit, 
    LifeBuoy,
    TrendingUp
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export type WidgetId = 
    | 'revenue'
    | 'upcomingFees'
    | 'users'
    | 'franchises'
    | 'enrollments'
    | 'certificates'
    | 'leads'
    | 'campusDrives'
    | 'activeTasks'
    | 'consulting'
    | 'supportTickets'
    | 'cmdb'

export const DEFAULT_LAYOUT: WidgetId[] = [
    'revenue',
    'upcomingFees',
    'users',
    'franchises',
    'enrollments',
    'certificates',
    'leads',
    'campusDrives',
    'activeTasks',
    'consulting',
    'supportTickets',
    'cmdb'
]

interface WidgetRegistryProps {
    id: WidgetId
    stats: any
}

export function WidgetRenderer({ id, stats }: WidgetRegistryProps) {
    const router = useRouter()

    switch (id) {
        case 'revenue':
            return (
                <MetricWidget 
                    id="revenue"
                    title="Total Revenue"
                    value={`₹${(stats.revenue || 0).toLocaleString()}`}
                    icon={IndianRupee}
                    colorScheme="emerald"
                    trend={{ value: "+20.1% from last month", icon: TrendingUp }}
                    onClick={() => router.push('/admin/finance')}
                />
            )
        case 'upcomingFees':
            return (
                <MetricWidget 
                    id="upcomingFees"
                    title="Upcoming EMIs"
                    value={stats.upcomingFeesCount || 0}
                    icon={Calendar}
                    colorScheme="red"
                    subtitle="Pending Installments"
                    onClick={() => router.push('/admin/finance')}
                />
            )
        case 'users':
            return (
                <MetricWidget 
                    id="users"
                    title="Total Users"
                    value={stats.users || 0}
                    icon={Users}
                    colorScheme="blue"
                    subtitle="Platform users"
                    onClick={() => router.push('/admin/roles')}
                />
            )
        case 'franchises':
            return (
                <MetricWidget 
                    id="franchises"
                    title="Total Franchises"
                    value={stats.franchises || 0}
                    icon={Building2}
                    colorScheme="yellow"
                    subtitle="Active Partners"
                    onClick={() => router.push('/admin/franchise')}
                />
            )
        case 'enrollments':
            return (
                <MetricWidget 
                    id="enrollments"
                    title="Enrollments"
                    value={stats.enrollments || 0}
                    icon={GraduationCap}
                    colorScheme="orange"
                    subtitle={`${stats.courses || 0} active courses`}
                    onClick={() => router.push('/admin/courses')}
                />
            )
        case 'certificates':
            return (
                <MetricWidget 
                    id="certificates"
                    title="Certificates Issued"
                    value={stats.certificates || 0}
                    icon={GraduationCap}
                    colorScheme="sky"
                    subtitle="Total verified"
                    onClick={() => router.push('/admin/certificates')}
                />
            )
        case 'leads':
            return (
                <MetricWidget 
                    id="leads"
                    title="CRM Leads"
                    value={stats.leads || 0}
                    icon={Magnet}
                    colorScheme="purple"
                    subtitle="Active prospects"
                    onClick={() => router.push('/admin/leads')}
                />
            )
        case 'campusDrives':
            return (
                <MetricWidget 
                    id="campusDrives"
                    title="Campus Drives"
                    value={stats.campusDrives || 0}
                    icon={Building2}
                    colorScheme="indigo"
                    subtitle="Ongoing hiring"
                    onClick={() => router.push('/admin/campus-drives')}
                />
            )
        case 'activeTasks':
            return (
                <MetricWidget 
                    id="activeTasks"
                    title="Active Tasks"
                    value={stats.activeTasks || 0}
                    icon={CheckSquare}
                    colorScheme="rose"
                    subtitle="Pending action"
                    onClick={() => router.push('/admin/tasks')}
                />
            )
        case 'consulting':
            return (
                <MetricWidget 
                    id="consulting"
                    title="Consulting Projects"
                    value={stats.activeProjects || 0}
                    icon={BrainCircuit}
                    colorScheme="green"
                    subtitle="Active consulting"
                    onClick={() => router.push('/admin/consulting')}
                />
            )
        case 'supportTickets':
            return (
                <MetricWidget 
                    id="supportTickets"
                    title="Open Support Tickets"
                    value={stats.activeTickets || 0}
                    icon={LifeBuoy}
                    colorScheme="cyan"
                    subtitle="Requires attention"
                    onClick={() => router.push('/admin/support')}
                />
            )
        case 'cmdb':
            return <CmdbWidget />
        default:
            return null
    }
}
