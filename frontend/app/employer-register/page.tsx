"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Building2, Loader2, ArrowRight } from "lucide-react"

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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import api from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    companyName: z.string().min(2, "Company name is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

export default function EmployerRegisterPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = React.useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            companyName: "",
            password: "",
            confirmPassword: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            await api.post('/employers/register', values)

            toast({
                title: "Registration Successful",
                description: "Your employer account has been created. Please wait for admin approval.",
            })

            router.push('/login?type=employer')
        } catch {
            toast({
                variant: "destructive",
                title: "Registration Failed",
                description: "Something went wrong.",
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
                    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">Create Employer Account</h1>
                        <p className="text-sm text-muted-foreground">
                            Start hiring top talent today.
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

                            <FormField
                                control={form.control}
                                name="name"
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

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Work Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="hr@company.com" {...field} />
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
                                            <FormLabel>Confirm</FormLabel>
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
                </div>
                </div>
            </div>
        </div>
    )
}
