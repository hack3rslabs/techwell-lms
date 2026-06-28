import React, { useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface TermsAcceptModalProps {
    onAccept: () => void;
    hasAccepted: boolean;
    buttonText?: string;
    title?: string;
}

export function TermsAcceptModal({ 
    onAccept, 
    hasAccepted, 
    buttonText = "Read & Accept Terms",
    title = "Terms & Conditions" 
}: TermsAcceptModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [hasScrolled, setHasScrolled] = useState(false)
    const contentRef = useRef<HTMLDivElement>(null)

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
        if (scrollHeight - scrollTop <= clientHeight + 10) {
            setHasScrolled(true)
        }
    }

    const handleAccept = () => {
        onAccept()
        setIsOpen(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant={hasAccepted ? "outline" : "default"} type="button" className={hasAccepted ? "border-green-500 text-green-600 bg-green-50" : ""}>
                    {hasAccepted ? "Terms Accepted ✓" : buttonText}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div 
                    ref={contentRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto p-4 border rounded bg-muted/30 text-sm space-y-4 my-4"
                >
                    <h4 className="font-bold">Please read to the end to accept</h4>
                    <p>1. By registering, you agree to Techwell's strict policies regarding our learning management system, consultancy, and training modules.</p>
                    <p>2. We will use your data for business purposes but will not share it with any unauthorized 3rd party.</p>
                    <p>3. **Non-Refundable Policy**: Once you have attended classes or accessed the material, no refunds will be issued under normal circumstances.</p>
                    <p>4. If a refund is exceptionally granted, we will deduct 18% GST, 2% admin charges, and 2% payment gateway charges.</p>
                    <p>5. We ensure data security as per the IT Act 2000 guidelines, but please note that absolute 100% security on the internet cannot be guaranteed.</p>
                    <p>6. **Job Assistance**: We provide career support but do not guarantee a specific job, company, or CTC.</p>
                    <p>7. You are responsible for your own conduct during the training and interviews.</p>
                    <p>8. Violation of these terms may result in account termination without refund.</p>
                    
                    {/* Add extra padding to ensure scrolling is required */}
                    <div className="h-[400px]"></div>
                    
                    <p className="text-center font-medium italic mt-8">-- End of Terms --</p>
                </div>
                <div className="flex flex-col gap-2">
                    {!hasScrolled && <p className="text-xs text-center text-muted-foreground">Please scroll to the bottom to accept.</p>}
                    <Button 
                        onClick={handleAccept} 
                        disabled={!hasScrolled} 
                        className="w-full"
                    >
                        I Accept the Terms & Conditions
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
