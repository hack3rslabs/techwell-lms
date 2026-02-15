"use client"

import { motion } from "framer-motion"

interface LoginCharacterProps {
    state: "normal" | "shy" | "peeking"
}

export function LoginCharacter({ state }: LoginCharacterProps) {
    return (
        <div className="flex justify-center mb-6 h-32 relative">
            <div className="w-32 h-32 relative">
                {/* Face/Head */}
                <motion.div
                    className="absolute inset-0 bg-primary/20 dark:bg-primary/30 rounded-full border-4 border-primary/40 backdrop-blur-md shadow-2xl overflow-hidden"
                    animate={{
                        scale: state === "shy" ? 0.95 : 1,
                        rotate: state === "peeking" ? -8 : 0,
                        y: state === "shy" ? 5 : 0
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                    {/* Eyes Container */}
                    <div className="absolute top-[35%] left-0 w-full flex justify-center gap-6">
                        {/* Left Eye */}
                        <div className="relative w-7 h-7">
                            <motion.div
                                className="absolute inset-0 bg-white rounded-full border-2 border-primary"
                                animate={{
                                    height: state === "shy" ? "4px" : "100%",
                                    top: state === "shy" ? "12px" : "0px",
                                }}
                            />
                            <motion.div
                                className="absolute w-4 h-4 bg-primary rounded-full left-1.5 top-1.5 shadow-inner"
                                animate={{
                                    scale: state === "shy" ? 0 : (state === "peeking" ? 0.8 : 1),
                                    opacity: state === "shy" ? 0 : 1,
                                    x: state === "peeking" ? 3 : 0,
                                }}
                            />
                        </div>

                        {/* Right Eye */}
                        <div className="relative w-7 h-7">
                            <motion.div
                                className="absolute inset-0 bg-white rounded-full border-2 border-primary"
                                animate={{
                                    height: (state === "shy" || state === "peeking") ? "4px" : "100%",
                                    top: (state === "shy" || state === "peeking") ? "12px" : "0px",
                                }}
                            />
                            <motion.div
                                className="absolute w-4 h-4 bg-primary rounded-full left-1.5 top-1.5 shadow-inner"
                                animate={{
                                    scale: (state === "shy" || state === "peeking") ? 0 : 1,
                                    opacity: (state === "shy" || state === "peeking") ? 0 : 1,
                                }}
                            />
                        </div>
                    </div>

                    {/* Nose/Beak */}
                    <motion.div
                        className="absolute top-[55%] left-1/2 -translate-x-1/2 w-5 h-4 bg-primary/60 rounded-full shadow-sm"
                        animate={{
                            y: state === "shy" ? 3 : 0
                        }}
                    />

                    {/* Hands covering eyes (Shy state) */}
                    <motion.div
                        className="absolute bottom-0 left-0 w-full h-full pointer-events-none"
                        initial={false}
                        animate={{
                            y: state === "shy" ? "0%" : (state === "peeking" ? "35%" : "100%"),
                        }}
                        transition={{ type: "spring", damping: 12, stiffness: 100 }}
                    >
                        {/* Left Hand */}
                        <div className="absolute left-1 top-8 w-16 h-16 bg-primary/40 rounded-full dark:bg-primary/50 border-2 border-primary/20 shadow-lg transform -rotate-12" />
                        {/* Right Hand */}
                        <div className="absolute right-1 top-8 w-16 h-16 bg-primary/40 rounded-full dark:bg-primary/50 border-2 border-primary/20 shadow-lg transform rotate-12" />
                    </motion.div>
                </motion.div>

                {/* Ears */}
                <div className="absolute -top-1 -left-1 w-12 h-12 bg-primary/20 dark:bg-primary/30 rounded-tr-[2.5rem] rotate-[-20deg] -z-10 border-2 border-primary/10 shadow-md" />
                <div className="absolute -top-1 -right-1 w-12 h-12 bg-primary/20 dark:bg-primary/30 rounded-tl-[2.5rem] rotate-[20deg] -z-10 border-2 border-primary/10 shadow-md" />
            </div>
        </div>
    )
}
