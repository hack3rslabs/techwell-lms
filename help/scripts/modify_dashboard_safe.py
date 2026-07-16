import re

with open(r"e:\FinalProjects\techwell-lms\frontend\app\admin\page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add new imports
if "from '@/components/ui/input'" not in content:
    imports_to_add = """import { Input } from '@/components/ui/input'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Search, Settings } from 'lucide-react'
"""
    content = content.replace("import { Button } from '@/components/ui/button'", imports_to_add + "import { Button } from '@/components/ui/button'")

# 2. Add visibleWidgets state
state_code = """
    const [visibleWidgets, setVisibleWidgets] = React.useState({
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
    })
"""
if "const [visibleWidgets, setVisibleWidgets]" not in content:
    content = content.replace("const [isLoading, setIsLoading] = React.useState(true)", "const [isLoading, setIsLoading] = React.useState(true)\n" + state_code)

# 3. Modify the header area to include the search and widget toggles
header_original = """<div className="flex items-center gap-2">
                    {/* Institute Switcher for Super Admin */}
                    {user?.role === 'SUPER_ADMIN' && <InstituteSwitcher />}

                    {/* Placeholder for DateRangePicker */}
                    <Button variant="outline">Last 30 Days</Button>
                    <AdminReportModal>
                        <Button>
                            <BarChart3 className="mr-2 h-4 w-4" /> Generate Report
                        </Button>
                    </AdminReportModal>
                </div>"""

header_new = """<div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search CMDB..."
                            className="pl-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                        />
                    </div>
                    
                    <div className="flex items-center gap-2 w-full md:w-auto justify-between">
                        {user?.role === 'SUPER_ADMIN' && <InstituteSwitcher />}
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Settings className="mr-2 h-4 w-4" /> Widgets
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                {Object.keys(visibleWidgets).map((key) => (
                                    <DropdownMenuCheckboxItem
                                        key={key}
                                        checked={visibleWidgets[key as keyof typeof visibleWidgets]}
                                        onCheckedChange={(checked) => setVisibleWidgets(prev => ({...prev, [key]: checked}))}
                                        className="capitalize"
                                    >
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <AdminReportModal>
                            <Button size="sm">
                                <BarChart3 className="mr-2 h-4 w-4" /> Report
                            </Button>
                        </AdminReportModal>
                    </div>
                </div>"""

content = content.replace(header_original, header_new)

# 4. Modify the Cards to be compact and CMDB styled
# Replace large flares
content = re.sub(r'<div className="absolute -right-6 -top-6 h-32 w-32 rounded-full[^>]+/>\n\s*', '', content)
# Replace rounded-3xl with rounded-xl and remove some shadows
content = content.replace('rounded-3xl border border-slate-200/60 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]', 'rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm')
# Replace text-3xl font-black with text-2xl font-bold
content = content.replace('text-3xl font-black', 'text-2xl font-bold')
# Replace h-10 w-10 icons with h-8 w-8
content = content.replace('h-10 w-10 rounded-2xl', 'h-8 w-8 rounded-lg')

# 5. Wrap cards with conditionally rendered blocks
# Use a non-greedy match that does NOT cross another <Card tag.
# We can do this by splitting on <Card and then modifying segments.
# Wait, let's just do a string replace of the condition inside the fragment instead of regex to avoid crossing boundaries.
# For each card, we can replace the return of the card with a wrapped card.
# A simpler way is to find the opening `<Card` tag and the closing `</Card>` tag for each specific title.

import re

mappings = [
    ("Total Revenue", "revenue"),
    ("Pending Fees", "pendingFees"),
    ("Total Users", "users"),
    ("Total Franchises", "franchises"),
    ("Enrollments", "enrollments"),
    ("Certificates Issued", "certificates"),
    ("CRM Leads", "leads"),
    ("Campus Drives", "campusDrives"),
    ("Active Tasks", "tasks"),
    ("Consulting Projects", "projects"),
    ("Open Support Tickets", "support")
]

# We will iterate through the content and find each card block
# A card block starts with <Card and ends with </Card>
# We can split the content by <Card and then re-join it.

blocks = content.split('<Card\n')
new_blocks = [blocks[0]] # The first block is everything before the first <Card

for block in blocks[1:]:
    card_html = '<Card\n' + block
    
    # Check if this card contains any of our titles
    matched_key = None
    for title, key in mappings:
        if f">{title}<" in card_html or f">{title}\n" in card_html or f">{title} " in card_html:
            matched_key = key
            break
            
    if matched_key:
        # Wrap it safely. Note that some cards are inside {hasPermission('...') && ( <Card... /> )}
        # Wrapping a <Card> with {visibleWidgets.key && (<Card>)} inside another JSX expression like {hasPermission() && (<Card>)} 
        # is invalid unless we use a fragment. But {hasPermission() && visibleWidgets.key ? <Card> : null} would be better.
        # However, to be safe, we can just use React fragments or simply replace `<Card` with `{visibleWidgets.key && <Card` and add `}` after `</Card>`.
        # Wait! If it's already inside `{hasPermission('FINANCE') && (`, the wrapping `{visibleWidgets.xyz && (` will be treated as an object literal if not placed correctly!
        
        # Actually, let's just add `style={{ display: visibleWidgets.key ? 'block' : 'none' }}` to the Card component.
        # This is MUCH safer and avoids breaking JSX nesting.
        
        card_html = card_html.replace('<Card\n', f'<Card\n                                style={{{{ display: visibleWidgets.{matched_key} ? "block" : "none" }}}}\n')
        
    new_blocks.append(card_html)
    
content = "".join(new_blocks)

with open(r"e:\FinalProjects\techwell-lms\frontend\app\admin\page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Modifications done safely using style.display!")
