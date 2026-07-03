"use client"

import Link from "next/link"
import { Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function EmployerRequestDialog() {
    return (
        <Link href="/employer/register">
            <Button variant="outline" size="sm" className="gap-2">
                <Briefcase className="h-4 w-4" />
                Request Employer Access
            </Button>
        </Link>
    )
}
