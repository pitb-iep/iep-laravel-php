"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { triggerConfetti, triggerRibbonCutConfetti } from "@/lib/confetti";
import { Ribbon } from "@/components/Inauguration/Ribbon";
import { Scissors } from "lucide-react";

export default function InaugurationPage() {
    const [isCut, setIsCut] = useState(false);
    const [showContent, setShowContent] = useState(true);
    const router = useRouter();

    const handleCut = () => {
        setIsCut(true);
        triggerRibbonCutConfetti();
        triggerConfetti();

        // After celebration, show "System Operational"
        setTimeout(() => {
            setShowContent(false);
        }, 2500);

        // Redirect
        setTimeout(() => {
            router.push("/dashboard");
        }, 5000);
    };

    return (
        <div className="relative min-h-screen w-full bg-[#0a0f1c] overflow-hidden flex flex-col items-center justify-center font-sans selection:bg-yellow-500 selection:text-black">

            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0">
                {/* Image Background with Overlay */}
                <div
                    className="absolute inset-0 bg-cover bg-no-repeat"
                    style={{
                        backgroundImage: "url('/inaug-banner.png')",
                        backgroundPosition: "center 15%"
                    }}
                >
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"></div>
                </div>

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(17,24,39,0)_0%,_rgba(0,0,0,0.4)_100%)]"></div>

                {/* Subtle animated spotlights */}
                <motion.div
                    animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
                    transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
                    className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px]"
                />
                <motion.div
                    animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
                    transition={{ duration: 7, repeat: Infinity, repeatType: "reverse", delay: 1 }}
                    className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[128px]"
                />
            </div>

            {/* 
        LAYER ORDER:
        1. Background (z-0)
        2. Content Card (z-20) - BEHIND ribbon visual, but clickable? 
           Actually, usually ribbon is in FRONT of the door/plaque.
           So Text should be BEHIND ribbon?
           If Text is "Welcome CM", maybe the Ribbon is the "Gift Wrap".
           Let's put the Ribbon at z-30 (defined in component) and Text Container at z-20.
           BUT, the Button needs to be z-50 to be clickable.
           
           Wait, if text is z-20 and ribbon z-30, ribbon covers text.
           Design choice: Text should be ABOVE ribbon? No, that looks weird floating.
           
           ADJUSTMENT: 
           Top Section: "Official Inauguration" (z-20)
           Middle: Ribbon (z-30)
           Bottom: "Madam Maryam Nawaz" (z-20)
           
           Alternatively, make the Ribbon Semi-Transparent or thinner?
           Or just place the text carefully above/below the ribbon zone.
           
           Let's design the layout so text doesn't clash with the center ribbon line.
       */}

            <Ribbon isCut={isCut} />

            <div className="z-40 relative flex flex-col items-center w-full max-w-5xl px-4">

                <AnimatePresence mode="wait">
                    {showContent ? (
                        <motion.div
                            key="ceremony"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                            transition={{ duration: 1 }}
                            className="flex flex-col items-center text-center space-y-12"
                        >

                            {/* Top Text - Above Ribbon */}
                            <div className="space-y-4 transform -translate-y-8">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="flex items-center justify-center gap-4 !text-[#F5D061] mb-2 md:mb-6"
                                >
                                    <div className="h-[1px] w-12 md:w-16 bg-gradient-to-r from-transparent to-[#F5D061]"></div>
                                    <span className="uppercase tracking-[0.2em] md:tracking-[0.4em] text-[10px] md:text-sm font-semibold !text-[#F5D061]">Official Ceremony</span>
                                    <div className="h-[1px] w-12 md:w-16 bg-gradient-to-l from-transparent to-[#F5D061]"></div>
                                </motion.div>

                                <h1 className="text-xl md:text-2xl lg:text-3xl font-extralight !text-white tracking-tight !drop-shadow-lg opacity-90">
                                    Welcome, Honorable
                                </h1>
                                <div className="flex flex-col items-center gap-1 md:gap-2 mt-1">
                                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif !text-[#F5D061] drop-shadow-2xl tracking-wide font-bold text-center leading-tight">
                                        Chief Minister Punjab
                                    </h2>
                                    <h2
                                        className="text-3xl md:text-4xl lg:text-6xl font-bold font-serif !text-transparent bg-clip-text bg-gradient-to-b !from-[#FFF5D1] !via-[#F5D061] !to-[#D4AF37] pb-2 drop-shadow-2xl leading-tight text-center max-w-4xl"
                                        style={{ WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent !important' }}
                                    >
                                        Madam Maryam Nawaz Sharif
                                    </h2>
                                </div>
                                {/* Logo Container */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="relative flex justify-center w-full"
                                >
                                    <img src="/logo.png" alt="Autism 360 Logo" className="w-28 h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 object-contain drop-shadow-2xl" />
                                </motion.div>
                            </div>

                            {/* Spacer for Ribbon */}
                            <div className="h-10"></div>

                            {/* Bottom Text - Below Ribbon */}
                            <div className="space-y-8 transform translate-y-4 w-full flex flex-col items-center">



                                <p className="text-slate-300 max-w-lg mx-auto text-lg md:text-xl leading-relaxed font-light">
                                    We are honored to have you inaugurate the <br />
                                    <span className="text-white font-semibold tracking-wide">Autism 360 Platform</span>
                                </p>

                                {/* Inaugurate Button */}
                                <motion.button
                                    whileHover={{ scale: 1.05, filter: "brightness(1.2)" }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleCut}
                                    disabled={isCut}
                                    className={`
                        relative group overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-slate-900
                        ${isCut ? 'pointer-events-none opacity-0 duration-500' : ''}
                      `}
                                >
                                    <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2E8F0_0%,#500724_50%,#E2E8F0_100%)]" />
                                    <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-10 py-5 text-xl font-medium text-white backdrop-blur-3xl gap-3">
                                        <Scissors className="w-6 h-6 text-yellow-400 group-hover:rotate-[-45deg] transition-transform duration-300" />
                                        <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Inaugurate Platform</span>
                                    </span>
                                </motion.button>
                            </div>

                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            className="relative z-50 flex flex-col items-center justify-center space-y-8"
                        >
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                className="w-32 h-32 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/50 shadow-[0_0_100px_rgba(34,197,94,0.4)]"
                            >
                                <svg className="w-16 h-16 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </motion.div>

                            <div className="text-center space-y-2">
                                <h2 className="text-4xl font-bold text-white tracking-tight !text-[#F5D061]">System Operational</h2>
                                <p className="text-slate-400 text-lg">Launching Dashboard...</p>
                            </div>

                            {/* Loading Bar */}
                            <div className="w-64 h-1 bg-slate-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 2.5 }}
                                    className="h-full bg-green-500"
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>

            <footer className="absolute bottom-6 z-40 !text-slate-300 text-xs tracking-widest uppercase">
                Punjab Information Technology Board &bull; Special Education Department
            </footer>
        </div>
    );
}
