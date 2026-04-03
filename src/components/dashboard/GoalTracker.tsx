'use client';

import { motion } from 'framer-motion';
import { formatCurrency } from '@/utils/formatCurrency';

interface GoalTrackerProps {
    title: string;
    target: number;
    current: number;
    deadline?: string | Date;
}

export default function GoalTracker({ title, target, current, deadline }: GoalTrackerProps) {
    const progress = Math.min((current / target) * 100, 100);
    const remaining = Math.max(target - current, 0);

    return (
        <div className="bg-white/[0.03] border border-white/5 p-5 rounded-2xl relative overflow-hidden group hover:bg-white/[0.05] transition-all">
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="min-w-0 pr-4">
                    <h4 className="text-sm font-bold text-white tracking-tight truncate mb-1">{title}</h4>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                        {deadline ? `Target: ${new Date(deadline).toLocaleDateString()}` : ' Ongoing'}
                    </p>
                </div>
                <div className="text-right shrink-0">
                    <div className="bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-lg">
                        <p className="text-xs font-bold text-indigo-400">{Math.round(progress)}%</p>
                    </div>
                </div>
            </div>

            <div className="relative h-2 w-full bg-black/20 rounded-full overflow-hidden mb-4 border border-white/5">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                />
            </div>

            <div className="flex justify-between items-end relative z-10">
                <div>
                    <p className="text-[9px] text-white/20 uppercase tracking-widest font-bold mb-0.5">Collected</p>
                    <p className="text-sm font-bold text-white">{formatCurrency(current)}</p>
                </div>
                <div className="text-right">
                    <p className="text-[9px] text-white/20 uppercase tracking-widest font-bold mb-0.5">Deficit</p>
                    <p className="text-sm font-bold text-white/50">{formatCurrency(remaining)}</p>
                </div>
            </div>

            {/* Glow Effect */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500/5 blur-[50px] rounded-full group-hover:bg-indigo-500/10 transition-colors pointer-events-none" />
        </div>
    );
}
