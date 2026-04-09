"use client"

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Check, CreditCard, Lock, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import api from '@/lib/api'
import { toast } from 'sonner'

export default function PricingPage() {
    const [_isLoading, setIsLoading] = React.useState(true)
    const [isSaving, setIsSaving] = React.useState(false)
    const [config, setConfig] = React.useState({
        razorpayKeyId: '',
        razorpayKeySecret: '',
        stripePublishableKey: '',
        stripeSecretKey: '',
        activeGateway: 'NONE', // RAZORPAY, STRIPE, NONE
        currency: 'INR'
    })

    React.useEffect(() => {
        fetchConfig()
    }, [])

    const fetchConfig = async () => {
        try {
            const res = await api.get('/payments/config')
            setConfig(res.data)
        } catch (error) {
            console.error("Failed to fetch payment config", error)
            // If 403, maybe not super admin. 
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await api.put('/payments/config', config)
            toast.success("Payment settings updated!")
            fetchConfig() // Refresh to get proper masking if needed
        } catch (error) {
            console.error(error)
            toast.error("Failed to save settings")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Plans & Pricing</h1>
                    <p className="text-muted-foreground">Manage subscriptions and payment gateways.</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Plan
                </Button>
            </div>

            {/* Plans Grid (Visual Only) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['Free Tier', 'Pro Monthly', 'Pro Yearly'].map((plan, i) => (
                    <Card key={plan} className={`relative ${i === 1 ? 'border-purple-500 shadow-lg' : ''}`}>
                        {i === 1 && <Badge className="absolute -top-2 right-4 bg-purple-600">Popular</Badge>}
                        <CardHeader>
                            <CardTitle>{plan}</CardTitle>
                            <CardDescription>Perfect for {i === 0 ? 'starters' : 'learners'}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-3xl font-bold">
                                {i === 0 ? '₹0' : i === 1 ? '₹499' : '₹4999'}
                                <span className="text-sm font-normal text-muted-foreground">/{i === 2 ? 'yr' : 'mo'}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Payment Gateway Configurations */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Payment Gateway Configuration
                    </CardTitle>
                    <CardDescription>
                        Configure API keys for Razorpay and Stripe. Select the active gateway for transactions.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="razorpay" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="razorpay">Razorpay (India)</TabsTrigger>
                            <TabsTrigger value="stripe">Stripe (International)</TabsTrigger>
                        </TabsList>

                        {/* Razorpay Tab */}
                        <TabsContent value="razorpay" className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="razorpayId">Key ID</Label>
                                <Input
                                    id="razorpayId"
                                    value={config.razorpayKeyId || ''}
                                    onChange={e => setConfig({ ...config, razorpayKeyId: e.target.value })}
                                    placeholder="rzp_live_..."
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="razorpaySecret">Key Secret</Label>
                                <div className="relative">
                                    <Input
                                        id="razorpaySecret"
                                        type="password"
                                        value={config.razorpayKeySecret || ''}
                                        onChange={e => setConfig({ ...config, razorpayKeySecret: e.target.value })}
                                        placeholder="Enter secret (masked on save)"
                                        className="pr-10"
                                    />
                                    <Lock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                        </TabsContent>

                        {/* Stripe Tab */}
                        <TabsContent value="stripe" className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="stripeKey">Publishable Key</Label>
                                <Input
                                    id="stripeKey"
                                    value={config.stripePublishableKey || ''}
                                    onChange={e => setConfig({ ...config, stripePublishableKey: e.target.value })}
                                    placeholder="pk_live_..."
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="stripeSecret">Secret Key</Label>
                                <div className="relative">
                                    <Input
                                        id="stripeSecret"
                                        type="password"
                                        value={config.stripeSecretKey || ''}
                                        onChange={e => setConfig({ ...config, stripeSecretKey: e.target.value })}
                                        placeholder="sk_live_..."
                                        className="pr-10"
                                    />
                                    <Lock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* Active Gateway Switcher */}
                    <div className="mt-8 pt-6 border-t">
                        <Label className="text-base font-semibold mb-4 block">Active Gateway</Label>
                        <RadioGroup
                            value={config.activeGateway}
                            onValueChange={(val) => setConfig({ ...config, activeGateway: val })}
                            className="grid grid-cols-1 md:grid-cols-3 gap-4"
                        >
                            <div className={`flex items-center space-x-2 border rounded-lg p-4 cursor-pointer ${config.activeGateway === 'RAZORPAY' ? 'border-purple-500 bg-purple-50' : ''}`}>
                                <RadioGroupItem value="RAZORPAY" id="r_razorpay" />
                                <Label htmlFor="r_razorpay" className="flex-1 cursor-pointer">Razorpay</Label>
                            </div>
                            <div className={`flex items-center space-x-2 border rounded-lg p-4 cursor-pointer ${config.activeGateway === 'STRIPE' ? 'border-purple-500 bg-purple-50' : ''}`}>
                                <RadioGroupItem value="STRIPE" id="r_stripe" />
                                <Label htmlFor="r_stripe" className="flex-1 cursor-pointer">Stripe</Label>
                            </div>
                            <div className={`flex items-center space-x-2 border rounded-lg p-4 cursor-pointer ${config.activeGateway === 'NONE' ? 'border-red-500 bg-red-50' : ''}`}>
                                <RadioGroupItem value="NONE" id="r_none" />
                                <Label htmlFor="r_none" className="flex-1 cursor-pointer text-red-600">Disabled (Maintenance)</Label>
                            </div>
                        </RadioGroup>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/20 border-t flex justify-between items-center py-4">
                    <p className="text-sm text-muted-foreground">
                        Secrets are stored securely and masked for your protection.
                    </p>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Configuration
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
