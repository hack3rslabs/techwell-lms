"use client";

import { useBehaviorTracker } from '@/hooks/useBehaviorTracker';
import { SmartIntentPopup } from '@/components/SmartIntentPopup';
import { useAuth } from '@/lib/auth-context';

export function BehaviorTrackingProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const { sessionId } = useBehaviorTracker(user?.id);

    try {

        return (
            <>
                {children}
                <SmartIntentPopup sessionId={sessionId} userId={user?.id} />
            </>
        );
    } catch (error) {
        // If there's an error (e.g., useAuth not available), just render children
        console.error('[BehaviorTrackingProvider] Error:', error);
        return <>{children}</>;
    }
}

