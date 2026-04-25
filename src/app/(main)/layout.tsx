'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/layout/Sidebar';
import BottomNav from '@/components/layout/BottomNav';

function DemoBanner() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(localStorage.getItem('demoMode') === 'true');
    }, []);

    if (!visible) return null;

    return (
        <div className="w-full bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
                <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shrink-0">
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M6 1v5M6 9.5v.5" stroke="white" strokeWidth="1.75" strokeLinecap="round"/>
                    </svg>
                </div>
                <p className="text-sm text-amber-900 font-medium truncate">
                    <span className="font-semibold">Demo Mode</span>
                    <span className="text-amber-700 font-normal"> — You're viewing a UI preview with sample data. Live data sync, cloud storage, and full functionality require the </span>
                    <span className="font-semibold">full plan at $20/month.</span>
                </p>
            </div>
            <a
                href="mailto:teambacklinkos@gmail.com?subject=Savora%20Full%20Access"
                className="shrink-0 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            >
                Upgrade — $20/mo
            </a>
        </div>
    );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-slate-500">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
            <DemoBanner />
            <div className="flex-1 flex overflow-hidden">
                <Sidebar />
                <div className="flex-1 flex flex-col min-w-0 lg:ml-60 overflow-hidden">
                    <div className="flex-1 overflow-y-auto clean-scroll">
                        {children}
                    </div>
                    <BottomNav />
                </div>
            </div>
        </div>
    );
}
