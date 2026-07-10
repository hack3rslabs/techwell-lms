"use client";

import { useBehaviorTracker } from '@/hooks/useBehaviorTracker';
import { SmartIntentPopup } from '@/components/SmartIntentPopup';
import { useAuth } from '@/lib/auth-context';

export function BehaviorTrackingProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const { sessionId } = useBehaviorTracker(user?.id);

    

        return (
            <>
                {children}
                <SmartIntentPopup sessionId={sessionId} userId={user?.id} />
            </>
        );
}

