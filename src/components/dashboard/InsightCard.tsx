'use client';

import { motion } from 'framer-motion';
import { formatCurrency } from '@/utils/formatCurrency';
import { HiArrowUp, HiArrowDown } from 'react-icons/hi2';

interface InsightCardProps {
    label: string;
    value: number;
    trend?: number;
    color: string;
    icon: React.ElementType;
}

export default function InsightCard({
    label,
    value,
    trend,
    color,
    icon: Icon,
}: InsightCardProps) {
    const isPositive = trend !== undefined && trend > 0;

    // Use safer static classes or simple dynamic logic
    const getColorStyles = (c: string) => {
        switch (c) {
            case 'purple': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
            case 'pink': return 'text-pink-400 bg-pink-500/10 border-pink-500/20';
            case 'emerald': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'rose': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
            default: return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'; // indigo fallback
        }
    };

    const selectedStyles = getColorStyles(color);

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="glass-card p-5 flex flex-col justify-between group h-36 relative overflow-hidden"
        >
            <div className="flex items-start justify-between relative z-10">
                <div className={`p-2.5 rounded-xl border ${selectedStyles} transition-colors group-hover:bg-white/10 group-hover:text-white`}>
                    <Icon className="w-5 h-5" />
                </div>

                {trend !== undefined && (
                    <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border ${isPositive ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'}`}>
                        {isPositive ? <HiArrowUp className="w-3 h-3" /> : <HiArrowDown className="w-3 h-3" />}
                        {Math.abs(trend).toFixed(0)}%
                    </div>
                )}
            </div>

            <div className="relative z-10">
                <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-1 group-hover:text-white/60 transition-colors">{label}</p>
                <h3 className="text-2xl font-bold text-white tracking-tighter">{formatCurrency(value)}</h3>
            </div>

            {/* Subtle background glow based on color */}
            <div className={`absolute -bottom-10 -right-10 w-24 h-24 ${selectedStyles.split(' ')[1]} blur-[40px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
        </motion.div>
    );
}
