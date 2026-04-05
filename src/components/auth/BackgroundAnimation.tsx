'use client';

import { motion } from 'framer-motion';

export const BackgroundAnimation = () => {
    return (
        <div className="absolute inset-0 overflow-hidden z-0">
            <div className="absolute inset-0 bg-background" />

            {/* Subtle animated accent element */}
            <motion.div
                animate={{
                    opacity: [0.05, 0.1, 0.05],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute -top-40 -right-40 w-80 h-80 bg-primary rounded-full"
            />

            {/* Grid Pattern */}
            <div
                className="absolute inset-0 opacity-5"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />
        </div>
    );
};
