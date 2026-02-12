"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const DropdownContext = React.createContext<{
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
    const [open, setOpen] = React.useState(false);
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <DropdownContext.Provider value={{ open, setOpen }}>
            <div className="relative inline-block text-left" ref={ref}>
                {children}
            </div>
        </DropdownContext.Provider>
    );
};

const DropdownMenuTrigger = ({ children, asChild }: { children: React.ReactNode, asChild?: boolean }) => {
    const context = React.useContext(DropdownContext);
    if (!context) throw new Error("DropdownMenuTrigger must be used within DropdownMenu");

    const child = asChild ? React.Children.only(children) as React.ReactElement : null;

    if (child) {
        return React.cloneElement(child, {
            onClick: (e: React.MouseEvent) => {
                const childProps = child.props as { onClick?: (e: React.MouseEvent) => void };
                childProps.onClick?.(e);
                context.setOpen(!context.open);
            },
            "aria-expanded": context.open
        } as React.HTMLAttributes<HTMLElement>);
    }

    return (
        <button onClick={() => context.setOpen(!context.open)}>
            {children}
        </button>
    );
};

const DropdownMenuContent = ({ children, align = "center", className }: { children: React.ReactNode, align?: "start" | "end" | "center", className?: string }) => {
    const context = React.useContext(DropdownContext);
    if (!context) throw new Error("DropdownMenuContent must be used within DropdownMenu");

    if (!context.open) return null;

    const alignClass = {
        start: "left-0",
        end: "right-0",
        center: "left-1/2 -translate-x-1/2"
    }[align];

    return (
        <div className={cn("absolute z-50 mt-2 w-56 rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80 data-[side=bottom]:slide-in-from-top-2", alignClass, className)}>
            {children}
        </div>
    );
};

const DropdownMenuItem = ({ children, onClick, className, disabled }: { children: React.ReactNode, onClick?: () => void, className?: string, disabled?: boolean }) => {
    const context = React.useContext(DropdownContext);
    return (
        <div
            className={cn("relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground", disabled && "pointer-events-none opacity-50", className)}
            onClick={(e) => {
                e.stopPropagation();
                if (disabled) return;
                onClick?.();
                context?.setOpen(false);
            }}
            data-disabled={disabled || undefined}
        >
            {children}
        </div>
    );
};

const DropdownMenuLabel = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("px-2 py-1.5 text-sm font-semibold", className)}>
        {children}
    </div>
);

const DropdownMenuSeparator = ({ className }: { className?: string }) => (
    <div className={cn("-mx-1 my-1 h-px bg-muted", className)} />
);

export {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
};
