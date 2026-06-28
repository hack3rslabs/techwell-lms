"use client"

import * as React from 'react'
import Image from 'next/image'
import { useRouter, useParams } from 'next/navigation'
import { courseApi, paymentApi, leadApi, couponApi, referralApi } from '@/lib/api'
import { toast } from 'sonner'
import { getFullImageUrl } from '@/lib/image-utils'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    GraduationCap,
    Users,
    Star,
    CheckCircle2,
    PlayCircle,
    Loader2,
    ArrowLeft,
    CreditCard,
    XCircle,
    Bot,
    X,
    Download,
    MessageSquare
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TermsAcceptModal } from '@/components/ui/TermsAcceptModal'

interface RazorpayResponse {
    razorpay_payment_id: string
    razorpay_order_id: string
    razorpay_signature: string
}

interface RazorpayOptions {
    key: string
    amount: number
    currency: string
    name: string
    description: string
    order_id: string
    handler: (response: RazorpayResponse) => Promise<void>
    prefill: {
        name?: string
        email?: string
    }
    theme: {
        color: string
    }
    modal: {
        ondismiss: () => void
    }
}

interface ApiError {
    response?: {
        data?: {
            error?: string
        }
    }
}

declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => {
            open: () => void
            on: (event: string, handler: (response: { error?: Record<string, unknown> } & Record<string, unknown>) => void) => void
        }
    }
}

interface Module {
    id: string
    title: string
    description: string
    orderIndex: number
    lessons: { id: string; title: string; duration: number }[]
}

interface Course {
    id: string
    title: string
    description: string
    category: string
    difficulty: string
    duration: number
    price: number
    thumbnail?: string
    instructor?: { name: string; email: string }
    modules: Module[]
    start?: string
    bundlePrice?: number
    hasInterviewPrep?: boolean
    _count?: { enrollments: number }
    isEnrolled?: boolean
    discountPrice?: number
    courseCode?: string
    jobRoles?: string[]
    bannerUrl?: string
    averageRating?: number
    requireAdmissionFee?: boolean
    admissionFee?: number
    fakeEnrolledCount?: number
    fakeRating?: number
    toolsCovered?: string[]
    marketDemandScore?: number
    salaryFresher?: string
    salaryExperienced?: string
    pageViews?: number
    careerOpportunities?: { role: string; description: string }[]
    salaryInsights?: { role: string; min: string; max: string; average: string }[]
    projects?: { title: string; description: string; duration: string }[]
    prerequisites?: string[]
    learningOutcomes?: string[]
    faqs?: { question: string; answer: string }[]
}

