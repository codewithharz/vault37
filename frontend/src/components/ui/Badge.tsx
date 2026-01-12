import { ReactNode } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface BadgeProps {
    children: ReactNode;
    variant?: "success" | "warning" | "error" | "info" | "default";
    className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
    const variants = {
        success: "bg-green-100 text-green-700 border-green-200",
        warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
        error: "bg-red-100 text-red-700 border-red-200",
        info: "bg-blue-100 text-blue-700 border-blue-200",
        default: "bg-gray-100 text-gray-700 border-gray-200"
    };

    return (
        <span className={cn(
            "px-2.5 py-0.5 rounded-full text-xs font-medium border",
            variants[variant],
            className
        )}>
            {children}
        </span>
    );
}
