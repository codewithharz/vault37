import { ReactNode } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CardProps {
    children: ReactNode;
    className?: string;
}

export function Card({ children, className }: CardProps) {
    return (
        <div className={cn("bg-white rounded-xl shadow-sm border border-gray-200", className)}>
            {children}
        </div>
    );
}

export function CardHeader({ children, className }: CardProps) {
    return (
        <div className={cn("p-6 border-b border-gray-100", className)}>
            {children}
        </div>
    );
}

export function CardContent({ children, className }: CardProps) {
    return (
        <div className={cn("p-6", className)}>
            {children}
        </div>
    );
}

export function CardTitle({ children, className }: CardProps) {
    return (
        <h3 className={cn("text-lg font-semibold text-gray-900 leading-none tracking-tight", className)}>
            {children}
        </h3>
    );
}

export function CardDescription({ children, className }: CardProps) {
    return (
        <p className={cn("text-sm text-gray-500", className)}>
            {children}
        </p>
    );
}
