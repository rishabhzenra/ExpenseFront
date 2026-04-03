'use client';

import { motion } from 'framer-motion';
import { HiOutlineDocumentText } from 'react-icons/hi2';

interface EmptyStateProps {
    title: string;
    description: string;
    action?: React.ReactNode;
}

export default function EmptyState({ title, description, action }: EmptyStateProps) {
    return (
        <motion.div
            className="flex flex-col items-center justify-center py-16 px-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <HiOutlineDocumentText className="w-10 h-10 text-white/30" />
            </div>
            <h3 className="text-lg font-semibold text-white/80 mb-2">{title}</h3>
            <p className="text-sm text-white/40 max-w-xs mb-6">{description}</p>
            {action}
        </motion.div>
    );
}