const loadRazorpay = () => {
    return new Promise<boolean>((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export default function CourseDetailClient() {
    const router = useRouter()
    const params = useParams()
    const { isAuthenticated, user } = useAuth()

    const [course, setCourse] = React.useState<Course | null>(null)
    const [upcomingBatch, setUpcomingBatch] = React.useState<any | null>(null)
    const [demoRequestsCount, setDemoRequestsCount] = React.useState(0)
    const [isLoading, setIsLoading] = React.useState(true)
    const [isEnrolling, setIsEnrolling] = React.useState(false)
    const [expandedModules, setExpandedModules] = React.useState<string[]>([])
    const [purchaseType, setPurchaseType] = React.useState<'COURSE_ONLY' | 'BUNDLE'>('COURSE_ONLY');
    const [couponCode, setCouponCode] = React.useState("")
    const [appliedCoupon, setAppliedCoupon] = React.useState<{code: string, discountPercent: number, type: 'COUPON' | 'REFERRAL'} | null>(null)
    const [isValidatingCoupon, setIsValidatingCoupon] = React.useState(false)
    const [couponError, setCouponError] = React.useState("")

    const [showExitIntent, setShowExitIntent] = React.useState(false)
    const [hasTriggeredExitIntent, setHasTriggeredExitIntent] = React.useState(false)
    const [showCounselorMenu, setShowCounselorMenu] = React.useState(false)
    const [termsAccepted, setTermsAccepted] = React.useState(false)

    React.useEffect(() => {
        const handleMouseLeave = (e: MouseEvent) => {
            if (e.clientY <= 0 && !hasTriggeredExitIntent && !course?.isEnrolled) {
                setShowExitIntent(true)
                setHasTriggeredExitIntent(true)
            }
        }
        document.addEventListener('mouseleave', handleMouseLeave)
        return () => document.removeEventListener('mouseleave', handleMouseLeave)
    }, [hasTriggeredExitIntent, course?.isEnrolled])

    React.useEffect(() => {
        const fetchCourseData = async () => {
            try {
                const response = await courseApi.getById(params.id as string)
                setCourse({
                    ...response.data.course,
                    isEnrolled: response.data.isEnrolled
                })
                if (response.data.upcomingBatch) setUpcomingBatch(response.data.upcomingBatch)
                if (response.data.demoRequestsCount) setDemoRequestsCount(response.data.demoRequestsCount)
            } catch (error) {
                console.error('Failed to fetch course:', error)
            } finally {
                setIsLoading(false)
            }
        }

        if (params.id) {
            fetchCourseData()
        }
    }, [params.id])

    const [dialogMessage, setDialogMessage] = React.useState<{ title: string; desc: string; type: 'success' | 'error' } | null>(null)
    const [showRequestDialog, setShowRequestDialog] = React.useState(false)
    const [showDemoDialog, setShowDemoDialog] = React.useState(false)
    const [isRequesting, setIsRequesting] = React.useState(false)
    const [formData, setFormData] = React.useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        qualification: '',
        college: '',
        yearOfPassout: '',
        scheduledAtDate: '',
        scheduledAtTime: ''
    })
    const openInterestForm = () => {
        setShowRequestDialog(true)
    }
    const openDemoForm = () => {
        setShowDemoDialog(true)
    }

    React.useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || prev.name,
                email: user.email || prev.email,
                phone: user.phone || prev.phone
            }))
        }
    }, [user])

    const handleEnrollInterest = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!course) return
        setIsRequesting(true)
        try {
            await leadApi.capture({
                courseId: course.id,
                courseTitle: course.title,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                qualification: formData.qualification
            })
            setDialogMessage({
                title: 'Interest Captured!',
                desc: 'Thank you for your interest. Our career counselor will contact you shortly.',
                type: 'success'
            })
            setShowRequestDialog(false)
        } catch (error) {
            console.error('Failed to capture interest:', error)
            setDialogMessage({
                title: 'Submission Failed',
                desc: 'Something went wrong. Please try again or contact support.',
                type: 'error'
            })
        } finally {
            setIsRequesting(false)
        }
    }

    const timeOptions = [
        '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'
    ]

    const handleScheduleDemo = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!course) return
        if (!formData.scheduledAtDate || !formData.scheduledAtTime) {
            toast.error("Please select both date and time")
            return
        }

        // Combine date and time
        const scheduledAt = new Date(`${formData.scheduledAtDate}T${formData.scheduledAtTime}:00`);
        
        setIsRequesting(true)
        try {
            await leadApi.captureDemo({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                courseName: course.title,
                courseId: course.id,
                scheduledAt: scheduledAt.toISOString(),
                qualification: formData.qualification,
                college: formData.college,
                yearOfPassout: formData.yearOfPassout
            })

            setDialogMessage({
                title: 'Demo Scheduled!',
                desc: 'Your demo has been scheduled successfully. Our team will share the meeting details shortly.',
                type: 'success'
            })
            setShowDemoDialog(false)
        } catch (error: any) {
            console.error('Failed to schedule demo:', error)
            setDialogMessage({
                title: 'Scheduling Failed',
                desc: error.message || 'Something went wrong. Please try again or contact support.',
                type: 'error'
            })
        } finally {
            setIsRequesting(false)
        }
    }

    const handleBuy = async () => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        // Open Razorpay directly
        handleRazorpayPayment()
    }

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setIsValidatingCoupon(true);
        setCouponError("");
        try {
            // First try as a coupon
            try {
                const res = await couponApi.validate({ code: couponCode.toUpperCase(), courseId: course!.id });
                setAppliedCoupon({ code: res.data.code, discountPercent: res.data.discountPercent, type: 'COUPON' });
                toast.success("Coupon applied successfully!");
                setIsValidatingCoupon(false);
                return; // Exit early if coupon worked
            } catch (couponErr: any) {
                // If not a coupon, try referral
            }

            // Try as a referral code
            const refRes = await referralApi.applyReferral({ code: couponCode.toUpperCase() });
            setAppliedCoupon({ 
                code: couponCode.toUpperCase(), 
                discountPercent: refRes.data.data.discountPercent, 
                type: 'REFERRAL' 
            });
            toast.success("Referral code applied successfully!");
        } catch (error: any) {
            setCouponError("Invalid coupon or referral code");
            setAppliedCoupon(null);
        } finally {
            setIsValidatingCoupon(false);
        }
    }

    const handleRazorpayPayment = async () => {
        setIsEnrolling(true)
        try {
            let basePrice = course!.requireAdmissionFee 
                ? (course!.admissionFee || 1000)
                : purchaseType === 'BUNDLE' 
                    ? (course!.bundlePrice || (course!.price * 1.2)) 
                    : (course!.discountPrice || course!.price);
            
            const currentPrice = appliedCoupon 
                ? basePrice * (1 - appliedCoupon.discountPercent / 100)
                : basePrice;

            // 1. Create Order with Type (send amount so backend can create razorpay order)
            const { data: order } = await paymentApi.createOrder(course!.id, purchaseType, currentPrice, 'INR')

            if (order.gateway === 'FREE') {
                setCourse({ ...course!, isEnrolled: true })
                setDialogMessage({
                    title: 'Enrollment Successful!',
                    desc: order.message || 'You are now officially enrolled and can start learning immediately.',
                    type: 'success'
                })
                setIsEnrolling(false)
                return
            }

            // Load Script
            const res = await loadRazorpay();
            if (!res) throw new Error('Razorpay SDK failed to load');

            const options = {
                key: order.keyId || 'rzp_test_dummy12345',
                amount: order.amount,
                currency: order.currency || 'INR',
                name: 'Techwell',
                description: purchaseType === 'BUNDLE' ? `Course + Interview Bundle` : `Enrollment for ${course!.title}`,
                order_id: order.orderId || order.id,
                handler: async function (response: RazorpayResponse) {
                    try {
                        await paymentApi.verifyPayment({
                            razorpay_order_id: order.orderId || order.id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        })
                        setCourse({ ...course!, isEnrolled: true })
                        setDialogMessage({
                            title: 'Payment Successful!',
                            desc: 'You are now officially enrolled and can start learning immediately.',
                            type: 'success'
                        })
                    } catch {
                        setDialogMessage({
                            title: 'Verification Failed',
                            desc: 'Payment verification failed. Please contact support.',
                            type: 'error'
                        })
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                },
                theme: {
                    color: '#0f172a'
                },
                modal: {
                    ondismiss: function () {
                        setIsEnrolling(false)
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response: { error?: Record<string, unknown> } & Record<string, unknown>) {
                const gatewayError = response.error || {}
                const fallbackReason = [
                    typeof gatewayError['description'] === 'string' ? gatewayError['description'] : '',
                    typeof gatewayError['reason'] === 'string' ? gatewayError['reason'] : '',
                    typeof gatewayError['step'] === 'string' ? `Step: ${gatewayError['step']}` : '',
                    typeof gatewayError['code'] === 'string' ? `Code: ${gatewayError['code']}` : '',
                ].filter(Boolean).join(' | ')

                paymentApi.getOrderStatus(order.orderId || order.id)
                    .then(({ data }) => {
                        const payment = data?.payment
                        const detailedReason = [
                            payment?.errorDescription,
                            payment?.errorReason ? `Reason: ${payment.errorReason}` : '',
                            payment?.errorStep ? `Step: ${payment.errorStep}` : '',
                            payment?.errorSource ? `Source: ${payment.errorSource}` : '',
                            payment?.errorCode ? `Code: ${payment.errorCode}` : '',
                        ].filter(Boolean).join(' | ')

                        setDialogMessage({
                            title: 'Payment Failed',
                            desc: detailedReason || fallbackReason || 'The transaction was declined or cancelled. You have not been charged.',
                            type: 'error'
                        })
                    })
                    .catch(() => {
                        setDialogMessage({
                            title: 'Payment Failed',
                            desc: fallbackReason || 'The transaction was declined or cancelled. You have not been charged.',
                            type: 'error'
                        })
                    })
                    .finally(() => {
                        setIsEnrolling(false);
                    })
            });
            rzp.open();

        } catch (error) {
            console.error('Failed to enroll:', error)
            const apiError = error as ApiError
            const message = apiError.response?.data?.error
            if (error instanceof Error && error.message.includes('SDK')) {
                setDialogMessage({
                    title: 'SDK Error',
                    desc: 'Payment gateway failed to initialize.',
                    type: 'error'
                })
            } else if (message) {
                setDialogMessage({
                    title: 'Payment Setup Error',
                    desc: message,
                    type: 'error'
                })
            }
            setIsEnrolling(false)
        }
    }

    const toggleModule = (moduleId: string) => {
        setExpandedModules(prev =>
            prev.includes(moduleId)
                ? prev.filter(id => id !== moduleId)
                : [...prev, moduleId]
        )
    }

    const getDifficultyColor = (diff: string) => {
        switch (diff) {
            case 'BEGINNER': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            case 'ADVANCED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!course) {
        return (
            <div className="container py-8 text-center">
                <h1 className="text-2xl font-bold mb-4">Course not found</h1>
                <Button onClick={() => router.push('/courses')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Courses
                </Button>
            </div>
        )
    }

    let basePrice = course.requireAdmissionFee
        ? (course.admissionFee || 1000)
        : purchaseType === 'BUNDLE' 
            ? (course.bundlePrice || (course.price * 1.2)) 
            : (course.discountPrice || course.price);

    const currentPrice = appliedCoupon 
        ? basePrice * (1 - appliedCoupon.discountPercent / 100)
        : basePrice;

    return (
        <div className="container py-6">
            {/* Course Banner */}
            <div className="relative w-full aspect-[12/4] mb-10 rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 group bg-muted flex items-center justify-center">
                <GraduationCap className="h-24 w-24 text-primary/10 absolute z-0" />
                {course.bannerUrl && (
                    <Image
                        src={getFullImageUrl(course.bannerUrl)}
                        alt={`${course.title} Banner`}
                        onClick={openInterestForm}
                        fill
                        unoptimized
                        className="object-cover transition-all duration-700 group-hover:scale-[1.03] z-10 cursor-pointer rounded-xl"
                        priority
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            console.error(`[BANNER ERROR] Failed to load: ${target.src}`);
                            target.style.opacity = '0';
                        }}
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 z-20 pointer-events-none" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            {course.isEnrolled && (
                                <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Enrolled
                                </span>
                            )}
                            <span className={`text-xs px-3 py-1 rounded-full ${getDifficultyColor(course.difficulty)}`}>
                                {course.difficulty}
                            </span>
                            <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                {course.duration || 0} hrs
                            </span>
                            <span className="text-sm text-muted-foreground">{course.category}</span>
                            
                            <span className="text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 flex items-center gap-1 font-bold">
                                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                                {course.averageRating || 4.5}
                            </span>

                            {course.hasInterviewPrep && (
                                <span className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 flex items-center gap-1">
                                    <Star className="h-3 w-3" />
                                    Interview Prep Available
                                </span>
                            )}
                        </div>
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                            <h1 className="text-3xl font-bold">{course.title}</h1>
                            {!course.isEnrolled && (
                                <div className="flex gap-3">
                                    <Dialog open={showDemoDialog} onOpenChange={setShowDemoDialog}>
                                        <DialogTrigger asChild>
                                            <Button size="lg" variant="outline" className="shrink-0 font-bold rounded-xl border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 hover:scale-[1.02] active:scale-95">
                                                Schedule Demo
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[500px]">
                                            <DialogHeader>
                                                <DialogTitle>Schedule a 30-Minute Demo</DialogTitle>
                                                <DialogDescription>
                                                    Select a time between 3 PM and 8 PM to experience a live demo.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <form onSubmit={handleScheduleDemo} className="space-y-4 pt-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="demo-name">Full Name *</Label>
                                                        <Input id="demo-name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="demo-phone">Mobile Number *</Label>
                                                        <Input id="demo-phone" type="tel" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="demo-email">Email Address *</Label>
                                                    <Input id="demo-email" type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Selected Course</Label>
                                                    <Input value={course.title} disabled className="bg-muted" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="demo-date">Date *</Label>
                                                        <Input id="demo-date" type="date" required min={new Date().toISOString().split('T')[0]} value={formData.scheduledAtDate} onChange={e => setFormData({ ...formData, scheduledAtDate: e.target.value })} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="demo-time">Time *</Label>
                                                        <select
                                                            id="demo-time"
                                                            required
                                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                            value={formData.scheduledAtTime}
                                                            onChange={e => setFormData({ ...formData, scheduledAtTime: e.target.value })}
                                                        >
                                                            <option value="" disabled>Select Time</option>
                                                            {timeOptions.map(time => (
                                                                <option key={time} value={time}>{time}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="demo-college">College</Label>
                                                        <Input id="demo-college" value={formData.college} onChange={e => setFormData({ ...formData, college: e.target.value })} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="demo-passout">Year of Passout</Label>
                                                        <Input id="demo-passout" value={formData.yearOfPassout} onChange={e => setFormData({ ...formData, yearOfPassout: e.target.value })} />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="demo-qual">Highest Qualification</Label>
                                                    <Input id="demo-qual" value={formData.qualification} onChange={e => setFormData({ ...formData, qualification: e.target.value })} />
                                                </div>
                                                <Button type="submit" className="w-full" disabled={isRequesting}>
                                                    {isRequesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                    Schedule Demo
                                                </Button>
                                            </form>
                                        </DialogContent>
                                    </Dialog>

                                    <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
                                        <DialogTrigger asChild>
                                            <Button size="lg" className="shadow-lg shadow-primary/20 shrink-0 font-bold rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white border-0 transition-all duration-300 hover:scale-[1.02] active:scale-95">
                                                Share Interest (Free)
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                                <DialogTitle>Share Course Interest</DialogTitle>
                                                <DialogDescription>
                                                    Submit your details and our team will help you with the next steps. This will be added to our Leads for follow-up.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <form onSubmit={handleEnrollInterest} className="space-y-4 pt-4">
                                                <div className="space-y-2">
                                                    <Label>Course</Label>
                                                    <Input value={course.title} disabled className="bg-muted" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="name">Full Name *</Label>
                                                    <Input id="name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="email">Email Address *</Label>
                                                    <Input id="email" type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="phone">Phone Number</Label>
                                                    <Input id="phone" type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="qualification">Highest Qualification</Label>
                                                    <Input id="qualification" value={formData.qualification} onChange={e => setFormData({ ...formData, qualification: e.target.value })} />
                                                </div>
                                                <Button type="submit" className="w-full" disabled={isRequesting}>
                                                    {isRequesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                    Submit Interest
                                                </Button>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            )}
                        </div>
                        <div className="text-lg text-muted-foreground mb-6 prose max-w-none" dangerouslySetInnerHTML={{ __html: course.description || '' }} />

                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            
                            {course.instructor && (
                                <div className="flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4" />
                                    <span>{course.instructor.name}</span>
                                </div>
                            )}
                        </div>

                        {course.jobRoles && course.jobRoles.length > 0 && (
                            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                                <h4 className="font-semibold text-sm mb-2">Target Job Roles:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {course.jobRoles.map((role, i) => (
                                        <div key={i} className="flex items-center gap-1.5 bg-background border px-3 py-1.5 rounded-full text-xs font-medium">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                            {role}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                   <Card>
    <CardHeader>
        <CardTitle>Course Curriculum</CardTitle>
    </CardHeader>

    <CardContent>
        {course.modules && course.modules.length > 0 ? (
            <Accordion
                type="single"
                collapsible
                className="w-full"
            >
                <AccordionItem
                    value="course-curriculum"
                    className="border rounded-xl px-4"
                >
                    <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                            <span className="font-medium">
                                View Curriculum
                            </span>

                            <span className="text-sm text-muted-foreground">
                                {course.modules.length} Modules
                            </span>
                        </div>
                    </AccordionTrigger>

                    <AccordionContent>
                        <div className="space-y-4 pt-2">
                            {course.modules.map((module) => (
                                <div
                                    key={module.id}
                                    className="border rounded-lg p-4"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                                            {module.orderIndex + 1}
                                        </div>

                                        <div>
                                            <h4 className="font-medium">
                                                {module.title}
                                            </h4>
                                            {module.description && (
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {module.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {module.lessons?.map((lesson) => (
                                            <div
                                                key={lesson.id}
                                                className="flex items-center justify-between text-sm border rounded-md px-3 py-2"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <PlayCircle className="h-4 w-4 text-muted-foreground" />

                                                    <span>
                                                        {lesson.title}
                                                    </span>
                                                </div>

                                                <span className="text-muted-foreground">
                                                    {lesson.duration}m
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        ) : (
            <p className="text-muted-foreground text-center py-8">
                Curriculum coming soon
            </p>
        )}
                    </CardContent>
                </Card>

                {/* Tools & Technologies */}
                {(course.toolsCovered && course.toolsCovered.length > 0) || true ? (
                    <Card className="mb-8 border-none shadow-md overflow-hidden bg-gradient-to-r from-slate-50 to-white">
                        <CardHeader className="bg-slate-100/50 pb-4">
                            <CardTitle className="text-xl flex items-center gap-2 text-slate-800">
                                🛠️ Tools & Technologies Covered
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="flex flex-wrap gap-3">
                                {(course.toolsCovered?.length ? course.toolsCovered : ['React', 'Node.js', 'PostgreSQL', 'Docker', 'AWS']).map((tool, idx) => (
                                    <div key={idx} className="flex items-center gap-2 px-4 py-2 rounded-full border bg-white shadow-sm hover:shadow-md hover:border-primary transition-all cursor-default">
                                        <div className="h-2 w-2 rounded-full bg-primary" />
                                        <span className="font-medium text-sm text-slate-700">{tool}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ) : null}

                {/* Prerequisites & Outcomes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {(course.prerequisites && course.prerequisites.length > 0) && (
                        <Card className="border-none shadow-md">
                            <CardHeader className="bg-slate-50 border-b">
                                <CardTitle className="text-xl flex items-center gap-2">🎯 Prerequisites</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <ul className="space-y-3">
                                    {course.prerequisites.map((req, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <div className="mt-1 min-w-4"><CheckCircle2 className="h-4 w-4 text-muted-foreground" /></div>
                                            <span className="text-muted-foreground">{req}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}

                    {(course.learningOutcomes && course.learningOutcomes.length > 0) && (
                        <Card className="border-none shadow-md">
                            <CardHeader className="bg-primary/5 border-b">
                                <CardTitle className="text-xl flex items-center gap-2 text-primary">✨ What you'll learn</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <ul className="space-y-3">
                                    {course.learningOutcomes.map((outcome, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <div className="mt-1 min-w-4"><CheckCircle2 className="h-4 w-4 text-primary" /></div>
                                            <span className="text-muted-foreground">{outcome}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Hands-on Projects */}
                {(course.projects && course.projects.length > 0) && (
                    <Card className="mb-8 border-none shadow-md bg-gradient-to-br from-indigo-50 to-white">
                        <CardHeader className="border-b bg-white/50">
                            <CardTitle className="text-xl flex items-center gap-2 text-indigo-900">
                                💻 Hands-on Projects
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {course.projects.map((proj, idx) => (
                                <div key={idx} className="bg-white p-5 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                                    <div className="text-xs font-bold text-indigo-600 mb-2 tracking-wider uppercase flex items-center justify-between">
                                        Project {idx + 1}
                                        {proj.duration && <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">{proj.duration}</span>}
                                    </div>
                                    <h4 className="font-semibold text-lg text-slate-800 mb-2">{proj.title}</h4>
                                    <p className="text-slate-600 text-sm leading-relaxed">{proj.description}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Market Demand & Career Insights */}
                <Card className="mb-8 border-none shadow-md bg-[#0F172A] text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <GraduationCap className="w-32 h-32" />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            📈 Career Opportunities & Market Demand
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8 relative z-10">
                        {/* Salary Insights */}
                        {course.salaryInsights && course.salaryInsights.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {course.salaryInsights.map((insight, idx) => (
                                    <div key={idx} className="bg-white/10 p-5 rounded-xl border border-white/20 backdrop-blur-sm hover:bg-white/15 transition-colors">
                                        <div className="text-emerald-400 text-sm font-bold tracking-wider mb-3 pb-2 border-b border-white/10">{insight.role}</div>
                                        <div className="flex justify-between items-end mb-2">
                                            <div className="text-white/60 text-xs">Average</div>
                                            <div className="text-2xl font-bold text-white">{insight.average}</div>
                                        </div>
                                        <div className="flex justify-between text-xs text-white/50">
                                            <span>Min: {insight.min}</span>
                                            <span>Max: {insight.max}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur-sm">
                                    <div className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">Market Demand Score</div>
                                    <div className="text-3xl font-bold flex items-end gap-1 text-emerald-400">
                                        {course.marketDemandScore || 92} <span className="text-lg font-normal">/ 100</span>
                                    </div>
                                    <div className="text-xs text-white/60 mt-2">Highly sought after by recruiters</div>
                                </div>
                                <div className="bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur-sm">
                                    <div className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">Average Salary (Fresher)</div>
                                    <div className="text-2xl font-bold text-white">
                                        {course.salaryFresher || '₹4.5 - 6 LPA'}
                                    </div>
                                    <div className="text-xs text-white/60 mt-2">Starting salary for entry-level</div>
                                </div>
                                <div className="bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur-sm">
                                    <div className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">Average Salary (Experienced)</div>
                                    <div className="text-2xl font-bold text-white">
                                        {course.salaryExperienced || '₹12 - 25 LPA'}
                                    </div>
                                    <div className="text-xs text-white/60 mt-2">For 3+ years experience</div>
                                </div>
                            </div>
                        )}

                        {/* Career Roles */}
                        {course.careerOpportunities && course.careerOpportunities.length > 0 && (
                            <div className="pt-4 border-t border-white/10">
                                <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">Roles You Can Apply For</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {course.careerOpportunities.map((opp, idx) => (
                                        <div key={idx} className="flex gap-3 items-start bg-white/5 p-3 rounded-lg border border-white/5">
                                            <div className="mt-0.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /></div>
                                            <div>
                                                <div className="font-medium text-sm text-white/90">{opp.role}</div>
                                                {opp.description && <div className="text-xs text-white/60 mt-1">{opp.description}</div>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
                </div>

                <div className="lg:col-span-1">
                    <Card className="sticky top-24 shadow-xl border-primary/20 overflow-hidden">
                        <div className="h-48 relative bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
                            {course.thumbnail ? (
                                <Image
                                    src={getFullImageUrl(course.thumbnail)}
                                    alt={course.title}
                                    fill
                                    unoptimized
                                    className="w-full h-full object-cover z-10 transition-transform duration-500 hover:scale-105"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.opacity = '0';
                                    }}
                                />
                            ) : (
                                <GraduationCap className="h-16 w-16 text-primary/20 absolute z-0" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-20" />
                            <div className="absolute bottom-4 left-4 right-4 z-30 flex justify-between items-end">
                                <div>
                                    <Badge className="bg-primary/90 hover:bg-primary mb-2">Bestseller</Badge>
                                    <div className="text-white font-bold flex items-center gap-1 text-sm">
                                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                        {course.averageRating || course.fakeRating || 4.8} Rating
                                    </div>
                                </div>
                            </div>
                        </div>
                        <CardContent className="pt-6 space-y-6">
                            {course.hasInterviewPrep && !course.isEnrolled && (
                                <div className="p-3 bg-muted/50 rounded-lg space-y-2 border border-border">
                                    <div
                                        className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${purchaseType === 'COURSE_ONLY' ? 'border-primary bg-primary/5 shadow-sm' : 'border-transparent'}`}
                                        onClick={() => setPurchaseType('COURSE_ONLY')}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${purchaseType === 'COURSE_ONLY' ? 'border-primary' : 'border-muted-foreground'}`}>
                                                {purchaseType === 'COURSE_ONLY' && <div className="h-2 w-2 rounded-full bg-primary" />}
                                            </div>
                                            <span className="font-medium text-sm">Course Only</span>
                                        </div>
                                    </div>

                                    <div
                                        className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${purchaseType === 'BUNDLE' ? 'border-purple-500 bg-purple-50 shadow-sm' : 'border-transparent'}`}
                                        onClick={() => setPurchaseType('BUNDLE')}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${purchaseType === 'BUNDLE' ? 'border-purple-500' : 'border-muted-foreground'}`}>
                                                {purchaseType === 'BUNDLE' && <div className="h-2 w-2 rounded-full bg-purple-500" />}
                                            </div>
                                            <div>
                                                <span className="font-medium text-sm block">Complete Bundle</span>
                                                <span className="text-[10px] text-green-600 font-medium">Includes AI Interview Prep</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Conversion Signals */}
                            <div className="space-y-3">
                                {upcomingBatch ? (
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 border border-orange-100 text-orange-800">
                                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                                            <span className="text-xl">⏳</span>
                                        </div>
                                        <div>
                                            <div className="text-xs font-semibold uppercase tracking-wider opacity-80">Next Batch Starts In</div>
                                            <div className="font-bold text-sm">
                                                {Math.max(1, Math.ceil((new Date(upcomingBatch.startDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)))} Days
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100 text-blue-800">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                            <span className="text-xl">📅</span>
                                        </div>
                                        <div>
                                            <div className="text-xs font-semibold uppercase tracking-wider opacity-80">Flexible Batches</div>
                                            <div className="font-bold text-sm">Start Learning Today</div>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-50 border border-slate-100">
                                        <span className="text-lg mb-1">👨‍🎓</span>
                                        <span className="text-xs font-medium text-center">{(course._count?.enrollments || 0) + (course.fakeEnrolledCount || 1200)}+ Trained</span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-50 border border-slate-100">
                                        <span className="text-lg mb-1">🔥</span>
                                        <span className="text-xs font-medium text-center">{demoRequestsCount + 45} Enquiries This Week</span>
                                    </div>
                                </div>

                                <ul className="space-y-2 py-2">
                                    <li className="flex items-center gap-2 text-sm text-slate-700">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Free Demo Available
                                    </li>
                                    <li className="flex items-center gap-2 text-sm text-slate-700">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Placement Assistance
                                    </li>
                                    <li className="flex items-center gap-2 text-sm text-slate-700">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Resume Building & Mock Interviews
                                    </li>
                                    <li className="flex items-center gap-2 text-sm text-slate-700">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Course Certificate Included
                                    </li>
                                </ul>
                            </div>

                            {!course.isEnrolled && currentPrice > 0 && (
                                <div className="space-y-2 pt-2 border-t border-border/50">
                                    <Label className="text-xs text-muted-foreground">Have a coupon code?</Label>
                                    <div className="flex gap-2">
                                        <Input 
                                            placeholder="Enter code" 
                                            value={couponCode} 
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            disabled={!!appliedCoupon || isValidatingCoupon}
                                            className="h-9 text-sm"
                                        />
                                        {!appliedCoupon ? (
                                            <Button size="sm" onClick={handleApplyCoupon} disabled={!couponCode || isValidatingCoupon} variant="outline" className="h-9">
                                                {isValidatingCoupon ? "..." : "Apply"}
                                            </Button>
                                        ) : (
                                            <Button size="sm" onClick={() => {
                                                setAppliedCoupon(null)
                                                setCouponCode("")
                                            }} variant="ghost" className="h-9 px-2 text-red-500 hover:text-red-600 hover:bg-red-50">
                                                <XCircle className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                    {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
                                    {appliedCoupon && <p className="text-xs text-emerald-600 mt-1 font-medium">✨ {appliedCoupon.type === 'REFERRAL' ? 'Referral code' : 'Coupon'} applied successfully!</p>}
                                </div>
                            )}

                            <div className="pt-2 space-y-3">
                                {course.isEnrolled ? (
                                    <Button className="w-full h-12 text-md font-bold shadow-lg shadow-primary/25 rounded-xl hover:scale-[1.02] transition-transform" size="lg" onClick={() => router.push(`/learn/${course.id}`)}>
                                        <PlayCircle className="mr-2 h-5 w-5" /> Go to Course
                                    </Button>
                                ) : (
                                    <>
                                        <div className="flex flex-col gap-2 pb-2">
                                            <TermsAcceptModal 
                                                hasAccepted={termsAccepted} 
                                                onAccept={() => setTermsAccepted(true)} 
                                            />
                                        </div>

                                        {currentPrice > 0 ? (
                                            <Button 
                                                className="w-full h-12 text-md font-bold shadow-lg shadow-primary/25 rounded-xl hover:scale-[1.02] transition-transform" 
                                                size="lg" 
                                                onClick={handleBuy} 
                                                disabled={isEnrolling || !termsAccepted}
                                            >
                                                {isEnrolling ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CreditCard className="mr-2 h-5 w-5" />}
                                                {isEnrolling ? 'Processing...' : `Enroll Now at ₹${currentPrice}`}
                                            </Button>
                                        ) : (
                                            <Button 
                                                className="w-full h-12 text-md font-bold shadow-lg shadow-primary/25 rounded-xl hover:scale-[1.02] transition-transform" 
                                                size="lg" 
                                                onClick={handleBuy} 
                                                disabled={isEnrolling || !termsAccepted}
                                            >
                                                {isEnrolling ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <PlayCircle className="mr-2 h-5 w-5" />}
                                                {isEnrolling ? 'Processing...' : 'Start Learning for Free'}
                                            </Button>
                                        )}
                                        
                                        <div className="grid grid-cols-2 gap-3">
                                            <Button variant="outline" className="w-full font-semibold border-primary/20 text-primary hover:bg-primary/5 rounded-xl" onClick={openDemoForm}>
                                                Book Demo
                                            </Button>
                                            <Button variant="outline" className="w-full font-semibold border-green-500/20 text-green-700 hover:bg-green-50 rounded-xl" onClick={() => window.open(`https://wa.me/919999999999?text=Hi, I am interested in ${course.title}`, '_blank')}>
                                                WhatsApp Us
                                            </Button>
                                        </div>
                                        <p className="text-[10px] text-center text-muted-foreground pt-2">
                                            🔒 100% Secure Checkout. 7-Day Money Back Guarantee.
                                        </p>
                                    </>
                                )}
                            </div>

                            {course.instructor && (
                                <div className="mt-6 pt-6 border-t">
                                    <h4 className="font-medium mb-2">Instructor</h4>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Users className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{course.instructor.name}</p>
                                            <p className="text-xs text-muted-foreground">{course.instructor.email}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={!!dialogMessage} onOpenChange={(open) => !open && setDialogMessage(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className={`flex items-center gap-2 ${dialogMessage?.type === 'error' ? 'text-destructive' : 'text-green-600'}`}>
                            {dialogMessage?.type === 'error' ? <XCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                            {dialogMessage?.title}
                        </DialogTitle>
                        <DialogDescription>
                            {dialogMessage?.desc || 'Review the latest enrollment or payment status.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-muted-foreground">{dialogMessage?.desc}</p>
                    </div>
                    <div className="flex justify-end">
                        <Button
                            variant={dialogMessage?.type === 'error' ? 'destructive' : 'default'}
                            onClick={() => setDialogMessage(null)}
                        >
                            {dialogMessage?.type === 'error' ? 'Close' : 'Continue'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Exit Intent Dialog */}
            <Dialog open={showExitIntent} onOpenChange={setShowExitIntent}>
                <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-0">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-800 p-8 text-white text-center relative">
                        <Button 
                            variant="ghost" 
                            className="absolute right-2 top-2 text-white/70 hover:text-white hover:bg-white/20" 
                            onClick={() => setShowExitIntent(false)}
                            size="icon"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                        <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                            <Download className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Wait! Before You Go...</h2>
                        <p className="text-white/90 mb-6">
                            Download the complete course syllabus and career roadmap for free. See exactly what you'll learn!
                        </p>
                        <Button 
                            className="w-full bg-white text-indigo-600 hover:bg-slate-100 font-bold text-lg h-12 shadow-xl"
                            onClick={() => {
                                toast.success("Syllabus downloaded successfully!");
                                setShowExitIntent(false);
                            }}
                        >
                            Download Free Syllabus
                        </Button>
                        <button 
                            className="text-white/60 text-sm mt-4 underline hover:text-white transition-colors"
                            onClick={() => setShowExitIntent(false)}
                        >
                            No thanks, I'll pass
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Floating AI Counselor */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
                {showCounselorMenu && (
                    <div className="bg-white rounded-xl shadow-2xl p-4 w-64 border border-slate-100 transform transition-all duration-300 origin-bottom-right animate-in slide-in-from-bottom-5">
                        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-100">
                            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <Bot className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-800">AI Counselor</h4>
                                <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    Online
                                </p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Button variant="ghost" className="w-full justify-start text-sm hover:bg-slate-50" onClick={openInterestForm}>
                                <MessageSquare className="h-4 w-4 mr-2 text-slate-400" /> Need Course Advice?
                            </Button>
                            <Button variant="ghost" className="w-full justify-start text-sm hover:bg-slate-50" onClick={openDemoForm}>
                                <PlayCircle className="h-4 w-4 mr-2 text-slate-400" /> Watch a Demo
                            </Button>
                        </div>
                    </div>
                )}
                
                <Button 
                    size="icon" 
                    className={`h-14 w-14 rounded-full shadow-2xl transition-all duration-300 ${showCounselorMenu ? 'bg-slate-800 hover:bg-slate-900' : 'bg-primary hover:bg-primary/90 hover:scale-110'}`}
                    onClick={() => setShowCounselorMenu(!showCounselorMenu)}
                >
                    {showCounselorMenu ? (
                        <X className="h-6 w-6 text-white" />
                    ) : (
                        <Bot className="h-7 w-7 text-white" />
                    )}
                </Button>
            </div>
        </div>
    )
}
