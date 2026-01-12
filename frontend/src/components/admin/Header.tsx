"use client";

import { Bell, Search } from "lucide-react";
import { Button } from "../ui/Button";
import { UserMenu } from "./UserMenu";
import { LanguageSwitcher } from "../user/LanguageSwitcher";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";

export function Header() {
    const t = useTranslations("Header");
    const { user } = useAuth();

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
            <div className="flex items-center gap-4">
                <h1 className="text-lg font-semibold text-gray-900">{t('myDashboard')}</h1>
            </div>

            <div className="flex items-center gap-4">
                <LanguageSwitcher />

                <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600 ring-2 ring-white"></span>
                </Button>

                <UserMenu />
            </div>
        </header>
    );
}
