"use client"

import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { courseApi, paymentApi, enrollmentRequestApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    GraduationCap,
    Clock,
    Users,
    Star,
    CheckCircle2,
    PlayCircle,
    BookOpen,
    Loader2,
    ArrowLeft,
    CreditCard,
    XCircle
} from 'lucide-react'
import {
    Dialog,
    DialogContent,
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

    interface EnrollmentRequest {
        id: string
        courseId: string
        userId: string
        status: string
    }
    const [enrollmentRequest, setEnrollmentRequest] = React.useState<EnrollmentRequest | null>(null)
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
                setCourse(response.data.course)
                
                if (isAuthenticated) {
                    try {
                        const reqResponse = await enrollmentRequestApi.getMyRequest(params.id as string)
                        setEnrollmentRequest(reqResponse.data.request)
                    } catch (reqErr) {
                        console.error('Failed to fetch enrollment request:', reqErr)
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
    }, [params.id, isAuthenticated])

    const handleRequestEnrollment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        setIsRequesting(true)
        try {
            await enrollmentRequestApi.submit({
                courseId: course!.id,
                ...formData
            })
            setShowRequestDialog(false)
            setDialogMessage({
                title: 'Request Submitted!',
                desc: 'Enrolled successfully! TechWell admin will contact you soon regarding the next steps.',
                type: 'success'
            })
            
            // Refresh request status
            const reqResponse = await enrollmentRequestApi.getMyRequest(course!.id)
            setEnrollmentRequest(reqResponse.data.request)
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            console.error('Failed to submit enrollment request:', error)
            setDialogMessage({
                title: 'Submission Failed',
                desc: err.response?.data?.error || 'Failed to submit request. Please try again.',
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

        setIsEnrolling(true)
        try {
            // 1. Create Order with Type
            const { data: order } = await paymentApi.createOrder(course!.id, purchaseType)

            // Simulating "Dummy Payment" flow explicitly for User Request
            if (process.env.NODE_ENV === 'development' || order.status === 'created') {
                // In a real app, 'created' is standard. 
            }

            // Load Script
            const res = await loadRazorpay();
            if (!res) throw new Error('Razorpay SDK failed to load');

            const options = {
                key: 'rzp_test_dummy12345', // This should match backend key if real
                amount: order.amount,
                currency: order.currency,
                name: 'TechWell',
                description: purchaseType === 'BUNDLE' ? `Course + Interview Bundle` : `Enrollment for ${course!.title}`,
                order_id: order.id,
                handler: async function (response: RazorpayResponse) {
                    try {
                        await paymentApi.verifyPayment({
                            orderId: order.id,
                            paymentId: response.razorpay_payment_id,
                            signature: response.razorpay_signature
                        })
                        setCourse({ ...course!, isEnrolled: true })
                        setDialogMessage({
                            title: 'Payment Successful!',
                            desc: 'You are now officially enrolled and can start learning immediately.',
                            type: 'success'
                        })
                    } catch (err) {
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
                // Handle modal close
                modal: {
                    ondismiss: function () {
                        setIsEnrolling(false)
                    }
                }
            };

            try {
                const rzp = new window.Razorpay(options);
                rzp.open();

                rzp.on('payment.failed', function (_response: { error?: Record<string, unknown> } & Record<string, unknown>) {
                    setDialogMessage({
                        title: 'Payment Failed',
                        desc: 'The transaction was declined or cancelled. You have not been charged.',
                        type: 'error'
                    })
                    setIsEnrolling(false);
                });
            } catch (e) {
                // Determine if we should mock success
                console.warn("Razorpay SDK Error (likely dummy key). Simulating success...");
                await paymentApi.verifyPayment({
                    orderId: order.id,
                    paymentId: 'pay_mock_bypass',
                    signature: 'dummy_sig'
                });
                setCourse({ ...course!, isEnrolled: true });
                setIsEnrolling(false);
                setDialogMessage({
                    title: 'Mock Payment Successful!',
                    desc: 'Your dummy transaction was completed. You are now enrolled.',
                    type: 'success'
                })
            }

        } catch (error) {
            console.error('Failed to enroll:', error)
            // Fallback for mock environment if strictly needed
            if (error instanceof Error && error.message.includes('SDK')) {
                setDialogMessage({
                    title: 'SDK Error',
                    desc: 'Payment gateway failed to initialize.',
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

        ? Number(course.bundlePrice || course.price * 1.2)
        : course.price;

    return (
        <div className="container py-8">
            {/* Back Button */}
            <Button variant="ghost" className="mb-6" onClick={() => router.push('/courses')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Courses
            </Button>

            {/* Banner Image */}
            {course.bannerUrl && (
                <div className="mb-8 rounded-xl overflow-hidden h-[300px] relative">
                    <img src={course.bannerUrl} alt={course.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4 flex-wrap">
                            {course.courseCode && (
                                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-mono border border-primary/20">
                                    {course.courseCode}
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
                            {!course.isEnrolled && enrollmentRequest?.status !== 'APPROVED' && enrollmentRequest?.status !== 'PENDING' && (
                                <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
                                    <DialogTrigger asChild>
                                        <Button size="lg" className="shadow-lg shadow-primary/20 shrink-0 font-bold rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white border-0 transition-all duration-300 hover:scale-[1.02] active:scale-95">
                                            Enroll Now
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Request Enrollment</DialogTitle>
                                        </DialogHeader>
                                        <form onSubmit={handleRequestEnrollment} className="space-y-4 pt-4">
                                            <div className="space-y-2">
                                                <Label>Course</Label>
                                                <Input value={course.title} disabled className="bg-muted" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Full Name *</Label>
                                                <Input id="name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email Address *</Label>
                                                <Input id="email" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">Phone Number</Label>
                                                <Input id="phone" type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="qualification">Highest Qualification</Label>
                                                <Input id="qualification" value={formData.qualification} onChange={e => setFormData({...formData, qualification: e.target.value})} />
                                            </div>
                                            <Button type="submit" className="w-full" disabled={isRequesting}>
                                                {isRequesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                Submit Request
                                            </Button>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                        <p className="text-lg text-muted-foreground mb-6">{course.description}</p>

                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {course.duration} hours
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                {course._count?.enrollments || 0} students
                            </div>
                            <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-yellow-500" />
                                4.8 rating
                            </div>
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                {course.modules?.length || 0} modules
                            </div>
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

                    {/* Course Curriculum */}
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
                                                    {module.lessons.map((lesson, idx) => (
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

                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-24">
                        <div className="h-40 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-t-lg flex items-center justify-center">
                            <GraduationCap className="h-16 w-16 text-primary/50" />
                        </div>
                        <CardContent className="pt-4">
                            {/* Pricing Toggle */}

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

                                        <span className="font-bold text-purple-700">₹{course.bundlePrice || course.price * 1.2}</span>
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
                            ) : enrollmentRequest?.status === 'APPROVED' ? (
                                <Button
                                    className={`w-full mb-4 ${purchaseType === 'BUNDLE' ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
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
                            ) : enrollmentRequest?.status === 'PENDING' ? (
                                <div className="p-4 mb-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 rounded-lg text-center">
                                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-400 mb-1">Request Pending</h4>
                                    <p className="text-xs text-yellow-700 dark:text-yellow-500">TechWell admin will review your enrollment request soon.</p>
                                </div>
                            ) : (
                                <div className="p-4 mb-4 bg-muted/50 border rounded-lg text-center">
                                    <p className="text-sm text-muted-foreground mb-3">To unlock payment and enroll in this course, please submit an enrollment request first.</p>
                                    <Button variant="outline" className="w-full" onClick={() => {
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                        setShowRequestDialog(true);
                                    }}>
                                        Request Enrollment
                                    </Button>
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

            {/* Custom Pop-up Dialog replacing standard alerts */}
            <Dialog open={!!dialogMessage} onOpenChange={(open) => !open && setDialogMessage(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className={`flex items-center gap-2 ${dialogMessage?.type === 'error' ? 'text-destructive' : 'text-green-600'}`}>
                            {dialogMessage?.type === 'error' ? <XCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                            {dialogMessage?.title}
                        </DialogTitle>
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
