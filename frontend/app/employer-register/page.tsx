"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Building2, Loader2, Link as LinkIcon, MapPin, KeyRound } from "lucide-react"

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
import { employerRequestApi } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

const formSchema = z.object({
    employerName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(7, "Phone number must be at least 7 digits"),
    companyName: z.string().min(2, "Company name is required"),
    website: z.string().url("Website must be a valid URL. e.g. https://example.com"),
    address: z.string().min(5, "Business address is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

export default function EmployerRegisterPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = React.useState(false)
    const [step, setStep] = React.useState<"REGISTER" | "OTP">("REGISTER")
    const [registeredEmail, setRegisteredEmail] = React.useState("")
    const [otp, setOtp] = React.useState("")

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            employerName: "",
            email: "",
            phone: "",
            companyName: "",
            website: "",
            address: "",
            password: "",
            confirmPassword: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            await employerRequestApi.submit(values)

            setRegisteredEmail(values.email)
            setStep("OTP")
            toast({
                title: "Code Sent",
                description: "Please check your business email for the verification code.",
            })
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Registration Failed",
                description: error.response?.data?.message || "Something went wrong.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    async function onVerifyOtp(e: React.FormEvent) {
        e.preventDefault()
        if (!otp || otp.length < 6) {
            toast({ variant: "destructive", description: "Please enter a valid 6-digit code." })
            return
        }
        setIsLoading(true)
        try {
            await employerRequestApi.verifyOtp({ email: registeredEmail, otp })
            toast({
                title: "Registration Successful",
                description: "Your company account has been created. Please wait for admin approval.",
            })
            router.push('/login?type=employer')
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Verification Failed",
                description: error.response?.data?.message || "Invalid or expired OTP.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 lg:p-0">
            <div className="w-full max-w-[1400px] h-full lg:h-[850px] bg-card rounded-2xl lg:rounded-3xl shadow-2xl overflow-hidden grid lg:grid-cols-2 border border-border">
                <div className="hidden lg:flex flex-col relative bg-muted p-12 overflow-hidden justify-between">
                    <div className="absolute inset-0 z-0">
                        <div 
                            className="absolute inset-0 bg-cover bg-center" 
                            style={{ backgroundImage: 'url(/images/employer-bg.jpg)' }} 
                        />
                        <div className="absolute inset-0 bg-slate-900/60 mix-blend-multiply" />
                    </div>
                    
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <Image src="/logo-dark.png" alt="Techwell" width={160} height={48} priority className="brightness-0 invert drop-shadow-md" />
                        </div>
                        
                        <div className="relative z-20 mt-auto bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl shadow-2xl">
                            <blockquote className="space-y-4 text-white">
                                <p className="text-xl font-medium leading-relaxed tracking-wide">
                                    &quot;Finding the right talent used to be a challenge. Techwell made it seamless to connect with skilled graduates, streamlining our entire hiring pipeline.&quot;
                                </p>
                                <footer className="text-sm font-semibold opacity-90 flex items-center">
                                    <span className="w-8 h-[1px] bg-white mr-3"></span>
                                    Sofia Davis, HR Director
                                </footer>
                            </blockquote>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-12 lg:h-full lg:overflow-y-auto lg:max-h-[850px]">
                    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
                    
                    {step === "REGISTER" && (
                        <>
                            <div className="flex flex-col space-y-2 text-center">
                                <h1 className="text-2xl font-semibold tracking-tight">Create Company / Employer Account</h1>
                                <p className="text-sm text-muted-foreground">
                                    Start hiring top talent today. A business email and website are required.
                                </p>
                            </div>

                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="companyName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Company Name</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <Input className="pl-9" placeholder="Acme Corp" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="employerName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Contact Person</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="John Doe" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Phone</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="+91..." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Business Email</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="hr@company.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="website"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Company Website</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <Input className="pl-9" placeholder="https://www.example.com" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Headquarters Address</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <Input className="pl-9" placeholder="123 Tech Park, City, Country" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Password</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="confirmPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Confirm Password</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <Button className="w-full" type="submit" disabled={isLoading}>
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Register Company
                                    </Button>
                                </form>
                            </Form>
                            
                            <div className="text-center text-sm">
                                Already have an account?{" "}
                                <Link href="/login" className="underline underline-offset-4 hover:text-primary">
                                    Login here
                                </Link>
                            </div>
                        </>
                    )}

                    {step === "OTP" && (
                        <div className="space-y-6">
                            <div className="flex flex-col space-y-2 text-center">
                                <h1 className="text-2xl font-semibold tracking-tight">Verify Email</h1>
                                <p className="text-sm text-muted-foreground">
                                    Enter the 6-digit code sent to <span className="font-semibold text-foreground">{registeredEmail}</span>
                                </p>
                            </div>

                            <form onSubmit={onVerifyOtp} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Verification Code
                                    </label>
                                    <div className="relative">
                                        <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength={6}
                                            className="pl-9 tracking-[0.5em] font-mono text-center text-lg"
                                            placeholder="------"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                            required
                                        />
                                    </div>
                                </div>
                                <Button className="w-full" type="submit" disabled={isLoading || otp.length < 6}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Verify Email
                                </Button>
                            </form>
                            
                            <div className="text-center text-sm text-muted-foreground">
                                Didn&apos;t receive the code?{" "}
                                <button type="button" className="underline underline-offset-4 hover:text-primary font-medium">
                                    Resend Code
                                </button>
                            </div>
                        </div>
                    )}
                    
                    </div>
                </div>
            </div>
        </div>
    )
}
