"use client"

import { useState, useEffect } from "react"
import { storeApi } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle2, GraduationCap, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CheckoutPage() {
    const { user } = useAuth()
    const [cart, setCart] = useState<any>(null)
    const [addresses, setAddresses] = useState<any[]>([])
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isPlacingOrder, setIsPlacingOrder] = useState(false)
    const [orderSuccess, setOrderSuccess] = useState(false)
    const [applyStudentDiscount, setApplyStudentDiscount] = useState(false)
    const router = useRouter()

    const [newAddress, setNewAddress] = useState({
        fullName: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "India"
    })
    const [showNewAddressForm, setShowNewAddressForm] = useState(false)

    useEffect(() => {
        const fetchCheckoutData = async () => {
            try {
                const [cartRes, addrRes] = await Promise.all([
                    storeApi.getCart(),
                    storeApi.getAddresses()
                ])
                
                const fetchedCart = cartRes.data?.data?.cart
                if (!fetchedCart || !fetchedCart.items || fetchedCart.items.length === 0) {
                    toast.error("Your cart is empty")
                    router.push('/shop')
                    return
                }
                
                setCart(fetchedCart)
                const fetchedAddresses = addrRes.data?.data?.addresses || []
                setAddresses(fetchedAddresses)
                if (fetchedAddresses.length > 0) {
                    setSelectedAddressId(fetchedAddresses[0].id)
                } else {
                    setShowNewAddressForm(true)
                }

                // Check basic student eligibility based on auth user
                if (user && user.role === 'STUDENT') {
                    setApplyStudentDiscount(true)
                }
            } catch (error) {
                console.error("Failed to fetch checkout data:", error)
                toast.error("Please login to checkout.")
                router.push('/login?redirect=/shop/checkout')
            } finally {
                setIsLoading(false)
            }
        }
        fetchCheckoutData()
    }, [router, user])

    const handleSaveAddress = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await storeApi.addAddress(newAddress)
            const addedAddress = res.data.data.address
            setAddresses([...addresses, addedAddress])
            setSelectedAddressId(addedAddress.id)
            setShowNewAddressForm(false)
            toast.success("Address saved successfully")
        } catch (error) {
            toast.error("Failed to save address")
        }
    }

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            toast.error("Please select a shipping address")
            return
        }

        setIsPlacingOrder(true)
        try {
            await storeApi.createOrder(selectedAddressId, 'COD', applyStudentDiscount)
            setOrderSuccess(true)
            window.dispatchEvent(new Event('cartUpdated'))
        } catch (error) {
            toast.error("Failed to place order")
        } finally {
            setIsPlacingOrder(false)
        }
    }

    if (isLoading) {
        return <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">Loading secure checkout...</div>
    }

    if (orderSuccess) {
        return (
            <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <div className="bg-white dark:bg-zinc-900 p-10 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center max-w-md w-full shadow-lg">
                    <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
                    <h1 className="text-3xl font-extrabold tracking-tight mb-4 text-zinc-900 dark:text-zinc-50">Order Placed!</h1>
                    <p className="text-muted-foreground mb-8">
                        Thank you for your purchase. Your Techwell Shop order has been received and is being processed.
                    </p>
                    <div className="flex flex-col gap-4">
                        <Button asChild size="lg" className="w-full">
                            <Link href="/shop/orders">Track My Order</Link>
                        </Button>
                        <Button variant="outline" asChild size="lg" className="w-full">
                            <Link href="/shop">Continue Shopping</Link>
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    let subtotal = 0
    let discountAmount = 0

    cart?.items?.forEach((item: any) => {
        const basePrice = item.product.discountPrice || item.product.price
        let finalPrice = basePrice

        if (applyStudentDiscount && item.product.studentDiscount) {
            if (item.product.studentDiscountType === 'FIXED') {
                finalPrice = Math.max(0, basePrice - item.product.studentDiscount)
            } else if (item.product.studentDiscountType === 'PERCENTAGE') {
                finalPrice = basePrice - (basePrice * (item.product.studentDiscount / 100))
            }
        }
        
        subtotal += (basePrice * item.quantity)
        discountAmount += ((basePrice - finalPrice) * item.quantity)
    })

    const finalTotal = subtotal - discountAmount

    return (
        <div className="min-h-screen pt-8 pb-20 bg-zinc-50 dark:bg-zinc-950">
            <div className="container mx-auto px-4 md:px-6 max-w-6xl">
                
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/shop/cart" className="p-2 bg-white dark:bg-zinc-900 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Secure Checkout
                    </h1>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Left Column: Shipping & Payment */}
                    <div className="w-full lg:w-2/3 space-y-6">
                        
                        {/* Student Verification */}
                        <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <GraduationCap className="w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-bold">Techwell Student Offer</h2>
                            </div>
                            
                            {user && user.role === 'STUDENT' ? (
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
                                    <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-green-800 dark:text-green-300">Student Verified!</h3>
                                        <p className="text-sm text-green-700 dark:text-green-400 mt-1">Your Techwell Student account is verified. Eligible student discounts have been automatically applied to your cart.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg">
                                    <p className="text-sm text-muted-foreground mb-4">You are not logged in as a verified Techwell Student. Student exclusive offers will not be applied.</p>
                                    <Button variant="outline" size="sm" onClick={() => toast.info("To verify, log in with an enrolled Techwell Student account.")}>
                                        Verify Student ID
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm">1</span> 
                                Shipping Address
                            </h2>
                            
                            {addresses.length > 0 && !showNewAddressForm && (
                                <div className="space-y-4 mb-6">
                                    {addresses.map(addr => (
                                        <div 
                                            key={addr.id} 
                                            className={`p-4 border rounded-xl cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20' : 'border-zinc-200 dark:border-zinc-800 hover:border-primary/40'}`}
                                            onClick={() => setSelectedAddressId(addr.id)}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${selectedAddressId === addr.id ? 'border-primary' : 'border-zinc-400'}`}>
                                                    {selectedAddressId === addr.id && <div className="w-3 h-3 rounded-full bg-primary" />}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-base">{addr.fullName}</p>
                                                    <p className="text-sm text-muted-foreground mt-1">{addr.street}, {addr.city}</p>
                                                    <p className="text-sm text-muted-foreground">{addr.state} {addr.zipCode}, {addr.country}</p>
                                                    <p className="text-sm font-medium mt-2">Mobile: {addr.phone}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <Button variant="outline" className="w-full border-dashed" onClick={() => setShowNewAddressForm(true)}>+ Add New Delivery Address</Button>
                                </div>
                            )}

                            {showNewAddressForm && (
                                <form onSubmit={handleSaveAddress} className="space-y-5 bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <Label>Full Name</Label>
                                            <Input required value={newAddress.fullName} onChange={e => setNewAddress({...newAddress, fullName: e.target.value})} placeholder="Jane Doe" className="bg-white dark:bg-zinc-950" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Phone Number</Label>
                                            <Input required value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} placeholder="+91 9876543210" className="bg-white dark:bg-zinc-950" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Street Address</Label>
                                        <Input required value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} placeholder="House/Flat No., Building Name, Street" className="bg-white dark:bg-zinc-950" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <Label>City</Label>
                                            <Input required value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} placeholder="Bangalore" className="bg-white dark:bg-zinc-950" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>State</Label>
                                            <Input required value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} placeholder="Karnataka" className="bg-white dark:bg-zinc-950" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <Label>PIN Code</Label>
                                            <Input required value={newAddress.zipCode} onChange={e => setNewAddress({...newAddress, zipCode: e.target.value})} placeholder="560001" className="bg-white dark:bg-zinc-950" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Country</Label>
                                            <Input required value={newAddress.country} onChange={e => setNewAddress({...newAddress, country: e.target.value})} className="bg-white dark:bg-zinc-950" />
                                        </div>
                                    </div>
                                    <div className="flex gap-4 pt-4">
                                        <Button type="submit" className="px-8">Save Address</Button>
                                        {addresses.length > 0 && (
                                            <Button type="button" variant="ghost" onClick={() => setShowNewAddressForm(false)}>Cancel</Button>
                                        )}
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm">2</span> 
                                Payment Options
                            </h2>
                            <div className="p-5 border-2 border-primary bg-primary/5 rounded-xl flex items-center gap-4 cursor-pointer">
                                <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
                                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                                </div>
                                <div>
                                    <p className="font-semibold text-lg">Cash on Delivery (COD)</p>
                                    <p className="text-sm text-muted-foreground mt-1">Pay when your order reaches your doorstep.</p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="w-full lg:w-1/3">
                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 sticky top-28 shadow-sm">
                            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                            
                            <div className="space-y-5 mb-6 pb-6 border-b border-zinc-200 dark:border-zinc-800 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                {cart.items.map((item: any) => {
                                    const basePrice = item.product.discountPrice || item.product.price
                                    let isDiscounted = false
                                    let finalPrice = basePrice
                                    
                                    if (applyStudentDiscount && item.product.studentDiscount) {
                                        isDiscounted = true
                                        if (item.product.studentDiscountType === 'FIXED') {
                                            finalPrice = Math.max(0, basePrice - item.product.studentDiscount)
                                        } else {
                                            finalPrice = basePrice - (basePrice * (item.product.studentDiscount / 100))
                                        }
                                    }

                                    return (
                                        <div key={item.id} className="flex gap-4">
                                            <div className="w-16 h-16 rounded-md bg-zinc-100 overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-800">
                                                {item.product.images && <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-sm line-clamp-2 leading-snug" title={item.product.name}>{item.product.name}</p>
                                                <p className="text-xs text-muted-foreground mt-1">Qty: {item.quantity}</p>
                                                <div className="mt-1 flex items-center gap-2">
                                                    <span className="font-bold text-sm">₹{finalPrice * item.quantity}</span>
                                                    {isDiscounted && <span className="text-xs text-muted-foreground line-through">₹{basePrice * item.quantity}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="space-y-3 mb-6 pb-6 border-b border-zinc-200 dark:border-zinc-800 text-sm">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Items Subtotal</span>
                                    <span>₹{subtotal}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-green-600 dark:text-green-400 font-medium">
                                        <span>Student Discount</span>
                                        <span>- ₹{discountAmount}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Shipping</span>
                                    <span className="text-green-600 dark:text-green-400">FREE</span>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-end mb-8">
                                <span className="font-bold text-lg text-zinc-900 dark:text-zinc-50">Total Amount</span>
                                <div className="text-right">
                                    <span className="font-extrabold text-3xl text-primary">₹{finalTotal}</span>
                                </div>
                            </div>
                            
                            <Button 
                                size="lg" 
                                className="w-full text-base font-bold py-6 shadow-md hover:shadow-lg transition-shadow" 
                                onClick={handlePlaceOrder}
                                disabled={isPlacingOrder || !selectedAddressId}
                            >
                                {isPlacingOrder ? "Processing..." : "Place Order Securely"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
