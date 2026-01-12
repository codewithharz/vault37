import { Bell, Search, User, Wallet, LogOut, Settings, CreditCard, Users, HelpCircle, UserCircle, ChevronDown } from "lucide-react";
import { Button } from "../ui/Button";
import { useStore } from "@/store/useStore";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslations } from "next-intl";
import { useState, useRef, useEffect } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/context/AuthContext";
import { clsx } from "clsx";

export function UserHeader() {
    const t = useTranslations("Header");
    const tMenu = useTranslations("UserMenu");
    const { user } = useStore();
    const { logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const menuItems = [
        { label: tMenu('profile'), href: '/dashboard/settings', icon: UserCircle },
        { label: tMenu('billing'), href: '/dashboard/wallet', icon: CreditCard },
        { label: tMenu('settings'), href: '/dashboard/settings', icon: Settings },
        { label: tMenu('referrals'), href: '/dashboard/settings', icon: Users },
        { label: tMenu('support'), href: '/dashboard/settings', icon: HelpCircle },
    ];

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

                {/* User Dropdown */}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-50 transition-colors"
                    >
                        <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-xs font-bold ring-2 ring-amber-50 shadow-sm overflow-hidden">
                            {user?.fullName ? (
                                user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()
                            ) : (
                                <User className="h-5 w-5" />
                            )}
                        </div>
                        <ChevronDown className={clsx("h-4 w-4 text-gray-400 transition-transform", isMenuOpen && "rotate-180")} />
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="px-4 py-2 border-b border-gray-50 mb-1">
                                <p className="text-sm font-bold text-gray-900 truncate">{user?.fullName}</p>
                                <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                            </div>

                            {menuItems.map((item, idx) => (
                                <Link
                                    key={idx}
                                    href={item.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            ))}

                            <div className="border-t border-gray-50 mt-1 pt-1">
                                <button
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        logout();
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    {tMenu('logout')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
