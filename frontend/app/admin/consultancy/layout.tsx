import Link from "next/link"
import { LayoutDashboard, Mail, Users, FileText, Activity, ArchiveX } from "lucide-react"

const consultancyNav = [
    { name: "Dashboard", href: "/admin/consultancy", icon: LayoutDashboard },
    { name: "Candidate Invitations", href: "/admin/consultancy/invitations", icon: Mail },
    { name: "Candidates", href: "/admin/consultancy/candidates", icon: Users },
    { name: "Candidate Agreements", href: "/admin/consultancy/agreements", icon: FileText },
    { name: "Processing", href: "/admin/consultancy/processing", icon: Activity },
    { name: "Closed", href: "/admin/consultancy/closed", icon: ArchiveX },
]

export default function ConsultancyLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-6 w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Consultancy</h1>
                    <p className="text-muted-foreground mt-1">Manage private invitations and candidate placements.</p>
                </div>
            </div>
            
            <div className="flex gap-1 overflow-x-auto border-b pb-px">
                {consultancyNav.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 border-transparent hover:text-primary transition-colors whitespace-nowrap"
                    >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                    </Link>
                ))}
            </div>

            <div className="w-full">
                {children}
            </div>
        </div>
    )
}
