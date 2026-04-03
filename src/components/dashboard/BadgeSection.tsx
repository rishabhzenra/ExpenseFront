'use client';

import { motion } from 'framer-motion';
import { HiFire, HiShieldCheck, HiStar, HiBolt } from 'react-icons/hi2';

const BADGES = [
    { id: 'saver', name: 'Elite Saver', icon: HiShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { id: ' streak', name: '7-Day Streak', icon: HiFire, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { id: 'budget', name: 'Budget Master', icon: HiStar, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { id: 'fast', name: 'Quick Tracker', icon: HiBolt, color: 'text-blue-400', bg: 'bg-blue-400/10' },
];

export default function BadgeSection() {
    return (
        <div className="glass-card rounded-3xl p-6">
            <h3 className="text-sm font-medium text-white/40 uppercase tracking-widest mb-6">Achievements</h3>
            <div className="flex flex-wrap gap-4">
                {BADGES.map((badge, index) => {
                    const Icon = badge.icon;
                    return (
                        <motion.div
                            key={badge.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/5 group cursor-pointer"
                        >
                            <div className={`p-1.5 rounded-lg ${badge.bg}`}>
                                <Icon className={`w-4 h-4 ${badge.color}`} />
                            </div>
                            <span className="text-xs font-bold text-white/70 group-hover:text-white transition-colors">{badge.name}</span>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
