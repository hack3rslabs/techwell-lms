"use client";

import { useState } from "react";
import { Search, Briefcase, CheckCircle, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import api from "@/lib/api";

export default function GuestTrackerPage() {
    const [trackingId, setTrackingId] = useState("");
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!trackingId) return;
        
        setLoading(true);
        setError("");
        try {
            // Assume backend endpoint exists or will be added
            const res = await api.get(`/jobs/guest/track/${trackingId}`);
            setStatus(res.data);
        } catch (err) {
            setError("Application not found. Please check your Tracking ID.");
            setStatus(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl border-t-4 border-t-blue-600">
                <CardHeader className="text-center pb-6">
                    <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <Search className="w-8 h-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Track Application</CardTitle>
                    <CardDescription>Enter the tracking ID sent to your email</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleTrack} className="space-y-4">
                        <div className="flex space-x-2">
                            <Input
                                placeholder="e.g. TRK-982374"
                                value={trackingId}
                                onChange={(e) => setTrackingId(e.target.value)}
                                className="flex-1 text-center font-mono uppercase"
                            />
                        </div>
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading || !trackingId}>
                            {loading ? "Searching..." : "Track Status"}
                        </Button>
                    </form>

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm text-center font-medium border border-red-100">
                            {error}
                        </div>
                    )}

                    {status && (
                        <div className="mt-8 space-y-4 border-t pt-6">
                            <h3 className="font-semibold text-slate-800 text-center mb-4">Application Status</h3>
                            <div className="bg-white border rounded-xl p-4 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="font-bold text-slate-800">{status.jobTitle}</div>
                                        <div className="text-xs text-slate-500">{status.company}</div>
                                    </div>
                                    <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold flex items-center">
                                        <Clock className="w-3 h-3 mr-1" /> {status.status}
                                    </div>
                                </div>
                                <div className="text-xs text-slate-400 mt-3 pt-3 border-t">
                                    Applied on: {new Date(status.appliedAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
