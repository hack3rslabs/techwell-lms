"use client"

import * as React from 'react'
import Image from 'next/image'
import { useRouter, useParams } from 'next/navigation'
import { courseApi, paymentApi, leadApi } from '@/lib/api'
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
    XCircle
} from 'lucide-react'
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
    const [isRequesting, setIsRequesting] = React.useState(false)
    const [showRequestDialog, setShowRequestDialog] = React.useState(false)
    const [dialogMessage, setDialogMessage] = React.useState<{ title: string; desc: string; type: 'success' | 'error' } | null>(null)
    const [formData, setFormData] = React.useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        qualification: user?.qualification || ''
    })

    React.useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || prev.name,
                email: user.email || prev.email,
                phone: user.phone || prev.phone,
                qualification: user.qualification || prev.qualification
            }))
        }
    }, [user])

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

    const handleEnrollInterest = async (e: React.FormEvent) => {
        e.preventDefault()

        setIsRequesting(true)
        try {
            await leadApi.capture({
                courseId: course!.id,
                courseTitle: course!.title,
                ...formData
            })
            setShowRequestDialog(false)
            setDialogMessage({
                title: 'Interest Submitted!',
                desc: 'Your details have been added to Leads. Our TechWell team will contact you soon.',
                type: 'success'
            })
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            console.error('Failed to submit enrollment interest:', error)
            setDialogMessage({
                title: 'Submission Failed',
                desc: err.response?.data?.error || 'Failed to submit details. Please try again or use Buy Now.',
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

    const handleRazorpayPayment = async () => {
        setIsEnrolling(true)
        try {
            const currentPrice = purchaseType === 'BUNDLE' 
                ? (course!.bundlePrice || (course!.price * 1.2)) 
                : (course!.discountPrice || course!.price);

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
                name: 'TechWell',
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
        <div className="container py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                                                Submit your details to Leads and our team will help you with the next steps.
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
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>{course._count?.enrollments || 0} students enrolled</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <PlayCircle className="h-4 w-4" />
                                <span>{course.duration} hours content</span>
                            </div>
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
                            <CardDescription>
                                {course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0} lessons
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {course.modules && course.modules.length > 0 ? (
                                <div className="space-y-4">
                                    {course.modules.map((module) => (
                                        <div key={module.id} className="border rounded-lg">
                                            <button
                                                onClick={() => toggleModule(module.id)}
                                                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                                                        {module.orderIndex + 1}
                                                    </div>
                                                    <div className="text-left">
                                                        <h4 className="font-medium">{module.title}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {module.lessons?.length || 0} lessons
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="text-muted-foreground">
                                                    {expandedModules.includes(module.id) ? '−' : '+'}
                                                </span>
                                            </button>
                                            {expandedModules.includes(module.id) && module.lessons && (
                                                <div className="border-t px-4 py-2">
                                                    {module.lessons.map((lesson) => (
                                                        <div key={lesson.id} className="flex items-center justify-between py-2 text-sm">
                                                            <div className="flex items-center gap-3">
                                                                <PlayCircle className="h-4 w-4 text-muted-foreground" />
                                                                <span>{lesson.title}</span>
                                                            </div>
                                                            <span className="text-muted-foreground">{lesson.duration}m</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-center py-8">
                                    Curriculum coming soon
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1">
                    <Card className="sticky top-24">
                        <div className="h-40 relative bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-t-lg flex items-center justify-center overflow-hidden">
                            {course.thumbnail ? (
                                <Image
                                    src={getFullImageUrl(course.thumbnail)}
                                    alt={course.title}
                                    width={400}
                                    height={160}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        target.parentElement?.classList.remove('overflow-hidden');
                                        const icon = target.nextElementSibling as HTMLElement;
                                        if (icon) icon.style.display = 'block';
                                    }}
                                />
                            ) : null}
                            <GraduationCap className={`h-16 w-16 text-primary/50 ${course.thumbnail ? 'hidden' : ''}`} />
                        </div>
                        <CardContent className="pt-4">
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

                            <div className="text-3xl font-bold mb-4">
                                {course.discountPrice && course.discountPrice > 0 ? (
                                    <>
                                        ₹{purchaseType === 'BUNDLE' ? Number(course.bundlePrice || course.price * 1.2) : course.discountPrice}
                                        <span className="text-sm font-normal text-muted-foreground ml-2 line-through">
                                            ₹{purchaseType === 'BUNDLE' ? Number(course.price) * 1.5 : course.price}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        {currentPrice === 0 ? 'Free' : `₹${currentPrice}`}
                                        {purchaseType === 'BUNDLE' && <span className="text-sm font-normal text-muted-foreground ml-2 line-through">₹{Number(course.price) * 1.5}</span>}
                                    </>
                                )}
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
                                    
                                    <Button 
                                        variant="outline" 
                                        className="w-full" 
                                        onClick={() => {
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                            setShowRequestDialog(true);
                                        }}
                                    >
                                        Talk to an Advisor
                                    </Button>
                                    <p className="text-xs text-center text-muted-foreground mt-1">
                                        Interested but not ready to pay? We will add you to Leads and call you.
                                    </p>
                                </div>
                            )}

                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span>Full lifetime access</span>
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
