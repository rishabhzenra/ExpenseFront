'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@/types/user';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, name?: string) => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch {
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const res = await authService.login(email, password);
        if (res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            router.push('/dashboard');
        }
    }, [router]);

    const signup = useCallback(async (email: string, password: string, name?: string) => {
        const res = await authService.signup(email, password, name);
        if (res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            router.push('/dashboard');
        }
    }, [router]);

    const updateProfile = useCallback(async (data: Partial<User>) => {
        const res = await userService.updateProfile(data);
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
    }, []);

    const logout = useCallback(async () => {
        try { await authService.logout(); } catch {}
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('demoMode');
        router.push('/login');
    }, [router]);

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, updateProfile, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
