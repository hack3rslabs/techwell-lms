import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Award, Send, Loader2 } from "lucide-react";
import { jobsApi } from "@/lib/api";

interface OfferDialogProps {
    isOpen: boolean;
    onClose: () => void;
    applicationId: string;
    jobId: string;
    candidateName: string;
    onSuccess: () => void;
}

export default function OfferDialog({ isOpen, onClose, applicationId, candidateName, onSuccess }: OfferDialogProps) {
    const [form, setForm] = useState({ ctc: "", designation: "", doj: "", reportingManager: "", offerLetterUrl: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.ctc) {
            toast.error("CTC / Package is required.");
            return;
        }
        setIsSubmitting(true);
        try {
            await jobsApi.releaseOffer(applicationId, { ctc: form.ctc, designation: form.designation, doj: form.doj || undefined, reportingManager: form.reportingManager, offerLetterUrl: form.offerLetterUrl });
            toast.success("Offer released successfully!");
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Failed to release offer", error);
            toast.error(error.response?.data?.error || "Failed to release offer. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 font-black">
                        <Award className="w-5 h-5 text-emerald-600" />
                        Release Offer — {candidateName}
                    </DialogTitle>
                    <DialogDescription>
                        Fill in the offer details below. The candidate will be notified to accept or decline.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="font-semibold text-sm">CTC / Package *</Label>
                            <Input placeholder="e.g. ₹5 LPA or $60k" value={form.ctc} onChange={e => setForm(p => ({ ...p, ctc: e.target.value }))} required />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="font-semibold text-sm">Designation</Label>
                            <Input placeholder="e.g. Software Engineer" value={form.designation} onChange={e => setForm(p => ({ ...p, designation: e.target.value }))} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="font-semibold text-sm">Date of Joining</Label>
                            <Input type="date" value={form.doj} onChange={e => setForm(p => ({ ...p, doj: e.target.value }))} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="font-semibold text-sm">Reporting Manager</Label>
                            <Input placeholder="Manager name" value={form.reportingManager} onChange={e => setForm(p => ({ ...p, reportingManager: e.target.value }))} />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="font-semibold text-sm">Offer Letter URL <span className="text-slate-400 font-normal">(optional)</span></Label>
                        <Input placeholder="https://drive.google.com/..." value={form.offerLetterUrl} onChange={e => setForm(p => ({ ...p, offerLetterUrl: e.target.value }))} />
                    </div>

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                            Release Offer
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
