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
    Ticket
} from 'lucide-react'
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

interface Module {
    id: string
    title: string
    description: string
    orderIndex: number
    lessons: { id: string; title: string; duration: number }[]
}

interface SuggestedCourse {
    id: string
    title: string
    price: number
    discountPrice?: number
    bannerUrl?: string
    duration?: number
    difficulty?: string
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
    suggestedCourses?: SuggestedCourse[]
    mandatoryCourses?: SuggestedCourse[]
}
interface RelatedCourse {
    id: string
    title: string
    price: number
    discountPrice?: number
    bannerUrl?: string
    duration?: number
    difficulty?: string
}

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
    const [expandedModules, setExpandedModules] = React.useState<string[]>([])
    const [purchaseType, setPurchaseType] = React.useState<'COURSE_ONLY' | 'BUNDLE'>('COURSE_ONLY');
    const [selectedCourses, setSelectedCourses] = React.useState<SuggestedCourse[]>([])
    const [hasInitializedMandatoryCourses, setHasInitializedMandatoryCourses] = React.useState(false)
    const [couponName, setCouponName] = React.useState('')
    const [appliedCoupon, setAppliedCoupon] = React.useState<{
        name: string
        discountPercentage: number
        discountAmount: number
        finalAmount: number
    } | null>(null)
    const [isApplyingCoupon, setIsApplyingCoupon] = React.useState(false)
    const [couponMessage, setCouponMessage] = React.useState('')
    React.useEffect(() => {
        const fetchCourseData = async () => {
            try {
                const response = await courseApi.getById(params.id as string)
                setCourse({
                    ...response.data.course,
                    isEnrolled: response.data.isEnrolled
                })
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

    React.useEffect(() => {
        if (course && !hasInitializedMandatoryCourses && course.mandatoryCourses?.length) {
            setSelectedCourses(course.mandatoryCourses)
            setHasInitializedMandatoryCourses(true)
        }
    }, [course, hasInitializedMandatoryCourses])

    const [dialogMessage, setDialogMessage] = React.useState<{ title: string; desc: string; type: 'success' | 'error' } | null>(null)
    const [showRequestDialog, setShowRequestDialog] = React.useState(false)
    const [isRequesting, setIsRequesting] = React.useState(false)
    const [formData, setFormData] = React.useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        qualification: ''
    })
    const openInterestForm = () => {
        setShowRequestDialog(true)
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

    const handleBuy = async () => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }
        // Open Razorpay directly
        handleRazorpayPayment()
    }

    const getBasePrice = React.useCallback(() => {
        if (!course) return 0
        const base = purchaseType === 'BUNDLE'
            ? (course.bundlePrice ?? (Number(course.price) * 1.2))
            : (course.discountPrice ?? course.price)
        return Number(base) || 0
    }, [course, purchaseType])

    React.useEffect(() => {
        setAppliedCoupon(null)
        setCouponMessage('')
    }, [purchaseType, course?.id, selectedCourses.length])

    const selectedCoursesTotal = selectedCourses.reduce((total, selectedCourse) => {
        return total + Number(selectedCourse.discountPrice ?? selectedCourse.price ?? 0)
    }, 0)

    const basePrice = getBasePrice()
    const amountBeforeCoupon = Math.ceil(basePrice + selectedCoursesTotal)
    const paymentTotal = Math.ceil(appliedCoupon?.finalAmount ?? amountBeforeCoupon)

    const isCourseSelected = (relatedCourse: SuggestedCourse) =>
        selectedCourses.some(course => course.id === relatedCourse.id)

    const toggleSelectedCourse = (relatedCourse: SuggestedCourse) => {
        setSelectedCourses(prev => {
            if (prev.some(course => course.id === relatedCourse.id)) {
                return prev.filter(course => course.id !== relatedCourse.id)
            }
            return [...prev, relatedCourse]
        })
    }

    const removeSelectedCourse = (courseId: string) => {
        setSelectedCourses(prev => prev.filter(course => course.id !== courseId))
    }

    const handleApplyCoupon = async () => {
        if (!course || !couponName.trim()) return
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        setIsApplyingCoupon(true)
        setCouponMessage('')
        try {
            const { data } = await couponApi.validate({
                couponName: couponName,
                courseId: course.id,
                amount: amountBeforeCoupon
            })
            setAppliedCoupon({
                name: data.coupon.name,
                discountPercentage: data.coupon.discountPercentage,
                discountAmount: data.discountAmount,
                finalAmount: data.finalAmount
            })
            setCouponMessage('Coupon applied')
        } catch (error: unknown) {
            const apiError = error as ApiError
            setAppliedCoupon(null)
            setCouponMessage(apiError.response?.data?.error || 'Coupon could not be applied')
        } finally {
            setIsApplyingCoupon(false)
        }
    }

    const handleRazorpayPayment = async () => {
        setIsEnrolling(true)
        try {
            const currentPrice = appliedCoupon?.finalAmount ?? getBasePrice();

            // 1. Create Order with Type (send amount so backend can create razorpay order)
            const amountToCharge = Math.ceil(paymentTotal)
            const { data: order } = await paymentApi.createOrder(course!.id, purchaseType, amountToCharge, 'INR', appliedCoupon?.name, selectedCourses.map(c => c.id))

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
                    Back_to_Courses
                </Button>
            </div>
        )
    }

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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

                    <Card>


                        <CardContent>
                            {course.modules && course.modules.length > 0 ? (
                                <Accordion
                                    type="single"
                                    collapsible
                                    className="w-full"
                                >
                                    <AccordionItem
                                        value="curriculum"
                                        className="border rounded-lg px-4"
                                    >
                                        <AccordionTrigger className="hover:no-underline">
                                            <span className="font-medium">
                                                Course Curriculum
                                            </span>
                                        </AccordionTrigger>

                                        <AccordionContent>
                                            <div className="space-y-4 pt-4">
                                                {course.modules.map((module) => (
                                                    <div
                                                        key={module.id}
                                                        className="border rounded-lg p-4"
                                                    >
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                                                                {module.orderIndex + 1}
                                                            </div>

                                                            <h4 className="font-medium">
                                                                {module.title}
                                                            </h4>
                                                        </div>

                                                        <div className="space-y-2">
                                                            {module.lessons?.map((lesson) => (
                                                                <div
                                                                    key={lesson.id}
                                                                    className="flex items-center justify-between border rounded-md px-3 py-2 text-sm"
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <PlayCircle className="h-4 w-4 text-muted-foreground" />
                                                                        <span>{lesson.title}</span>
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
                                <p className="text-center py-8 text-muted-foreground">
                                    Curriculum coming soon
                                </p>
                            )}
                        </CardContent>
                    </Card>
                    {course.mandatoryCourses &&
                        course.mandatoryCourses.length > 0 && (
                            <Card className="mt-8">
                                <CardHeader>
                                    <CardTitle>Mandatory Courses</CardTitle>
                                    <CardDescription>
                                        These courses are required for this program.
                                    </CardDescription>
                                </CardHeader>

                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {course.mandatoryCourses.map((relatedCourse) => {
                                            const selected = isCourseSelected(relatedCourse)
                                            return (
                                                <div
                                                    key={relatedCourse.id}
                                                    className="rounded-xl p-3 transition-all cursor-pointer bg-blue-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 hover:shadow-md"
                                                    onClick={() => router.push(`/courses/${relatedCourse.id}`)}
                                                >
                                                    <div className="gap-3">

                                                        <div className="flex items-center justify-between mb-1.5">
                                                            <h4 className="font-semibold text-sm">
                                                                {relatedCourse.title}
                                                            </h4>
                                                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-800/40 dark:text-blue-300">Required</span>
                                                        </div>

                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                                            <span>{relatedCourse.duration || 0} hrs</span>
                                                            <span>{relatedCourse.difficulty}</span>
                                                        </div>

                                                        <div className="flex items-center justify-between gap-3">
                                                            <div>
                                                                <span className="font-bold text-sm">
                                                                    ₹{relatedCourse.discountPrice || relatedCourse.price}
                                                                </span>
                                                                {relatedCourse.discountPrice && (
                                                                    <span className="ml-2 text-xs line-through text-muted-foreground">
                                                                        ₹{relatedCourse.price}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <Button
                                                                variant="default"
                                                                className={`${selected ? 'bg-blue-600 text-white hover:bg-blue-700 border-0 px-3 py-1.5' : 'bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 px-3 py-1.5'} shrink-0 text-sm`}
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    toggleSelectedCourse(relatedCourse)
                                                                }}
                                                            >
                                                                {selected ? 'Added' : 'Add'}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    {course.suggestedCourses &&
                        course.suggestedCourses.length > 0 && (
                            <Card className="mt-8">
                                <CardHeader>
                                    <CardTitle>Recommended Courses</CardTitle>
                                    <CardDescription>
                                        Students also enroll in these courses
                                    </CardDescription>
                                </CardHeader>

                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {course.suggestedCourses.map((suggestedCourse) => {
                                            const selected = isCourseSelected(suggestedCourse)
                                            return (
                                                <div
                                                    key={suggestedCourse.id}
                                                    className="rounded-xl p-3 transition-all cursor-pointer bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-700 hover:shadow-md"
                                                    onClick={() => router.push(`/courses/${suggestedCourse.id}`)}
                                                >
                                                    <div className="gap-3">

                                                        <div className="flex items-center justify-between mb-1.5">
                                                            <h4 className="font-semibold text-sm">
                                                                {suggestedCourse.title}
                                                            </h4>
                                                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-800/40 dark:text-green-300">Recommended</span>
                                                        </div>

                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                                            <span>{suggestedCourse.duration || 0} hrs</span>
                                                            <span>{suggestedCourse.difficulty}</span>
                                                        </div>

                                                        <div className="flex items-center justify-between gap-3">
                                                            <div>
                                                                <span className="font-bold text-sm">
                                                                    ₹{suggestedCourse.discountPrice || suggestedCourse.price}
                                                                </span>

                                                                {suggestedCourse.discountPrice && (
                                                                    <span className="ml-2 text-xs line-through text-muted-foreground">
                                                                        ₹{suggestedCourse.price}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <Button
                                                                variant="default"
                                                                className={`${selected ? 'bg-green-600 text-white hover:bg-green-700 border-0 px-3 py-1.5' : 'bg-white border border-green-600 text-green-600 hover:bg-green-50 px-3 py-1.5'} shrink-0 text-sm`}
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    toggleSelectedCourse(suggestedCourse)
                                                                }}
                                                            >
                                                                {selected ? 'Added' : 'Add'}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                       
                </div>

                <div className="lg:col-span-1">
                    <Card className="sticky top-24">
                        <CardContent className="pt-6">
                            {course.hasInterviewPrep && !course.isEnrolled && (
                                <div className="mb-6 p-4 bg-muted/50 rounded-lg space-y-3">
                                    <div
                                        className={`flex items-center justify-between p-3 rounded border cursor-pointer ${purchaseType === 'COURSE_ONLY' ? 'border-primary bg-primary/5' : 'border-border'}`}
                                        onClick={() => setPurchaseType('COURSE_ONLY')}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${purchaseType === 'COURSE_ONLY' ? 'border-primary' : 'border-muted-foreground'}`}>
                                                {purchaseType === 'COURSE_ONLY' && <div className="h-2 w-2 rounded-full bg-primary" />}
                                            </div>
                                            <span className="font-medium">Course Only</span>
                                        </div>
                                        <span className="font-bold">₹{course.price}</span>
                                    </div>

                                    <div
                                        className={`flex items-center justify-between p-3 rounded border cursor-pointer ${purchaseType === 'BUNDLE' ? 'border-purple-500 bg-purple-50' : 'border-border'}`}
                                        onClick={() => setPurchaseType('BUNDLE')}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${purchaseType === 'BUNDLE' ? 'border-purple-500' : 'border-muted-foreground'}`}>
                                                {purchaseType === 'BUNDLE' && <div className="h-2 w-2 rounded-full bg-purple-500" />}
                                            </div>
                                            <div>
                                                <span className="font-medium block">Complete Bundle</span>
                                                <span className="text-xs text-green-600 font-medium">Includes AI Interview Prep</span>
                                            </div>
                                        </div>
                                        <span className="font-bold text-purple-700">₹{course.bundlePrice || (course.price * 1.2)}</span>
                                    </div>
                                </div>
                            )}

                            <div className="mb-3 space-y-1">
                                <div className="text-sm text-muted-foreground flex items-center justify-between">
                                    <span>{purchaseType === 'BUNDLE' ? 'Bundle Price' : 'Course Price'}</span>
                                    <span className="font-bold">₹{basePrice}</span>
                                </div>
                                {selectedCourses.length > 0 && (
                                    <div className="text-sm text-muted-foreground flex items-center justify-between">
                                        <span>Additional Course Total</span>
                                        <span className="font-bold">₹{selectedCoursesTotal}</span>
                                    </div>
                                )}
                                <div className="text-3xl font-bold">
                                    {paymentTotal === 0 ? 'Free' : `Rs. ${paymentTotal}`}
                                </div>
                                {appliedCoupon && (
                                    <div className="text-sm text-muted-foreground">
                                        <span className="line-through">Rs. {amountBeforeCoupon}</span>
                                        <span className="ml-2 text-green-600">
                                            Saved Rs. {amountBeforeCoupon - paymentTotal}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="mb-3 rounded-lg border bg-muted/30 p-2.5">
                                <div className="mb-2 text-sm font-semibold">Payment Summary</div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span>{course.title}</span>
                                        <span className="font-semibold">₹{basePrice}</span>
                                    </div>

                                    {selectedCourses.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="text-sm text-muted-foreground">Additional Courses</div>
                                            {selectedCourses.map((selectedCourse) => (
                                                <div key={selectedCourse.id} className="flex items-center justify-between gap-3 text-sm">
                                                    <div className="space-y-1">
                                                        <div>{selectedCourse.title}</div>
                                                        <button
                                                            type="button"
                                                            className="text-xs text-red-600 hover:text-red-800"
                                                            onClick={() => removeSelectedCourse(selectedCourse.id)}
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                    <span className="font-semibold">₹{selectedCourse.discountPrice || selectedCourse.price}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="border-t pt-2 flex items-center justify-between text-sm font-semibold">
                                        <span>Total Payable</span>
                                        <span>₹{paymentTotal}</span>
                                    </div>
                                </div>
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
                                    <div className="rounded-lg border bg-muted/30 p-3">
                                        <Label htmlFor="coupon" className="mb-2 flex items-center gap-2 text-sm font-medium">
                                            <Ticket className="h-4 w-4" />
                                            Coupon
                                        </Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="coupon"
                                                value={couponName}
                                                onChange={(event) => {
                                                    setCouponName(event.target.value)
                                                    setAppliedCoupon(null)
                                                    setCouponMessage('')
                                                }}
                                                placeholder="Enter coupon name"
                                                className="h-10"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleApplyCoupon}
                                                disabled={isApplyingCoupon || !couponName.trim()}
                                            >
                                                {isApplyingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                                            </Button>
                                        </div>
                                        {couponMessage && (
                                            <p className={`mt-2 text-xs ${appliedCoupon ? 'text-green-600' : 'text-destructive'}`}>
                                                {couponMessage}
                                                {appliedCoupon ? `: ${appliedCoupon.discountPercentage}% off` : ''}
                                            </p>
                                        )}
                                    </div>
                                    <Button
                                        className={`w-full min-h-[3.25rem] py-3.5 ${purchaseType === 'BUNDLE' ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                                        size="lg"
                                        onClick={handleBuy}
                                        disabled={isEnrolling}
                                    >
                                        {isEnrolling ? (
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        ) : (
                                            <CreditCard className="mr-2 h-5 w-5" />
                                        )}
                                        {isEnrolling ? 'Processing...' : (paymentTotal === 0 ? 'Enroll for Free' : `Enroll ${purchaseType === 'BUNDLE' ? 'Bundle' : 'Now'}`)}
                                    </Button>
                                </div>
                            )}

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span>For Admission & Confirmation</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span>Learn from industry experts</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span>Practical projects for real-world skills</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span>Certificate of completion</span>
                                </div>
                                {purchaseType === 'BUNDLE' && (
                                    <div className="flex items-center gap-2 font-medium text-purple-700">
                                        <Star className="h-4 w-4" />
                                        <span>Unlimited AI Mock Interviews</span>
                                    </div>
                                )}
                            </div>

                            {course.instructor && (
                                <div className="mt-4 pt-4 border-t">
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
