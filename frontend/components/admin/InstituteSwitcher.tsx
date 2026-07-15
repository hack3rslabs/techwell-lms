"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Building2, Globe } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import api from "@/lib/api"
import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"

type Institute = {
    id: string;
    name: string;
}

export function InstituteSwitcher() {
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState("")
    const [institutes, setInstitutes] = useState<Institute[]>([])
    const { user } = useAuth()

    useEffect(() => {
        if (user && user.role === 'SUPER_ADMIN') {
            const fetchInstitutes = async () => {
                try {
                    const res = await api.get('/institutes?status=APPROVED')
                    setInstitutes(res.data)
                    
                    const savedInstituteId = localStorage.getItem('activeInstituteId')
                    if (savedInstituteId && res.data.some((i: any) => i.id === savedInstituteId)) {
                        setValue(savedInstituteId)
                    } else if (res.data.length > 0) {
                        setValue(res.data[0].id)
                        localStorage.setItem('activeInstituteId', res.data[0].id)
                        // Trigger event to reload data for this institute
                        setTimeout(() => window.dispatchEvent(new Event('instituteChanged')), 100)
                    }
                } catch (error) {
                    console.error("Failed to fetch institutes for switcher:", error)
                }
            }
            fetchInstitutes()
        }
    }, [user])

    if (!user || user.role !== 'SUPER_ADMIN') {
        return null;
    }

    const currentLabel = value === "global" 
        ? "Global View (All Data)" 
        : institutes.find((i) => i.id === value)?.name || "Select Institute..."

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between bg-white/5 border-white/10 hover:bg-white/10 hover:text-white"
                >
                    <div className="flex items-center truncate">
                        {value === "global" ? <Globe className="mr-2 h-4 w-4 shrink-0 text-primary" /> : <Building2 className="mr-2 h-4 w-4 shrink-0 text-primary" />}
                        <span className="truncate text-xs">{currentLabel}</span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0 border-white/10 bg-[#0a0a0b]">
                <Command className="bg-transparent">
                    <CommandInput placeholder="Search institute..." />
                    <CommandList>
                        <CommandEmpty>No institute found.</CommandEmpty>
                        <CommandGroup>
                            
                            {institutes.map((inst) => (
                                <CommandItem
                                    key={inst.id}
                                    value={inst.id}
                                    onSelect={(currentValue: string) => {
                                        setValue(currentValue)
                                        setOpen(false)
                                        localStorage.setItem('activeInstituteId', currentValue)
                                        window.dispatchEvent(new Event('instituteChanged'))
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === inst.id ? "opacity-100 text-primary" : "opacity-0"
                                        )}
                                    />
                                    {inst.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
