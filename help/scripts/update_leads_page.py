import re

with open(r"e:\FinalProjects\techwell-lms\frontend\app\admin\leads\page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add a state for lead counts
counts_state_code = """
    const [leadCounts, setLeadCounts] = React.useState<any>({ totalCount: 0, statusCounts: {} })

    const fetchLeadCounts = React.useCallback(async () => {
        try {
            const res = await leadApi.getCounts()
            if (res.data) {
                setLeadCounts(res.data)
            }
        } catch (error) {
            console.error('Failed to fetch lead counts', error)
        }
    }, [])

    React.useEffect(() => {
        fetchLeadCounts()
        
        const handleRefresh = () => fetchLeadCounts()
        if (typeof window !== 'undefined') {
            window.addEventListener('lead-counts:refresh', handleRefresh)
            return () => window.removeEventListener('lead-counts:refresh', handleRefresh)
        }
    }, [fetchLeadCounts])
"""

# we need to insert the counts state
if "const [leadCounts, setLeadCounts]" not in content:
    content = content.replace("const [isLoading, setIsLoading] = React.useState(true)", "const [isLoading, setIsLoading] = React.useState(true)\n" + counts_state_code)


# Now update the status filter buttons to display counts
old_buttons = """                {[
                    { label: 'Total Leads', value: 'ALL' },
                    { label: 'New', value: 'NEW' },
                    { label: 'Contacted', value: 'CONTACTED' },
                    { label: 'Pending / Interested', value: 'INTERESTED' },
                    { label: 'Qualified', value: 'QUALIFIED' },
                    { label: 'Converted', value: 'CONVERTED' },
                    { label: 'Follow Up', value: 'FOLLOW_UP' },
                    { label: 'Not Interested', value: 'LOST' },
                ].map((status) => ("""

new_buttons = """                {[
                    { label: 'Total Leads', value: 'ALL', count: leadCounts.totalCount || 0 },
                    { label: 'New', value: 'NEW', count: leadCounts.statusCounts?.NEW || 0 },
                    { label: 'Contacted', value: 'CONTACTED', count: leadCounts.statusCounts?.CONTACTED || 0 },
                    { label: 'Pending / Interested', value: 'INTERESTED', count: leadCounts.statusCounts?.INTERESTED || 0 },
                    { label: 'Qualified', value: 'QUALIFIED', count: leadCounts.statusCounts?.QUALIFIED || 0 },
                    { label: 'Converted', value: 'CONVERTED', count: leadCounts.statusCounts?.CONVERTED || 0 },
                    { label: 'Follow Up', value: 'FOLLOW_UP', count: leadCounts.statusCounts?.FOLLOW_UP || 0 },
                    { label: 'Not Interested', value: 'LOST', count: leadCounts.statusCounts?.LOST || 0 },
                ].map((status) => ("""

content = content.replace(old_buttons, new_buttons)

old_button_render = """                        onClick={() => setStatusFilter(status.value)}
                    >
                        {status.label}
                    </Button>"""

new_button_render = """                        onClick={() => setStatusFilter(status.value)}
                    >
                        {status.label} {status.count > 0 && `(${status.count})`}
                    </Button>"""

content = content.replace(old_button_render, new_button_render)

with open(r"e:\FinalProjects\techwell-lms\frontend\app\admin\leads\page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Updated leads page with counts.")
