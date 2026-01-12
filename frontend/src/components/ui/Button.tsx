import { ReactNode, ButtonHTMLAttributes } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    className?: string;
}

export function Button({
    children,
    variant = "primary",
    size = "md",
    className,
    ...props
}: ButtonProps) {
    const variants = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white",
        secondary: "bg-gray-100 hover:bg-gray-200 text-gray-900",
        outline: "border border-gray-300 hover:bg-gray-50 text-gray-700",
        ghost: "hover:bg-gray-100 text-gray-600",
        danger: "bg-red-600 hover:bg-red-700 text-white"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base"
    };

    return (
        <button
            className={cn(
                "rounded-lg font-medium transition-colors flex items-center justify-center gap-2",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
