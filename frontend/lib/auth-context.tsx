"use client"

import * as React from 'react';
import { authApi, userApi } from '@/lib/api';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    permissions?: string[];
    avatar?: string;
    dob?: string;
    qualification?: string;
    college?: string;
    phone?: string;
    hasUnlimitedInterviews?: boolean;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string, dob?: string, qualification?: string, college?: string) => Promise<User>;
    verifyOtp: (email: string, otp: string) => Promise<void>;
    resendOtp: (email: string) => Promise<{success: boolean}>;
    logout: () => void;
    refreshUser: () => Promise<void>;
    hasPermission: (permission: string) => boolean;
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
                const token = localStorage.getItem('token');
                if (token) {
                    const response = await userApi.getMe();
                    setUser(response.data.user);
                }
            } catch {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, []);

    const login = async (email: string, password: string) => {
        const response = await authApi.login({ email, password });
        const { token, user } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
    };

    const register = async (email: string, password: string, name: string, dob?: string, qualification?: string, college?: string): Promise<User> => {
        const response = await authApi.register({ email, password, name, dob, qualification, college });
        // The backend now only sends { message: 'OTP sent...', email }
        // We do NOT set user/token yet, we wait for OTP verification.
        // Return a partial User object for type compatibility
        return {
            id: '',
            email,
            name,
            role: 'STUDENT',
            dob,
            qualification,
            college,
        };
    };

    const verifyOtp = async (email: string, otp: string) => {
        const response = await authApi.verifyOtp({ email, otp });
        const { token, user } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
    };

    const resendOtp = async (email: string): Promise<{success: boolean}> => {
        const response = await authApi.resendOtp({ email });
        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const refreshUser = async () => {
        try {
            const response = await userApi.getMe();
            setUser(response.data.user);
        } catch {
            logout();
        }
    };

    const hasPermission = (permission: string) => {
        if (!user) return false;
        if (user.role === 'SUPER_ADMIN') return true;
        return user.permissions?.includes(permission) || false;
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
            }}
        >
            {children}
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
