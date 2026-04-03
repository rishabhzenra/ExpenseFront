'use client';

import { motion } from 'framer-motion';
import { HiSparkles, HiLightBulb } from 'react-icons/hi2';

interface AIInsightsProps {
    insights: string[];
}

export default function AIInsights({ insights }: AIInsightsProps) {
    if (!insights || insights.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-3xl p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-4">
                <HiSparkles className="w-8 h-8 text-indigo-400/20 animate-pulse" />
            </div>

            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-indigo-500/20">
                    <HiLightBulb className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">AI Financial Insights</h3>
            </div>

            <div className="space-y-4">
                {insights.map((insight, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                    >
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                        <p className="text-sm text-white/70 leading-relaxed font-medium">
                            {insight}
                        </p>
                    </motion.div>
                ))}
            </div>

            <div className="mt-6 pt-6 border-t border-white/5">
                <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold">Powered by Zenra Intelligence</p>
            </div>
        </motion.div>
    );
}
