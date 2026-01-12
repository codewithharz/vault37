"use client";

import { useState, useRef, useEffect } from "react";
import { User, LogOut, Settings, UserCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { clsx } from "clsx";

export function UserMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuth();
    const t = useTranslations("UserMenu");
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!user) return null;

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 rounded-full bg-blue-100 p-1 pr-3 transition-colors hover:bg-blue-200 focus:outline-none"
            >
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    <User className="h-5 w-5" />
                </div>
                <span className="hidden text-sm font-medium text-blue-900 md:block">
                    {user.fullName || "Admin"}
                </span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.fullName}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                        <Link
                            href="/admin/profile"
                            onClick={() => setIsOpen(false)}
                            className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <UserCircle className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                            {t("profile")}
                        </Link>
                        <Link
                            href="/admin/settings"
                            onClick={() => setIsOpen(false)}
                            className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <Settings className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                            {t("settings")}
                        </Link>
                    </div>

                    <div className="py-1 border-t border-gray-100">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                logout();
                            }}
                            className="group flex w-full items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="mr-3 h-4 w-4 text-red-500" />
                            {t("logout")}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
