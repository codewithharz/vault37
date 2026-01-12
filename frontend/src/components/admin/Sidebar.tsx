"use client";

import { Link } from '@/i18n/navigation';
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Wallet,
    Settings,
    PieChart,
    FileText,
    Briefcase
} from "lucide-react";
import { clsx } from "clsx";

import { useTranslations } from "next-intl";

export function Sidebar() {
    const pathname = usePathname();
    const t = useTranslations("AdminNavigation");

    const navigation = [
        { name: t('dashboard'), href: '/admin', icon: LayoutDashboard },
        { name: t('tpia'), href: '/admin/tpia', icon: Briefcase },
        { name: t('gdc'), href: '/admin/gdc', icon: PieChart },
        { name: t('approvals'), href: '/admin/approvals', icon: Briefcase },
        { name: t('wallet'), href: '/admin/wallet', icon: Wallet },
        { name: t('users'), href: '/admin/users', icon: Users },
        { name: t('reports'), href: '/admin/reports', icon: FileText },
        { name: t('settings'), href: '/admin/settings', icon: Settings },
    ];

    return (
        <div className="flex w-64 flex-col bg-white border-r border-gray-200 min-h-screen">
            <div className="flex h-16 items-center px-6 border-b border-gray-100">
                <span className="text-xl font-bold text-gray-900">Vault37</span>
                <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">{t('admin')}</span>
            </div>

            <nav className="flex-1 space-y-1 px-4 py-4">
                {navigation.map((item) => {
                    const isActive = pathname.includes(item.href) && (item.href !== '/admin' || pathname.endsWith('/admin'));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                isActive
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                                'group flex items-center px-3 py-2 text-sm font-medium rounded-md'
                            )}
                        >
                            <item.icon
                                className={clsx(
                                    isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500',
                                    'mr-3 h-5 w-5 flex-shrink-0'
                                )}
                                aria-hidden="true"
                            />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
