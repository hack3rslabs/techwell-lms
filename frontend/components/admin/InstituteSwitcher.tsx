"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Building2 } from "lucide-react"

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

// Mock Institutes for now (Real connection would be via API)
const institutes = [
    {
        value: "global",
        label: "Global View (All Data)",
    },
    {
        value: "inst_tw_logic",
        label: "TechWell Logic Institute",
    },
]

export function InstituteSwitcher() {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState("global")

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[250px] justify-between"
                >
                    <div className="flex items-center">
                        <Building2 className="mr-2 h-4 w-4 opacity-50" />
                        {value
                            ? institutes.find((framework) => framework.value === value)?.label
                            : "Select Institute..."}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0">
                <Command>
                    <CommandInput placeholder="Search institute..." />
                    <CommandList>
                        <CommandEmpty>No institute found.</CommandEmpty>
                        <CommandGroup>
                            {institutes.map((framework) => (
                                <CommandItem
                                    key={framework.value}
                                    value={framework.value}
                                    onSelect={(currentValue: string) => {
                                        setValue(currentValue === value ? "" : currentValue)
                                        setOpen(false)
                                        // TODO: Trigger Context Update or URL param change
                                        console.log("Switched to:", currentValue)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === framework.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {framework.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
