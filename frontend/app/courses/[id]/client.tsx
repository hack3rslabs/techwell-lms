"use client"

import * as React from 'react'
import Image from 'next/image'
import { useRouter, useParams } from 'next/navigation'
import { courseApi, paymentApi, leadApi, couponApi } from '@/lib/api'
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
    ChevronDown,
    Plus,
    CheckCircle,
    Tag,
    Percent,
    X
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
    suggestedCourseIds?: string[]
    mandatoryCourseIds?: string[]
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
    const [isLoading, setIsLoading] = React.useState(true)
    const [isEnrolling, setIsEnrolling] = React.useState(false)
    const [selectedExtraCourses, setSelectedExtraCourses] = React.useState<Course[]>([])
    const [suggestedCoursesData, setSuggestedCoursesData] = React.useState<Course[]>([])
    const [mandatoryCoursesData, setMandatoryCoursesData] = React.useState<Course[]>([])
    const [expandedModules, setExpandedModules] = React.useState<string[]>([])
    const [showCurriculum, setShowCurriculum] = React.useState(true)
    const [purchaseType, setPurchaseType] = React.useState<'COURSE_ONLY' | 'BUNDLE'>('COURSE_ONLY');
    // Coupon state
    const [couponCode, setCouponCode] = React.useState('')
    const [couponLoading, setCouponLoading] = React.useState(false)
    const [couponError, setCouponError] = React.useState<string | null>(null)
    const [appliedCoupon, setAppliedCoupon] = React.useState<{
        code: string;
        discountPercentage: number;
    } | null>(null)
    React.useEffect(() => {
        const fetchCourseData = async () => {
            try {
                const response = await courseApi.getById(params.id as string)
                setCourse({
                    ...response.data.course,
                    isEnrolled: response.data.isEnrolled
                })
                // After fetching the main course:
                if (response.data.course.suggestedCourseIds?.length > 0) {
                    try {
                        const suggestedPromises = response.data.course.suggestedCourseIds.map(async (id: string) => {
                            try {
                                const r = await courseApi.getById(id)
                                return r.data.course
                            } catch (e) {
                                console.error(`Failed to fetch suggested course ${id}:`, e)
                                return null
                            }
                        })
                        const suggested = await Promise.all(suggestedPromises)
                        setSuggestedCoursesData(suggested.filter(Boolean))
                    } catch (e) {
                        console.error('Failed to fetch suggested courses:', e)
                    }
                } else {
                    console.log('[DEBUG] No suggestedCourseIds found in response');
                }

                if (response.data.course.mandatoryCourseIds?.length > 0) {
                    try {
                        const mandatoryPromises = response.data.course.mandatoryCourseIds.map(async (id: string) => {
                            try {
                                const r = await courseApi.getById(id)
                                return r.data.course
                            } catch (e) {
                                console.error(`Failed to fetch mandatory course ${id}:`, e)
                                return null
                            }
                        })
                        const mandatory = (await Promise.all(mandatoryPromises)).filter(Boolean) as Course[]
                        setMandatoryCoursesData(mandatory)
                        // Automatically add mandatory courses to the selected list
                        setSelectedExtraCourses(mandatory)
                    } catch (e) {
                        console.error('Failed to fetch mandatory courses:', e)
                    }
                }

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
    const [isRequesting, setIsRequesting] = React.useState(false)
    const [formData, setFormData] = React.useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        qualification: ''
    })

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

    React.useEffect(() => {
        if (selectedExtraCourses.length > 0) {
            setPurchaseType('BUNDLE')
        } else {
            setPurchaseType('COURSE_ONLY')
        }
    }, [selectedExtraCourses])

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

    const handleApplyCoupon = async () => {
        if (!couponCode.trim() || !course) return
        setCouponLoading(true)
        setCouponError(null)
        try {
            const basePrice = Number(course.discountPrice || course.price) +
                selectedExtraCourses.reduce((acc, c) => acc + Number(c.discountPrice || c.price), 0)
            const { data } = await couponApi.validate(couponCode.trim(), course.id, basePrice)
            if (data.valid) {
                setAppliedCoupon({
                    code: data.couponName,
                    discountPercentage: data.discountPercentage
                })
                setCouponCode('')
            } else {
                setCouponError(data.error || 'Invalid coupon code.')
            }
        } catch (err: unknown) {
            const e = err as { response?: { data?: { error?: string } } }
            setCouponError(e?.response?.data?.error || 'Coupon validation failed. Please try again.')
        } finally {
            setCouponLoading(false)
        }
    }

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null)
        setCouponError(null)
        setCouponCode('')
    }

    const handleBuy = async () => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        // Open Razorpay directly
        handleRazorpayPayment()
    }

    const handleRazorpayPayment = async () => {
        setIsEnrolling(true)
        try {
            const baseTotal = Number(course!.discountPrice || course!.price) + selectedExtraCourses.reduce((acc, c) => acc + Number(c.discountPrice || c.price), 0);
            const totalToPay = appliedCoupon
                ? parseFloat((baseTotal - (baseTotal * appliedCoupon.discountPercentage) / 100).toFixed(2))
                : baseTotal;
            const additionalIds = selectedExtraCourses.map(c => c.id);

            // 1. Create Order with Type and ALL course IDs
            const { data: order } = await paymentApi.createOrder(
                course!.id, 
                purchaseType, 
                totalToPay, 
                'INR',
                additionalIds
            )

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

    const currentPrice = purchaseType === 'BUNDLE'
        ? (course.bundlePrice || (course.price * 1.2))
        : (course.discountPrice || course.price);

    return (
        <div className="container py-6">
            {/* Course Banner */}
            <div 
                onClick={() => setShowRequestDialog(true)}
                className="relative w-full aspect-[12/4] mb-10 rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 group bg-muted flex items-center justify-center cursor-pointer hover:shadow-primary/20 transition-all duration-300"
            >
                <GraduationCap className="h-24 w-24 text-primary/10 absolute z-0" />
                {course.bannerUrl && (
                    <Image
                        src={getFullImageUrl(course.bannerUrl)}
                        alt={`${course.title} Banner`}
                        fill
                        unoptimized
                        className="object-cover transition-all duration-700 group-hover:scale-[1.03] z-10"
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
                            <span className="text-sm text-muted-foreground">{course.category}</span>
                            {course.duration > 0 && (
                                <div className="flex items-center gap-2">
                                    <PlayCircle className="h-4 w-4" />
                                    <span>{course.duration} {course.duration === 1 ? 'Hour' : 'Hours'}</span>
                                </div>
                            )}

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
                                <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
                                    <DialogTrigger asChild>
                                        <Button size="lg" className="shadow-lg shadow-primary/20 shrink-0 font-bold rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white border-0 transition-all duration-300 hover:scale-[1.02] active:scale-95">
                                            Share Interest
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
                            )}
                        </div>
                        <p className="text-lg text-muted-foreground mb-6">{course.description}</p>

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

                    <Card className="overflow-hidden">
                        <CardHeader
                            className="cursor-pointer hover:bg-muted/30 transition-colors select-none"
                            onClick={() => setShowCurriculum(!showCurriculum)}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Course Curriculum</CardTitle>
                                    <CardDescription>
                                        {course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0} lessons
                                    </CardDescription>
                                </div>
                                <div className={`p-2 rounded-full transition-transform duration-300 ${showCurriculum ? 'rotate-180 bg-muted' : ''}`}>
                                    <ChevronDown className="h-5 w-5" />
                                </div>
                            </div>
                        </CardHeader>
                        {showCurriculum && (
                            <CardContent className="animate-in fade-in slide-in-from-top-1 duration-300">
                                {course.modules && course.modules.length > 0 && (
                                    <div className="space-y-4">
                                        {course.modules.map((module) => (
                                            <div key={module.id} className="border rounded-lg">
                                                <button
                                                    onClick={() => toggleModule(module.id)}
                                                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-all duration-200"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary border border-primary/20 group-hover:bg-primary group-hover:text-white transition-colors">
                                                            {module.orderIndex + 1}
                                                        </div>
                                                        <div className="text-left">
                                                            <h4 className="font-bold text-base leading-tight">{module.title}</h4>
                                                            <p className="text-xs text-muted-foreground mt-1 font-medium">
                                                                {module.lessons?.length || 0} lessons • {module.lessons?.reduce((acc, l) => acc + (l.duration || 0), 0) || 0}m total
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className={`p-2 rounded-full hover:bg-background transition-transform duration-300 ${expandedModules.includes(module.id) ? 'rotate-180 bg-background shadow-sm' : ''}`}>
                                                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                </button>
                                                {expandedModules.includes(module.id) && module.lessons && (
                                                    <div className="border-t bg-muted/20 px-4 py-2 divide-y divide-border/50">
                                                        {module.lessons.map((lesson, lIdx) => (
                                                            <div key={lesson.id} className="flex items-center justify-between py-3 px-2 text-sm hover:bg-background/50 rounded-lg transition-colors group">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-6 w-6 rounded-full bg-background border flex items-center justify-center text-[10px] font-bold text-muted-foreground group-hover:border-primary group-hover:text-primary transition-colors">
                                                                        {lIdx + 1}
                                                                    </div>
                                                                    <PlayCircle className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                                                    <span className="font-medium">{lesson.title}</span>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded border border-border/50">
                                                                        {lesson.duration}m
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        )}
                    </Card>


                    {/* Suggested Courses Section - Standalone Card */}
                    {suggestedCoursesData.length > 0 && (
                        <Card className="mt-2  shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {/* <CardHeader className="bg-muted/50 border-b"> */}
                                {/* <CardTitle className="text-xl flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Star className="h-5 w-5 text-primary" />
                                    </div>
                                    Recommended Add-ons
                                </CardTitle> */}
                                {/* <CardDescription>Enhance your learning path with these related courses at special bundle prices.</CardDescription> */}
                            {/* </CardHeader> */}
                            <CardContent className="p-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {suggestedCoursesData.map(c => (
                                        <div 
                                            key={c.id} 
                                            onClick={() => router.push(`/courses/${c.id}`)}
                                            className="group relative flex flex-col justify-between p-5 bg-background border-2 border-transparent hover:border-primary/20 rounded-2xl hover:shadow-xl transition-all duration-300 cursor-pointer"
                                        >
                                            <div className="mb-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-bold text-base group-hover:text-primary transition-colors">{c.title}</h4>
                                                    <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10">
                                                        ₹{c.discountPrice || c.price}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground line-clamp-2">
                                                    Complete your skill set by adding this course to your bundle.
                                                </p>
                                            </div>
                                            <Button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedExtraCourses([...selectedExtraCourses, c]);
                                                }}
                                                disabled={selectedExtraCourses.some(sc => sc.id === c.id)}
                                                className={`w-full rounded-xl font-bold ${
                                                    selectedExtraCourses.some(sc => sc.id === c.id) 
                                                    ? "bg-secondary text-secondary-foreground" 
                                                    : "shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                                                }`}
                                            >
                                                {selectedExtraCourses.some(sc => sc.id === c.id) ? (
                                                    <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Added to Bundle</span>
                                                ) : (
                                                    <span className="flex items-center gap-2"><Plus className="h-4 w-4" /> Add to My Bundle</span>
                                                )}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    
                    {/* Fallback Debug Info (Only if IDs exist but data is empty) */}
                    {(!suggestedCoursesData || suggestedCoursesData.length === 0) && course?.suggestedCourseIds && course.suggestedCourseIds.length > 0 && (
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-xs flex items-center gap-2">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Synchronizing recommended courses... (Found {course.suggestedCourseIds.length} suggestions)
                        </div>
                    )}

                </div>

                <div className="lg:col-span-1">
                    <Card className="sticky top-24 shadow-xl border-primary/10 overflow-hidden">
                        {/* Image removed as requested */}
                        <CardContent className="pt-6">
                            <div className="space-y-4 mb-6">
                                <h3 className="font-bold text-lg border-b pb-2">Order Summary</h3>
                                
                                {/* Main Course */}
                                <div className="flex justify-between items-start gap-4">
                                    <div className="text-sm font-medium">
                                        <p>{course.title}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Primary Course</p>
                                    </div>
                                    <span className="font-bold whitespace-nowrap">₹{course.discountPrice || course.price}</span>
                                </div>

                                {/* Extra Courses (Mandatory + Added Suggested) */}
                                {selectedExtraCourses.map(extra => (
                                    <div 
                                        key={extra.id} 
                                        onClick={() => router.push(`/courses/${extra.id}`)}
                                        className="flex justify-between items-center gap-4 bg-muted/30 p-2 rounded-lg group cursor-pointer hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-6 w-6 text-destructive hover:bg-destructive/10 shrink-0"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedExtraCourses(selectedExtraCourses.filter(sc => sc.id !== extra.id));
                                                }}
                                            >
                                                <XCircle className="h-4 w-4" />
                                            </Button>
                                            <div className="overflow-hidden">
                                                <p className="text-xs font-medium truncate">{extra.title}</p>
                                                {mandatoryCoursesData.some(mc => mc.id === extra.id) && (
                                                    <p className="text-[9px] text-orange-600 font-bold uppercase">Required</p>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold whitespace-nowrap">₹{extra.discountPrice || extra.price}</span>
                                    </div>
                                ))}

                                {/* Coupon Apply Section */}
                                <div className="pt-3 border-t">
                                    {!appliedCoupon ? (
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                                <Tag className="h-3.5 w-3.5" />
                                                Apply Coupon
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    id="coupon-input"
                                                    type="text"
                                                    value={couponCode}
                                                    onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(null); }}
                                                    onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                                                    placeholder="Enter coupon code"
                                                    className="flex-1 h-9 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all uppercase placeholder:normal-case placeholder:text-muted-foreground"
                                                    disabled={couponLoading}
                                                />
                                                <button
                                                    id="apply-coupon-btn"
                                                    onClick={handleApplyCoupon}
                                                    disabled={!couponCode.trim() || couponLoading}
                                                    className="h-9 px-4 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shrink-0"
                                                >
                                                    {couponLoading ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    ) : 'Apply'}
                                                </button>
                                            </div>
                                            {couponError && (
                                                <p className="flex items-center gap-1.5 text-xs text-destructive font-medium">
                                                    <XCircle className="h-3.5 w-3.5 shrink-0" />
                                                    {couponError}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-green-100 dark:bg-green-800/50 rounded-lg">
                                                        <Percent className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-green-700 dark:text-green-300">{appliedCoupon.code}</p>
                                                        <p className="text-[10px] text-green-600 dark:text-green-400">{appliedCoupon.discountPercentage}% discount applied</p>
                                                    </div>
                                                </div>
                                                <button
                                                    id="remove-coupon-btn"
                                                    onClick={handleRemoveCoupon}
                                                    className="p-1 rounded-full hover:bg-green-200 dark:hover:bg-green-700/50 transition-colors"
                                                    aria-label="Remove coupon"
                                                >
                                                    <X className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Price Breakdown — always computed live from current cart */}
                                {(() => {
                                    const liveBase = Number(course.discountPrice || course.price) + selectedExtraCourses.reduce((acc, c) => acc + Number(c.discountPrice || c.price), 0);
                                    const liveDiscount = appliedCoupon ? parseFloat(((liveBase * appliedCoupon.discountPercentage) / 100).toFixed(2)) : 0;
                                    const liveFinal = appliedCoupon ? parseFloat((liveBase - liveDiscount).toFixed(2)) : liveBase;
                                    return (
                                        <div className="pt-3 border-t-2 border-dashed space-y-1.5">
                                            {appliedCoupon ? (
                                                <>
                                                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                                                        <span>Original Price</span>
                                                        <span className="line-through">₹{liveBase}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-sm text-green-600 dark:text-green-400 font-medium">
                                                        <span>Discount ({appliedCoupon.discountPercentage}%)</span>
                                                        <span>- ₹{liveDiscount}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center pt-1.5 border-t border-dashed">
                                                        <span className="font-bold text-base">Final Amount</span>
                                                        <span className="text-2xl font-black text-primary">₹{liveFinal}</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex justify-between items-center">
                                                    <span className="font-bold text-base">Total Amount</span>
                                                    <span className="text-2xl font-black text-primary">₹{liveBase}</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>

                            {course.isEnrolled ? (
                                <Button
                                    className="w-full mb-4 shadow-lg shadow-primary/25"
                                    size="lg"
                                    onClick={() => router.push(`/courses/${course.id}/learn`)}
                                >
                                    <PlayCircle className="mr-2 h-5 w-5" />
                                    Start Learning
                                </Button>
                            ) : (
                                <div className="space-y-3 mb-4">
                                    <Button
                                        className={`w-full ${purchaseType === 'BUNDLE' ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                                        size="lg"
                                        onClick={handleBuy}
                                        disabled={isEnrolling}
                                    >
                                        {isEnrolling ? (
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        ) : (
                                            <CreditCard className="mr-2 h-5 w-5" />
                                        )}
                                        {isEnrolling ? 'Processing...' : (currentPrice === 0 ? 'Enroll for Free' : `Buy ${purchaseType === 'BUNDLE' ? 'Bundle' : 'Now'}`)}
                                    </Button>
                                </div>
                            )}

                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span>Hands-on projects </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span>Certificate of completion</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span>Practical Exercises</span>
                                </div>
                                {purchaseType === 'BUNDLE' && (
                                    <div className="flex items-center gap-2 font-medium text-purple-700">
                                        <Star className="h-4 w-4" />
                                        <span>Unlimited AI Mock Interviews</span>
                                    </div>
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
        </div>
    )
}
