'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    HiOutlineHome, HiOutlineBanknotes, HiOutlineArrowTrendingUp,
    HiOutlineTrophy, HiOutlinePresentationChartLine,
} from 'react-icons/hi2';

const links = [
    { href: '/dashboard', label: 'Home', icon: HiOutlineHome, exact: true },
    { href: '/expenses', label: 'Expenses', icon: HiOutlineBanknotes, exact: true },
    { href: '/income', label: 'Income', icon: HiOutlineArrowTrendingUp, exact: true },
    { href: '/investments', label: 'Invest', icon: HiOutlinePresentationChartLine, exact: true },
    { href: '/goals', label: 'Goals', icon: HiOutlineTrophy, exact: true },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="lg:hidden bg-white border-t border-slate-200 safe-area-pb">
            <div className="flex items-center justify-around h-14">
                {links.map((link) => {
                    const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
                    const Icon = link.icon;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 ${isActive ? 'text-blue-600' : 'text-slate-400'}`}
                        >
                            <Icon style={{ width: '1.2rem', height: '1.2rem' }} />
                            <span className="text-[9px] font-medium">{link.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
