"use client";

import { Link } from '@/i18n/navigation';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Wallet,
    Settings,
    PieChart,
    ShoppingBag,
    TrendingUp,
    History
} from "lucide-react";
import { clsx } from "clsx";
import { useTranslations } from 'next-intl';

const getNavigation = (t: any) => [
    { name: t('overview'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('portfolio'), href: '/dashboard/portfolio', icon: PieChart },
    { name: t('market'), href: '/dashboard/market', icon: ShoppingBag },
    { name: t('wallet'), href: '/dashboard/wallet', icon: Wallet },
    { name: t('growth'), href: '/dashboard/growth', icon: TrendingUp },
    { name: t('history'), href: '/dashboard/history', icon: History },
    { name: t('settings'), href: '/dashboard/settings', icon: Settings },
];

export function UserSidebar() {
    const pathname = usePathname();
    const tNav = useTranslations("Navigation");
    const tSidebar = useTranslations("Sidebar");
    const tSettings = useTranslations("Settings");
    const navigation = getNavigation(tNav);

    return (
        <div className="flex w-64 flex-col bg-white border-r border-gray-200 min-h-screen">
            <div className="flex h-16 items-center px-6 border-b border-gray-100">
                <span className="text-xl font-bold text-gray-900">Vault37</span>
                <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">{tSettings("investor")}</span>
            </div>

            <nav className="flex-1 space-y-1 px-4 py-4">
                {navigation.map((item) => {
                    const isActive = pathname.split('/').slice(2).join('/') === item.href.split('/').slice(1).join('/') ||
                        (item.href === '/dashboard' && (pathname.endsWith('/dashboard') || pathname.endsWith('/dashboard/')));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                isActive
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                                'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors'
                            )}
                        >
                            <item.icon
                                className={clsx(
                                    isActive ? 'text-amber-700' : 'text-gray-400 group-hover:text-gray-500',
                                    'mr-3 h-5 w-5 flex-shrink-0'
                                )}
                                aria-hidden="true"
                            />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4 text-white">
                    <h4 className="text-sm font-semibold">{tSidebar('helpTitle')}</h4>
                    <p className="text-xs text-gray-300 mt-1">{tSidebar('helpDesc')}</p>
                </div>
            </div>

        </div>
    );
}