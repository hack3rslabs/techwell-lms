"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';

export default function TenantBranding({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [branding, setBranding] = useState<{ logoUrl?: string; themeColor?: string } | null>(null);

    useEffect(() => {
        // Only load branding if the user is associated with an institute
        if (user && user.instituteId && (user.role === 'STUDENT' || user.role === 'INSTITUTE_ADMIN')) {
            fetch(`/api/institutes/my-institute`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            })
            .then(res => res.json())
            .then(data => {
                if (data.themeColor || data.logoUrl) {
                    setBranding(data);
                }
            })
            .catch(console.error);
        }
    }, [user]);

    if (!branding) return <>{children}</>;

    return (
        <div style={{ '--tenant-primary': branding.themeColor || '#4F46E5' } as React.CSSProperties}>
            <style jsx global>{`
                :root {
                    --color-primary: var(--tenant-primary);
                }
                .tenant-theme {
                    border-top: 4px solid var(--tenant-primary);
                }
                .tenant-bg {
                    background-color: var(--tenant-primary);
                }
                .tenant-text {
                    color: var(--tenant-primary);
                }
            `}</style>
            
            {branding.logoUrl && (
                <div className="absolute top-4 right-4 z-50">
                    <img src={branding.logoUrl} alt="Institute Logo" className="h-12 w-auto object-contain bg-white rounded shadow-sm p-1" />
                </div>
            )}
            
            <div className="tenant-theme min-h-screen">
                {children}
            </div>
        </div>
    );
}
