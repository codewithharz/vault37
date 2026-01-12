"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface TooltipProps {
    content: string;
    children: React.ReactNode;
    className?: string;
    position?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({ content, children, className, position = "top" }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);

    const positionClasses = {
        top: "bottom-full left-1/2 -translate-x-1/2 mb-2.5",
        bottom: "top-full left-1/2 -translate-x-1/2 mt-2.5",
        left: "right-full top-1/2 -translate-y-1/2 mr-2.5",
        right: "left-full top-1/2 -translate-y-1/2 ml-2.5",
    };

    const arrowClasses = {
        top: "top-full left-1/2 -translate-x-1/2 border-t-gray-900/95",
        bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-gray-900/95",
        left: "left-full top-1/2 -translate-y-1/2 border-l-gray-900/95",
        right: "right-full top-1/2 -translate-y-1/2 border-r-gray-900/95",
    };

    return (
        <div
            className="group relative inline-flex items-center isolate"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            onFocus={() => setIsVisible(true)}
            onBlur={() => setIsVisible(false)}
        >
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: position === 'top' ? 4 : position === 'bottom' ? -4 : 0, x: position === 'top' || position === 'bottom' ? '-50%' : (position === 'left' ? 4 : -4), scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, x: position === 'top' || position === 'bottom' ? '-50%' : 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                        style={{
                            perspective: '1000px',
                            WebkitBackdropFilter: 'blur(12px)',
                            backdropFilter: 'blur(12px)',
                            backgroundColor: 'rgba(3, 7, 18, 0.95)' // Explicit fallback for bg-gray-950/95
                        }}
                        className={cn(
                            "absolute z-[100] px-4 py-2.5 text-[13px] leading-relaxed font-semibold text-white",
                            "border border-white/10 rounded-xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]",
                            "whitespace-normal w-[max-content] min-w-[200px] max-w-[280px] pointer-events-none select-none",
                            "transform-gpu antialiased", // Hardware acceleration for smoother Safari rendering
                            positionClasses[position],
                            className
                        )}
                    >
                        {content}
                        <div
                            className={cn(
                                "absolute border-[6px] border-transparent",
                                arrowClasses[position]
                            )}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
