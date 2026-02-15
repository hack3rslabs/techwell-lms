export default function AdminLoading() {
    return (
        <div className="space-y-8 animate-pulse p-8">
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <div className="h-10 w-64 bg-muted rounded-xl" />
                    <div className="h-5 w-80 bg-muted rounded-lg" />
                </div>
                <div className="flex gap-2">
                    <div className="h-10 w-32 bg-muted rounded-lg" />
                    <div className="h-10 w-40 bg-muted rounded-lg" />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 bg-card border border-border rounded-2xl" />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 h-[500px] bg-card border border-border rounded-2xl" />
                <div className="h-[500px] bg-card border border-border rounded-2xl" />
            </div>
        </div>
    )
}
