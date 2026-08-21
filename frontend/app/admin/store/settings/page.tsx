"use client"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Settings, Store, Activity } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/api"

export default function StoreSettingsPage() {
    const [isStoreEnabled, setIsStoreEnabled] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get("/shop/admin/settings")
                if (res.data?.data?.settings) {
                    setIsStoreEnabled(res.data.data.settings.isStoreEnabled)
                }
            } catch (error) {
                console.error("Error fetching settings:", error)
                toast.error("Failed to load store settings")
            } finally {
                setIsLoading(false)
            }
        }
        fetchSettings()
    }, [])

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await api.put("/shop/admin/settings", { isStoreEnabled })
            toast.success("Store settings updated successfully!")
            // Optional: trigger a re-render in public navbar if needed
            window.dispatchEvent(new Event('store-settings-changed'))
        } catch (error) {
            console.error("Error saving settings:", error)
            toast.error("Failed to update store settings")
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) return <div className="p-8">Loading settings...</div>

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-sky-500/10 via-emerald-500/10 to-transparent p-6 rounded-2xl border border-sky-500/20">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        <Settings className="w-8 h-8 text-sky-600 dark:text-sky-400" />
                        Store Settings
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Configure global e-commerce and storefront settings.</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="col-span-1 md:col-span-2 border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Store className="w-5 h-5 text-sky-500" />
                            Storefront Visibility
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                            <div className="space-y-1 pr-6">
                                <h3 className="font-medium text-slate-900 dark:text-white">Enable Public Store</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    Toggle the visibility of the "Shop" menu and all storefront pages on the main website. When disabled, customers will see a "Store Closed" message.
                                </p>
                            </div>
                            <Switch
                                checked={isStoreEnabled}
                                onCheckedChange={setIsStoreEnabled}
                                className="data-[state=checked]:bg-emerald-500"
                            />
                        </div>
                        
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <Button 
                                onClick={handleSave} 
                                disabled={isSaving}
                                className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 min-w-[120px]"
                            >
                                {isSaving ? "Saving..." : "Save Settings"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Status Indicator Panel */}
                <Card className="col-span-1 border-slate-200 dark:border-slate-800 shadow-sm h-fit">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-500" />
                            Current Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center p-6 space-y-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isStoreEnabled ? 'bg-emerald-100 dark:bg-emerald-500/20' : 'bg-slate-200 dark:bg-slate-800'}`}>
                                <Store className={`w-8 h-8 ${isStoreEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                            </div>
                            <div className="text-center space-y-1">
                                <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
                                    {isStoreEnabled ? 'Store is Live' : 'Store is Offline'}
                                </h3>
                                <p className="text-sm text-slate-500">
                                    {isStoreEnabled ? 'Customers can view and purchase products.' : 'The store is currently hidden from the public.'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
