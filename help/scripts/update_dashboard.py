import re

with open(r"e:\FinalProjects\techwell-lms\frontend\app\admin\page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update visibleWidgets to include all CMDB features
old_visible_widgets = """    const [visibleWidgets, setVisibleWidgets] = React.useState({
        revenue: true,
        pendingFees: true,
        users: true,
        franchises: true,
        enrollments: true,
        certificates: true,
        leads: true,
        campusDrives: true,
        tasks: true,
        projects: true,
        support: true,
    })"""

new_visible_widgets = """    const [visibleWidgets, setVisibleWidgets] = React.useState({
        revenue: true,
        upcomingFees: true,
        users: true,
        franchises: true,
        enrollments: true,
        certificates: true,
        leads: true,
        campusDrives: true,
        tasks: true,
        projects: true,
        support: true,
        events: true,
        marketing: true,
        liveClasses: true,
        aiTraining: true,
    })"""

content = content.replace(old_visible_widgets, new_visible_widgets)

# 2. Add an Upcoming Fees widget card
upcoming_fees_card = """
                        {visibleWidgets.upcomingFees && hasPermission('FINANCE') && (
                            <Card
                                className="cursor-pointer group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-500 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1"
                                onClick={() => router.push('/admin/finance')}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                                    <CardTitle className="text-sm font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                                        Upcoming EMIs
                                    </CardTitle>
                                    <div className="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-200/50 dark:border-red-800/50 flex items-center justify-center text-red-600 dark:text-red-400 font-bold shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3">
                                        <Calendar className="h-4 w-4" />
                                    </div>
                                </CardHeader>
                                <CardContent className="relative z-10 mt-2">
                                    <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{(stats as any).upcomingFeesCount || 0}</div>
                                    <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 w-fit px-2 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                                        <span>Pending Installments</span>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
"""

# Insert the Upcoming EMIs card right after the revenue card if it's not already there
if "Upcoming EMIs" not in content:
    content = content.replace('</Card>\n                        )}', '</Card>\n                        )}\n' + upcoming_fees_card, 1)

# 3. Fix side scroll bug on dashboard container
# Look for <div className="space-y-8"> which is the outermost wrapper usually in page.tsx and add overflow-x-hidden
content = content.replace('<div className="space-y-8">', '<div className="space-y-8 overflow-x-hidden w-full max-w-full">')

with open(r"e:\FinalProjects\techwell-lms\frontend\app\admin\page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Updated dashboard page.")
