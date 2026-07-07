"use client"

import { useState, useEffect } from "react"
import { ShieldCheck, AlertTriangle, Loader2, Download, Trash2, Mail } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import api from "@/lib/api"
import { toast } from "react-hot-toast"

export default function StudentSettingsPage() {
    const [preferences, setPreferences] = useState({ newsletter: false, marketing: false })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/gdpr/preferences')
            .then(res => {
                if (res.data?.data) {
                    setPreferences(res.data.data)
                }
            })
            .catch(err => console.error("Failed to fetch gdpr preferences:", err))
            .finally(() => setLoading(false))
    }, [])

    const handleUpdatePref = async (key: string, val: boolean) => {
        const newPrefs = { ...preferences, [key]: val }
        setPreferences(newPrefs) // Optimistic update
        try {
            await api.post('/gdpr/preferences', { preferences: newPrefs })
            toast.success("Preferences updated successfully")
        } catch (error) {
            setPreferences(preferences) // Revert
            toast.error("Failed to update preferences")
        }
    }

    const requestDeletion = async () => {
        if (!confirm("Are you absolutely sure you want to request account deletion? This will wipe all your data permanently and cannot be undone.")) return;
        
        try {
            await api.post('/gdpr/delete-request')
            toast.success("Account deletion request submitted. Our DPO will contact you shortly.")
        } catch (error) {
            toast.error("Failed to submit deletion request.")
        }
    }

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Privacy & Settings</h1>
                <p className="text-muted-foreground mt-2">Manage your data, communication preferences, and GDPR rights.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-white/10 glass shadow-lg">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Communications</CardTitle>
                                <CardDescription>Manage your email subscriptions</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium">Newsletter</label>
                                <p className="text-xs text-muted-foreground">Receive weekly updates and news.</p>
                            </div>
                            <Switch
                                checked={preferences.newsletter}
                                onCheckedChange={(val) => handleUpdatePref('newsletter', val)}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium">Marketing Emails</label>
                                <p className="text-xs text-muted-foreground">Promotions and special offers.</p>
                            </div>
                            <Switch
                                checked={preferences.marketing}
                                onCheckedChange={(val) => handleUpdatePref('marketing', val)}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-white/10 glass shadow-lg">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Data Rights (GDPR)</CardTitle>
                                <CardDescription>Take control of your personal data</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button variant="outline" className="w-full justify-start gap-3">
                            <Download className="w-4 h-4 text-primary" />
                            Export My Data (JSON)
                        </Button>
                        <Button 
                            variant="destructive" 
                            className="w-full justify-start gap-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20"
                            onClick={requestDeletion}
                        >
                            <Trash2 className="w-4 h-4" />
                            Request Account Deletion
                        </Button>
                    </CardContent>
                    <CardFooter>
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                            <AlertTriangle className="w-3 h-3 text-amber-500" />
                            Deletion requests take up to 30 days to process.
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
