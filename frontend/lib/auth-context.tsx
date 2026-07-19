"use client"

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { authApi, userApi } from '@/lib/api';
import { useIdleTimeout } from '@/hooks/useIdleTimeout';
import { IdleWarningModal } from '@/components/auth/IdleWarningModal';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    regId?: string;
    rolePermissions?: Record<string, { canRead: boolean; canCreate: boolean; canUpdate: boolean; canDelete: boolean; isDisabled: boolean }>;
    systemRole?: { name: string };
    avatar?: string;
    dob?: string;
    qualification?: string;
    college?: string;
    phone?: string;
    hasUnlimitedInterviews?: boolean;
    hasAiInterviewAccess?: boolean;
    hasResumeAccess?: boolean;
    xp?: number;
    currentStreak?: number;
    twoFactorEnabled?: boolean;
    instituteId?: string;
    franchiseId?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string, trustDevice?: boolean) => Promise<{ require2FA?: boolean; tempToken?: string } | void>;
    register: (email: string, password: string, name: string, phone?: string, dob?: string, qualification?: string, college?: string, referredByCode?: string, intent?: string) => Promise<{ user: User, devOtp?: string }>;
    verifyOtp: (email: string, otp: string) => Promise<void>;
    resendOtp: (email: string) => Promise<{success: boolean, devOtp?: string}>;
    logout: () => void;
    refreshUser: () => Promise<void>;
    hasPermission: (permission: string, action?: 'create' | 'read' | 'update' | 'delete') => boolean;
    canWrite: (permission: string) => boolean;
    verify2FA: (code: string, tempToken: string, trustDevice?: boolean) => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = React.useState<User | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    const isAuthenticated = !!user;

    // Load user from localStorage on mount
    React.useEffect(() => {
        const loadUser = async () => {
            try {
                const response = await userApi.getMe();
                setUser(response.data.user);
            } catch {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, []);

    const login = async (email: string, password: string, trustDevice?: boolean): Promise<{ require2FA?: boolean; tempToken?: string } | void> => {
        const response = await authApi.login({ email, password, trustDevice });
        if (response.data.require2FA) {
            return {
                require2FA: true,
                tempToken: response.data.tempToken
            };
        }
        setUser(response.data.user);
    };

    const verify2FA = async (code: string, tempToken: string, trustDevice?: boolean) => {
        const response = await authApi.verify2FA({ code, tempToken, trustDevice });
        const { token, user, trustToken } = response.data;

        if (trustToken && typeof window !== 'undefined') {
                // snyk-ignore javascript/WebCookieSecureDisabledByDefault: Handled as per security plan
            document.cookie = `trustToken=${trustToken}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
        }

        setUser(user);
    };

    const register = async (email: string, password: string, name: string, phone?: string, dob?: string, qualification?: string, college?: string, referredByCode?: string, intent?: string): Promise<{ user: User, devOtp?: string }> => {
        const response = await authApi.register({ email, password, name, phone, dob, qualification, college, referredByCode, intent });
        // Return a partial User object for type compatibility along with devOtp
        return {
            user: {
                id: '',
                email,
                name,
                role: 'STUDENT',
                dob,
                qualification,
                college,
            },
            devOtp: response.data.devOtp
        };
    };

    const verifyOtp = async (email: string, otp: string) => {
        const response = await authApi.verifyOtp({ email, otp });
        setUser(response.data.user);
    };

    const resendOtp = async (email: string): Promise<{success: boolean}> => {
        const response = await authApi.resendOtp({ email });
        return response.data;
    };

    const router = useRouter();

    const logout = React.useCallback(async () => {
        try {
            await authApi.logout();
        } catch (e) {}
        setUser(null);
    }, []);

    // ── Idle timeout (10 min) ──────────────────────────────────────────────────
    const { isWarning, remainingSeconds, resetTimer } = useIdleTimeout({
        isAuthenticated,
        onLogout: logout,
    });

    const handleLogoutNow = React.useCallback(() => {
        logout();
        router.push('/login');
    }, [logout, router]);
    // ──────────────────────────────────────────────────────────────────────────

    const refreshUser = async () => {
        try {
            const response = await userApi.getMe();
            setUser(response.data.user);
        } catch {
            logout();
        }
    };

    const hasPermission = (featureCode: string, action: 'create' | 'read' | 'update' | 'delete' = 'read') => {
        if (!user) return false;
        
        // Only Super Admins have all permissions
        if (user.role === 'SUPER_ADMIN') return true;
        
        const perms = user.rolePermissions?.[featureCode];
        if (!perms || perms.isDisabled) return false;
        
        if (action === 'create') return !!perms.canCreate;
        if (action === 'update') return !!perms.canUpdate;
        if (action === 'delete') return !!perms.canDelete;
        
        // action === 'read'
        return perms.canRead || perms.canCreate || perms.canUpdate || perms.canDelete;
    };

    const canWrite = (featureCode: string) => {
        if (!user) return false;
        
        // Only Super Admins have all permissions
        if (user.role === 'SUPER_ADMIN') return true;
        
        const perms = user.rolePermissions?.[featureCode];
        return !!(!perms?.isDisabled && (perms?.canCreate || perms?.canUpdate || perms?.canDelete));
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated,
                login,
                register,
                verifyOtp,
                resendOtp,
                logout,
                refreshUser,
                hasPermission,
                canWrite,
                verify2FA,
            }}
        >
            {children}
            {isWarning && isAuthenticated && (
                <IdleWarningModal
                    remainingSeconds={remainingSeconds}
                    onStayLoggedIn={resetTimer}
                    onLogoutNow={handleLogoutNow}
                />
            )}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = React.useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
