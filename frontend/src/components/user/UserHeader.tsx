import { Bell, Search, User, Wallet } from "lucide-react";
import { Button } from "../ui/Button";
import { useStore } from "@/store/useStore";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslations } from "next-intl";

export function UserHeader() {
    const t = useTranslations("Header");
    const { user } = useStore();

    return (
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
            <div className="flex items-center">
                <div className="flex flex-col">
                    <h1 className="text-lg font-bold text-gray-900 leading-tight">
                        {user && user.fullName ? t('welcome', { name: user.fullName.split(' ')[0] }) : t('myDashboard')}
                    </h1>
                    {user && <span className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">{t('modeActive', { mode: user.mode })}</span>}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden md:flex relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder={t('searchPlaceholder')}
                        className="h-9 w-64 rounded-md border border-gray-300 pl-9 pr-4 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                </div>

                <Button size="sm" className="hidden sm:flex bg-amber-600 hover:bg-amber-700 text-white border-none">
                    <Wallet className="mr-2 h-4 w-4" />
                    {t('deposit')}
                </Button>

                <div className="h-8 w-1px bg-gray-200 mx-2"></div>

                <LanguageSwitcher />

                <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600 ring-2 ring-white"></span>
                </Button>

                <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-xs font-bold ring-2 ring-amber-50 shadow-sm">
                    {user ? (
                        user && user.fullName ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : <User className="h-5 w-5" />
                    ) : (
                        <User className="h-5 w-5" />
                    )}
                </div>
            </div>
        </header>
    );
}
