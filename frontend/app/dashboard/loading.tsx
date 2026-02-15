export default function DashboardLoading() {
    return (
        <div className="container py-8 space-y-8 animate-pulse">
            <div className="flex justify-between items-center mb-8">
                <div className="space-y-2">
                    <div className="h-10 w-64 bg-muted rounded-xl" />
                    <div className="h-6 w-96 bg-muted rounded-lg" />
                </div>
                <div className="flex gap-3">
                    <div className="h-10 w-32 bg-muted rounded-lg" />
                    <div className="h-10 w-24 bg-muted rounded-lg" />
                </div>
            </div>

            <div className="flex gap-2 mb-8 p-1 bg-muted/30 rounded-xl overflow-hidden">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-10 w-28 bg-muted rounded-lg" />
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 bg-card border border-border rounded-2xl" />
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-80 bg-card border border-border rounded-2xl" />
                <div className="h-80 bg-card border border-border rounded-2xl" />
            </div>
        </div>
    )
}
