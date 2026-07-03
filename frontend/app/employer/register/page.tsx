"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Building2, CheckCircle2, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import api from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

const personalDomains = [
    "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.in", "outlook.com",
    "hotmail.com", "live.com", "msn.com", "icloud.com", "proton.me", "protonmail.com",
]

const formSchema = z.object({
    companyName: z.string().trim().min(2, "Company name is required"),
    employerName: z.string().trim().min(2, "Employer name is required"),
    email: z.string().trim().email("Enter a valid business email").refine((email) => {
        const domain = email.split("@")[1]?.toLowerCase()
        return !!domain && !personalDomains.includes(domain)
    }, "Please use a business email address"),
    phone: z.string().trim().min(7, "Phone number is required"),
    website: z.union([z.string().trim().url("Enter a valid website URL"), z.literal("")]),
    address: z.string().trim().min(5, "Business address is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Password and confirm password must match",
    path: ["confirmPassword"],
})

type FormValues = z.infer<typeof formSchema>

export default function EmployerRegisterPage() {
    const { toast } = useToast()
    const [isLoading, setIsLoading] = React.useState(false)
    const [submitted, setSubmitted] = React.useState(false)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            companyName: "",
            employerName: "",
            email: "",
            phone: "",
            website: "",
            address: "",
            password: "",
            confirmPassword: "",
        },
    })

    async function onSubmit(values: FormValues) {
        setIsLoading(true)
        try {
            await api.post("/employer-requests", values)
            setSubmitted(true)
            toast({
                title: "Request submitted",
                description: "Your login will be enabled after an administrator approves the request.",
            })
        } catch (error: unknown) {
            const message = (error as { response?: { data?: { message?: string; error?: string } } })
                ?.response?.data?.message
                || (error as { response?: { data?: { error?: string } } })?.response?.data?.error
                || "Unable to submit employer request."
            toast({
                variant: "destructive",
                title: "Request failed",
                description: message,
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container relative grid min-h-screen lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-slate-950 p-10 text-white lg:flex">
                <div className="relative z-20 flex items-center">
                    <Image src="/logo-dark.png" alt="Techwell" width={150} height={44} priority />
                </div>
                <div className="relative z-20 mt-auto max-w-lg">
                    <h2 className="text-4xl font-bold">Hire job-ready technology talent.</h2>
                    <p className="mt-4 text-lg text-slate-300">
                        Submit your company details for verification. Approved employers receive dashboard access and can manage their own job listings.
                    </p>
                </div>
            </div>

            <div className="flex items-center px-4 py-12 sm:px-8 lg:px-12">
                <div className="mx-auto w-full max-w-xl">
                    {submitted ? (
                        <div className="rounded-2xl border bg-card p-10 text-center shadow-sm">
                            <CheckCircle2 className="mx-auto h-14 w-14 text-green-600" />
                            <h1 className="mt-5 text-2xl font-bold">Request pending approval</h1>
                            <p className="mt-3 text-muted-foreground">
                                We saved your employer request. You cannot sign in until an administrator approves it.
                            </p>
                            <div className="mt-7 flex justify-center gap-3">
                                <Link href="/">
                                    <Button variant="outline">Back to home</Button>
                                </Link>
                                <Link href="/login">
                                    <Button>Go to login</Button>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="mb-8">
                                <div className="flex items-center gap-3">
                                    <Building2 className="h-8 w-8 text-primary" />
                                    <h1 className="text-3xl font-bold">Employer access request</h1>
                                </div>
                                <p className="mt-2 text-muted-foreground">
                                    Use your business email. Login access is created only after admin approval.
                                </p>
                            </div>

                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <FormField control={form.control} name="companyName" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Company name</FormLabel>
                                                <FormControl><Input placeholder="Acme Technologies" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="employerName" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Employer name</FormLabel>
                                                <FormControl><Input placeholder="Priya Sharma" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>

                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <FormField control={form.control} name="email" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Business email</FormLabel>
                                                <FormControl><Input type="email" placeholder="hr@company.com" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="phone" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone</FormLabel>
                                                <FormControl><Input type="tel" placeholder="+91 98765 43210" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>

                                    <FormField control={form.control} name="website" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Website</FormLabel>
                                            <FormControl><Input type="url" placeholder="https://company.com" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />

                                    <FormField control={form.control} name="address" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Business address</FormLabel>
                                            <FormControl><Textarea placeholder="Registered business address" className="min-h-24" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />

                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <FormField control={form.control} name="password" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl><Input type="password" autoComplete="new-password" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Confirm password</FormLabel>
                                                <FormControl><Input type="password" autoComplete="new-password" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>

                                    <Button className="w-full" size="lg" type="submit" disabled={isLoading}>
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Submit for approval
                                    </Button>
                                </form>
                            </Form>

                            <p className="mt-6 text-center text-sm text-muted-foreground">
                                Already approved?{" "}
                                <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
