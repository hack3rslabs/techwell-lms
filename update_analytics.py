import re

with open(r"e:\FinalProjects\techwell-lms\frontend\app\admin\analytics\page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

if "ComposedChart" not in content:
    content = content.replace("AreaChart, Area", "AreaChart, Area, ComposedChart, Line")

mock_data_logic = """
    // --- Mock Data for Stock-market style charts ---
    const financialData = [
        { name: 'Jan', income: 4000, expenses: 2400, goal: 5000, estimated: 4500 },
        { name: 'Feb', income: 3000, expenses: 1398, goal: 5000, estimated: 3200 },
        { name: 'Mar', income: 2000, expenses: 9800, goal: 5000, estimated: 2500 },
        { name: 'Apr', income: 2780, expenses: 3908, goal: 5000, estimated: 3000 },
        { name: 'May', income: 1890, expenses: 4800, goal: 5000, estimated: 2000 },
        { name: 'Jun', income: 2390, expenses: 3800, goal: 5000, estimated: 2500 },
        { name: 'Jul', income: 3490, expenses: 4300, goal: 5000, estimated: 3600 },
    ];
    
    if (data?.summary?.totalRevenue) {
        financialData[6].income = data.summary.totalRevenue / 10;
        financialData[6].estimated = (data.summary.totalRevenue / 10) * 1.2;
    }

    const conversionData = [
        { name: 'Week 1', contacted: 40, followUp: 24, converted: 10 },
        { name: 'Week 2', contacted: 30, followUp: 13, converted: 8 },
        { name: 'Week 3', contacted: 20, followUp: 38, converted: 15 },
        { name: 'Week 4', contacted: 27, followUp: 19, converted: 12 },
    ];
"""

content = content.replace("return (", mock_data_logic + "\n    return (")

new_charts = """
            {/* Business Growth & Finance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Financial Performance (Income vs Expenses)</CardTitle>
                        <CardDescription>Stock-market style view of cash flow and goals</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={financialData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px' }} />
                                <Legend />
                                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
                                <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
                                <Line type="monotone" dataKey="goal" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" name="Goal" />
                                <Line type="monotone" dataKey="estimated" stroke="#3b82f6" strokeWidth={3} name="Estimated Rev." />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Lead Conversion & Follow-up Rate</CardTitle>
                        <CardDescription>Pipeline efficiency over time</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={conversionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px' }} />
                                <Legend />
                                <Bar dataKey="contacted" fill="#8884d8" radius={[4, 4, 0, 0]} name="Contacted" />
                                <Area type="monotone" dataKey="followUp" fill="#ffc658" stroke="#ffc658" fillOpacity={0.3} name="Follow Up" />
                                <Line type="monotone" dataKey="converted" stroke="#10b981" strokeWidth={3} name="Converted" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
"""

content = content.replace("            <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6\">", new_charts + "\n            <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6\">")

with open(r"e:\FinalProjects\techwell-lms\frontend\app\admin\analytics\page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Analytics Updated!")
