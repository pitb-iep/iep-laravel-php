"use client";

import { motion } from "framer-motion";

interface RibbonProps {
    isCut: boolean;
}

export const Ribbon = ({ isCut }: RibbonProps) => {
    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40 overflow-hidden pt-64 md:pt-72 lg:pt-80">
            {/* Left Side of Ribbon */}
            <motion.div
                initial={{ x: 0, opacity: 1 }}
                animate={isCut ? { x: "-100%", opacity: 0 } : { x: 0, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="h-16 md:h-20 w-1/2 bg-gradient-to-r from-[#8A6E2F] via-[#D4AF37] to-[#F5D061] shadow-2xl relative flex items-center justify-end overflow-hidden"
            >
                {/* Silk Sheen Effect */}
                <div className="h-full w-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer absolute inset-0"></div>
                {/* Fabric Grain / Texture */}
                <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/silk.png')]"></div>
                {/* Gold Borders */}
                <div className="h-[2px] w-full bg-gradient-to-r from-yellow-200/50 via-yellow-100 to-yellow-200/50 absolute top-0 left-0"></div>
                <div className="h-[2px] w-full bg-gradient-to-r from-yellow-200/50 via-yellow-100 to-yellow-200/50 absolute bottom-0 left-0"></div>
            </motion.div>

            {/* Right Side of Ribbon */}
            <motion.div
                initial={{ x: 0, opacity: 1 }}
                animate={isCut ? { x: "100%", opacity: 0 } : { x: 0, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="h-16 md:h-20 w-1/2 bg-gradient-to-r from-[#F5D061] via-[#D4AF37] to-[#8A6E2F] shadow-2xl relative flex items-center justify-start overflow-hidden"
            >
                {/* Silk Sheen Effect */}
                <div className="h-full w-full bg-[linear-gradient(-45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer absolute inset-0"></div>
                {/* Fabric Grain / Texture */}
                <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/silk.png')]"></div>
                {/* Gold Borders */}
                <div className="h-[2px] w-full bg-gradient-to-r from-yellow-200/50 via-yellow-100 to-yellow-200/50 absolute top-0 right-0"></div>
                <div className="h-[2px] w-full bg-gradient-to-r from-yellow-200/50 via-yellow-100 to-yellow-200/50 absolute bottom-0 right-0"></div>
            </motion.div>

            {/* Cut Point Shine Effect */}
            {!isCut && (
                <motion.div
                    animate={{
                        opacity: [0.3, 0.6, 0.3],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute h-32 w-8 bg-white/40 blur-2xl z-20"
                />
            )}
        </div>
    );
};
