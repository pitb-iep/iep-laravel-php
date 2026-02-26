'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { SidebarContent } from './Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

export default function MobileNav() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="md:hidden fixed top-0 left-0 w-full z-50 pointer-events-none">
            {/* Header Trigger */}
            <div className="p-4 flex items-center pointer-events-auto">
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2 bg-white/90 backdrop-blur shadow-md rounded-xl text-[hsl(var(--primary-hue),70%,60%)] border border-slate-100"
                >
                    <Menu className="w-6 h-6" />
                </button>
                {/* Optional: Add Logo or Title here if needed for mobile sticky header */}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 pointer-events-auto"
                        />
                        {/* Drawer */}
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 h-full w-[80%] max-w-[300px] bg-white z-50 p-6 flex flex-col shadow-2xl pointer-events-auto"
                        >
                            <div className="flex justify-end mb-2">
                                <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <SidebarContent onClose={() => setIsOpen(false)} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
