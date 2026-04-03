'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { invoiceService } from '@/services/invoiceService';
import { taxService } from '@/services/taxService';
import { formatCurrency } from '@/utils/formatCurrency';
import {
    HiOutlineHome, HiOutlineBanknotes, HiOutlineArrowTrendingUp, HiOutlineChartPie,
    HiOutlineTrophy, HiOutlineChartBarSquare, HiOutlineDocumentChartBar,
    HiOutlineCog6Tooth, HiOutlineArrowRightOnRectangle, HiOutlineArrowsRightLeft,
    HiOutlineCreditCard, HiOutlineReceiptPercent, HiOutlineUsers, HiOutlineDocumentText,
    HiOutlinePresentationChartLine, HiOutlineScale, HiOutlineSparkles,
    HiOutlineBuildingLibrary,
} from 'react-icons/hi2';

const navGroups = [
    {
        title: 'Overview',
        links: [
            { href: '/dashboard', label: 'Dashboard', icon: HiOutlineHome, exact: true },
            { href: '/cashflow', label: 'Cashflow', icon: HiOutlineArrowsRightLeft, exact: true },
            { href: '/net-worth', label: 'Net Worth', icon: HiOutlineScale, exact: true },
        ]
    },
    {
        title: 'Transactions',
        links: [
            { href: '/expenses', label: 'Expenses', icon: HiOutlineBanknotes, exact: true },
            { href: '/income', label: 'Income', icon: HiOutlineArrowTrendingUp, exact: true },
            { href: '/subscriptions', label: 'Subscriptions', icon: HiOutlineCreditCard, exact: true },
        ]
    },
    {
        title: 'Planning',
        links: [
            { href: '/budget', label: 'Budget', icon: HiOutlineChartPie, exact: true },
            { href: '/goals', label: 'Goals', icon: HiOutlineTrophy, exact: true },
            { href: '/investments', label: 'Investments', icon: HiOutlinePresentationChartLine, exact: true },
            { href: '/tax', label: 'Tax', icon: HiOutlineReceiptPercent, exact: true, badge: 'tax' },
        ]
    },
    {
        title: 'Business',
        links: [
            { href: '/clients', label: 'Clients', icon: HiOutlineUsers, exact: true },
            { href: '/invoices', label: 'Invoices', icon: HiOutlineDocumentText, exact: true, badge: 'invoices' },
        ]
    },
    {
        title: 'Insights',
        links: [
            { href: '/analytics', label: 'Analytics', icon: HiOutlineChartBarSquare },
            { href: '/reports', label: 'Reports', icon: HiOutlineDocumentChartBar },
        ]
    },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [badges, setBadges] = useState<{ invoices: number; tax: number }>({ invoices: 0, tax: 0 });

    useEffect(() => {
        const loadBadges = async () => {
            try {
                const [inv, tax] = await Promise.all([
                    invoiceService.getStats().catch(() => ({ data: null })),
                    taxService.getSummary().catch(() => ({ data: null })),
                ]);
                setBadges({
                    invoices: (inv.data?.overdue || 0) + (inv.data?.sent || 0),
                    tax: (tax.data?.overdue || 0) + (tax.data?.pending || 0),
                });
            } catch {}
        };
        loadBadges();
    }, []);

    const initials = user?.name
        ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : user?.email?.slice(0, 2).toUpperCase() ?? 'SV';

    const getBadge = (key?: string) => {
        if (!key) return 0;
        return badges[key as keyof typeof badges] || 0;
    };

    return (
        <aside className="hidden lg:flex flex-col w-60 h-screen bg-white border-r border-slate-200 fixed left-0 top-0 z-40">
            {/* Logo */}
            <div className="px-4 py-4 border-b border-slate-100">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-sm">
                        <HiOutlineBuildingLibrary className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <span className="text-[15px] font-bold text-slate-900 tracking-tight">Savora</span>
                        <span className="block text-[10px] text-slate-400 font-medium tracking-wide">Finance Platform</span>
                    </div>
                </Link>
            </div>

            {/* Quick Stats Bar */}
            <div className="mx-3 my-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <HiOutlineSparkles className="w-3 h-3" /> Quick Stats
                </p>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <p className="text-[10px] text-slate-400">Monthly Income</p>
                        <p className="text-xs font-bold text-emerald-600">₹2.45L</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400">This Month</p>
                        <p className="text-xs font-bold text-red-500">₹68.3K</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-1 px-3 clean-scroll">
                {navGroups.map((group, groupIdx) => (
                    <div key={groupIdx} className={groupIdx > 0 ? 'mt-3' : ''}>
                        <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                            {group.title}
                        </p>
                        <div className="space-y-0.5">
                            {group.links.map(link => {
                                const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
                                const Icon = link.icon;
                                const badgeCount = getBadge((link as any).badge);
                                return (
                                    <Link key={link.href} href={link.href}
                                        className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-100 ${isActive
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                                        <span className="flex items-center gap-2.5">
                                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                                            <span>{link.label}</span>
                                        </span>
                                        {badgeCount > 0 && (
                                            <span className="text-[10px] font-bold bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                                                {badgeCount > 9 ? '9+' : badgeCount}
                                            </span>
                                        )}
                                        {isActive && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Bottom */}
            <div className="px-3 pb-4 border-t border-slate-100 pt-3 space-y-0.5">
                <Link href="/settings" className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all ${pathname.startsWith('/settings') ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                    <HiOutlineCog6Tooth className={`w-4 h-4 ${pathname.startsWith('/settings') ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>Settings</span>
                </Link>
                <button onClick={logout} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 w-full transition-all">
                    <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
                    <span>Sign out</span>
                </button>

                {/* User Card */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2.5 px-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                        {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{user?.name || 'User'}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                    </div>
                    <div className="shrink-0">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 uppercase tracking-wide">Pro</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
