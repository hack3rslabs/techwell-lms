"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { couponApi, courseApi } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import {
    CalendarDays,
    Loader2,
    Percent,
    Plus,
    Ticket,
    Trash2
} from "lucide-react"

interface CourseOption {
    id: string
    title: string
    price: number
    isPublished: boolean
}

interface Coupon {
    id: string
    couponName: string
    discountPercentage: number
    expiryDate: string
    isActive: boolean
    courses: Array<{ id: string; title: string }>
}

export default function AdminCouponsPage() {
    const { canWrite } = useAuth()

    const [courses, setCourses] = React.useState<CourseOption[]>([])
    const [coupons, setCoupons] = React.useState<Coupon[]>([])

    const [isLoading, setIsLoading] = React.useState(true)
    const [isSaving, setIsSaving] = React.useState(false)

    const [error, setError] = React.useState("")

    const [form, setForm] = React.useState({
        couponName: "",
        discountPercentage: "",
        startDate: "",
        expiryDate: "",
        usageLimit: "",
        courseIds: [] as string[]
    })

    const loadData = React.useCallback(async () => {
        setIsLoading(true)
        setError("")

        const [couponResult, courseResult] =
            await Promise.allSettled([
                couponApi.getAll(),
                courseApi.getAll({ limit: 100 })
            ])

        if (couponResult.status === "fulfilled") {
            setCoupons(couponResult.value.data.coupons || [])
        } else {
            const apiError = couponResult.reason as {
                response?: {
                    status?: number
                    data?: { error?: string }
                }
            }

            const message =
                apiError.response?.data?.error ||
                "Failed to load coupons"

            setError(
                apiError.response?.status === 404
                    ? "Coupons API is not available yet. Restart backend."
                    : message
            )
        }

        if (courseResult.status === "fulfilled") {
            setCourses(courseResult.value.data.courses || [])
        } else {
            const apiError = courseResult.reason as {
                response?: {
                    data?: { error?: string }
                }
            }

            setError((prev) =>
                [
                    prev,
                    apiError.response?.data?.error ||
                        "Failed to load courses"
                ]
                    .filter(Boolean)
                    .join(" ")
            )
        }

        setIsLoading(false)
    }, [])

    const refreshCoupons = React.useCallback(async () => {
        try {
            const couponRes = await couponApi.getAll()

            setCoupons(couponRes.data.coupons || [])
        } catch (err: unknown) {
            const apiError = err as {
                response?: {
                    data?: { error?: string }
                }
            }

            setError(
                apiError.response?.data?.error ||
                    "Failed to refresh coupons"
            )
        }
    }, [])

    React.useEffect(() => {
        loadData()
    }, [loadData])

    const handleCreate = async (
        event: React.FormEvent
    ) => {
        event.preventDefault()

        setError("")
        setIsSaving(true)

        try {
            await couponApi.create({
                couponName: form.couponName,
                discountPercentage: Number(
                    form.discountPercentage
                ),
                startDate: form.startDate,
                expiryDate: form.expiryDate,
                usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
                courseIds: form.courseIds
            })

            setForm({
                couponName: "",
                discountPercentage: "",
                startDate: "",
                expiryDate: "",
                usageLimit: "",
                courseIds: []
            })

            await refreshCoupons()
        } catch (err: unknown) {
            const apiError = err as {
                response?: {
                    data?: { error?: string }
                }
            }

            setError(
                apiError.response?.data?.error ||
                    "Failed to create coupon"
            )
        } finally {
            setIsSaving(false)
        }
    }

    const handleToggle = async (coupon: Coupon) => {
        await couponApi.toggleActive(
            coupon.id,
            !coupon.isActive
        )

        setCoupons((prev) =>
            prev.map((item) =>
                item.id === coupon.id
                    ? {
                          ...item,
                          isActive: !item.isActive
                      }
                    : item
            )
        )
    }

    const handleDelete = async (coupon: Coupon) => {
        if (
            !window.confirm(
                `Delete coupon "${coupon.couponName}"?`
            )
        ) {
            return
        }

        await couponApi.delete(coupon.id)

        setCoupons((prev) =>
            prev.filter((item) => item.id !== coupon.id)
        )
    }

    const isExpired = (date: string) =>
        new Date(date) < new Date()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Coupons
                </h1>

                <p className="text-muted-foreground">
                    Create course-specific discounts
                    for checkout.
                </p>
            </div>

            {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Plus className="h-5 w-5" />
                            Create Coupon
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <form
                            onSubmit={handleCreate}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="coupon-name">
                                    Coupon Name
                                </Label>

                                <Input
                                    id="coupon-name"
                                    value={form.couponName}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            couponName:
                                                event.target
                                                    .value
                                        })
                                    }
                                    placeholder="SUMMER25"
                                    disabled={
                                        !canWrite("COURSES")
                                    }
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="discount">
                                        Discount %
                                    </Label>

                                    <Input
                                        id="discount"
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={
                                            form.discountPercentage
                                        }
                                        onChange={(event) =>
                                            setForm({
                                                ...form,
                                                discountPercentage:
                                                    event
                                                        .target
                                                        .value
                                            })
                                        }
                                        disabled={
                                            !canWrite(
                                                "COURSES"
                                            )
                                        }
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="expiry-date">
                                        Expiry Date
                                    </Label>

                                    <Input
                                        id="expiry-date"
                                        type="date"
                                        value={
                                            form.expiryDate
                                        }
                                        onChange={(event) =>
                                            setForm({
                                                ...form,
                                                expiryDate:
                                                    event
                                                        .target
                                                        .value
                                            })
                                        }
                                        disabled={
                                            !canWrite(
                                                "COURSES"
                                            )
                                        }
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="start-date">
                                        Start Date
                                    </Label>
                                    <Input
                                        id="start-date"
                                        type="date"
                                        value={form.startDate}
                                        onChange={(event) => setForm({...form, startDate: event.target.value})}
                                        disabled={!canWrite("COURSES")}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="usage-limit">
                                        Usage Limit
                                    </Label>
                                    <Input
                                        id="usage-limit"
                                        type="number"
                                        value={form.usageLimit}
                                        onChange={(event) => setForm({...form, usageLimit: event.target.value})}
                                        disabled={!canWrite("COURSES")}
                                        placeholder="Max numbers apply"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="course-select">
                                    Selected Courses
                                </Label>

                                <select
                                    id="course-select"
                                    multiple
                                    className="min-h-[100px] w-full rounded-md border p-2"
                                    value={form.courseIds}
                                    onChange={(e) => {
                                        const selected =
                                            Array.from(
                                                e.target
                                                    .selectedOptions
                                            ).map(
                                                (opt) =>
                                                    opt.value
                                            )

                                        setForm({
                                            ...form,
                                            courseIds:
                                                selected
                                        })
                                    }}
                                    disabled={
                                        !canWrite(
                                            "COURSES"
                                        )
                                    }
                                    required
                                >
                                    {courses.map((course) => (
                                        <option
                                            key={course.id}
                                            value={course.id}
                                        >
                                            {course.title} (
                                            {course.isPublished
                                                ? "Published"
                                                : "Draft"}{" "}
                                            | Rs.{" "}
                                            {course.price ||
                                                0}
                                            )
                                        </option>
                                    ))}
                                </select>

                                <span className="text-xs text-muted-foreground">
                                    Hold Ctrl (Windows)
                                    or Cmd (Mac) to select
                                    multiple courses.
                                </span>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={
                                    isSaving ||
                                    !canWrite("COURSES")
                                }
                            >
                                {isSaving ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Ticket className="mr-2 h-4 w-4" />
                                )}

                                Create Coupon
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : coupons.length === 0 ? (
                        <div className="rounded-lg border py-12 text-center text-muted-foreground">
                            No coupons created yet.
                        </div>
                    ) : (
                        coupons.map((coupon) => (
                            <Card key={coupon.id}>
                                <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                                    <div className="min-w-0 space-y-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="text-lg font-semibold">
                                                {
                                                    coupon.couponName
                                                }
                                            </h2>

                                            <Badge
                                                variant={
                                                    coupon.isActive &&
                                                    !isExpired(
                                                        coupon.expiryDate
                                                    )
                                                        ? "default"
                                                        : "secondary"
                                                }
                                            >
                                                {isExpired(
                                                    coupon.expiryDate
                                                )
                                                    ? "Expired"
                                                    : coupon.isActive
                                                    ? "Active"
                                                    : "Inactive"}
                                            </Badge>
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Percent className="h-4 w-4" />
                                                {
                                                    coupon.discountPercentage
                                                }
                                                % off
                                            </span>

                                            <span className="flex items-center gap-1">
                                                <CalendarDays className="h-4 w-4" />
                                                Expires{" "}
                                                {new Date(
                                                    coupon.expiryDate
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <p className="line-clamp-2 text-sm text-muted-foreground">
                                            {coupon.courses
                                                .map(
                                                    (
                                                        course
                                                    ) =>
                                                        course.title
                                                )
                                                .join(", ")}
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                handleToggle(
                                                    coupon
                                                )
                                            }
                                            disabled={
                                                !canWrite(
                                                    "COURSES"
                                                )
                                            }
                                        >
                                            {coupon.isActive
                                                ? "Disable"
                                                : "Enable"}
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive"
                                            onClick={() =>
                                                handleDelete(
                                                    coupon
                                                )
                                            }
                                            disabled={
                                                !canWrite(
                                                    "COURSES"
                                                )
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}