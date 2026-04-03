'use client';

import { motion } from 'framer-motion';
import { HiPlus } from 'react-icons/hi2';
import Link from 'next/link';

export default function FloatingAddButton() {
    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-8 right-8 z-50"
        >
            <Link
                href="/expenses"
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-[0_8px_30px_rgb(79,70,229,0.4)] border border-white/20 text-white"
            >
                <HiPlus className="w-8 h-8" />
            </Link>
        </motion.div>
    );
}
