'use client';

import { motion } from 'framer-motion';

interface HealthIndicatorProps {
    score: number;
}

export default function HealthIndicator({ score }: HealthIndicatorProps) {
    const getColor = (s: number) => {
        if (s >= 80) return 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]';
        if (s >= 50) return 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]';
        return 'text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]';
    };

    const getStrokeColor = (s: number) => {
        if (s >= 80) return 'stroke-emerald-400';
        if (s >= 50) return 'stroke-amber-400';
        return 'stroke-rose-400';
    };

    const radius = 32;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="glass-card p-6 flex items-center justify-between relative overflow-hidden group">
            <div className="relative z-10 flex items-center gap-6">
                <div className="relative w-20 h-20 shrink-0">
                    <svg className="w-full h-full -rotate-90 filter drop-shadow-xl" viewBox="0 0 100 100">
                        {/* Background Track */}
                        <circle
                            cx="50"
                            cy="50"
                            r={radius}
                            stroke="rgba(255,255,255,0.03)"
                            strokeWidth="6"
                            fill="transparent"
                        />
                        {/* Progress Circle */}
                        <motion.circle
                            cx="50"
                            cy="50"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="transparent"
                            strokeDasharray={circumference}
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset: offset }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            strokeLinecap="round"
                            className={`${getStrokeColor(score)} brightness-125`}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-xl font-bold tracking-tight ${getColor(score)}`}>{score}</span>
                    </div>
                </div>

                <div className="min-w-0">
                    <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2">System Stability</h3>
                    <p className="text-white font-bold text-lg uppercase tracking-widest italic leading-none mb-1">
                        {score >= 80 ? 'Optimal' : score >= 50 ? 'Nominal' : 'Critical'}
                    </p>
                    <p className="text-xs text-white/40 truncate font-medium">
                        {score >= 80 ? 'Efficiency verified.' : score >= 50 ? 'Operations stable.' : 'Risk detected.'}
                    </p>
                </div>
            </div>

            {/* Background Glow */}
            <div className={`absolute top-0 right-0 w-full h-full opacity-10 blur-3xl rounded-full pointer-events-none transition-colors duration-500
        ${score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-rose-500'}
      `} />
        </div>
    );
}
