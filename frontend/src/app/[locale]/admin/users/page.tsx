"use client";

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import api from '@/lib/api';
import {
    Search,
    Filter,
    User as UserIcon,
    CheckCircle,
    XCircle,
    Clock,
    MoreHorizontal,
    Eye,
    Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Link } from '@/i18n/navigation';
import { clsx } from 'clsx';
import { UserDetailsModal } from '@/components/admin/UserDetailsModal';

export default function AdminUsersPage() {
    const t = useTranslations("AdminUsers");
    const tCommon = useTranslations("Common");
    const locale = useLocale();

    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [pagination, setPagination] = useState({ page: 1, pages: 1 });

    // Modal state
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/users', {
                params: {
                    search,
                    status: statusFilter,
                    role: roleFilter,
                    page: pagination.page,
                    limit: 10
                }
            });
            setUsers(response.data.data.users);
            setPagination(response.data.data.pagination);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [search, statusFilter, roleFilter, pagination.page]);

    const getStatusBadge = (status: string) => {
        const labels = {
            verified: t('status.verified'),
            pending: t('status.pending'),
            rejected: t('status.rejected'),
            unverified: t('status.unverified')
        };

        const currentLabel = labels[status as keyof typeof labels] || labels.unverified;

        switch (status) {
            case 'verified':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> {currentLabel}</span>;
            case 'pending':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"><Clock className="w-3 h-3 mr-1" /> {currentLabel}</span>;
            case 'rejected':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> {currentLabel}</span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{currentLabel}</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">{t('title')}</h2>
                    <p className="text-gray-500">{t('description')}</p>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3 border-b border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t('searchPlaceholder')}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <select
                                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="">{t('filters.kycStatus')}</option>
                                <option value="verified">{t('status.verified')}</option>
                                <option value="pending">{t('status.pending')}</option>
                                <option value="rejected">{t('status.rejected')}</option>
                                <option value="unverified">{t('status.unverified')}</option>
                            </select>
                            <select
                                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <option value="">{t('filters.roles')}</option>
                                <option value="user">{t('roles.user')}</option>
                                <option value="admin">{t('roles.admin')}</option>
                                <option value="auditor">{t('roles.auditor')}</option>
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 text-left">{t('table.user')}</th>
                                    <th className="px-6 py-4 text-left">{t('table.kycStatus')}</th>
                                    <th className="px-6 py-4 text-left">{t('table.role')}</th>
                                    <th className="px-6 py-4 text-left">{t('table.joined')}</th>
                                    <th className="px-6 py-4 text-right">{t('table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-48"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                                            <td className="px-6 py-4"></td>
                                        </tr>
                                    ))
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            {t('noData')}
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={clsx(
                                                        "h-10 w-10 rounded-full flex items-center justify-center font-bold text-gray-900",
                                                        user.isActive ? "bg-blue-100" : "bg-red-100"
                                                    )}>
                                                        {user.fullName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                                            {user.fullName}
                                                            {!user.isActive && <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded border border-red-200 uppercase">{t('status.banned')}</span>}
                                                        </div>
                                                        <div className="text-xs text-gray-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(user.kycStatus)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={clsx(
                                                    "inline-flex items-center gap-1 font-medium text-sm",
                                                    user.role === 'admin' ? 'text-purple-600' : 'text-gray-600'
                                                )}>
                                                    {user.role === 'admin' && <Shield className="w-3 h-3" />}
                                                    {t(`roles.${user.role as 'user' | 'admin' | 'auditor'}`)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {new Date(user.createdAt).toLocaleDateString(locale)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="inline-flex items-center gap-1"
                                                    onClick={() => setSelectedUserId(user._id)}
                                                >
                                                    <Eye className="w-4 h-4" /> {t('actions.manage')}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                        {tCommon('pagination.pageInfo', { page: pagination.page, pages: pagination.pages })}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.page <= 1}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        >
                            {tCommon('pagination.previous')}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.page >= pagination.pages}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        >
                            {tCommon('pagination.next')}
                        </Button>
                    </div>
                </div>
            </Card>

            <UserDetailsModal
                isOpen={!!selectedUserId}
                onClose={() => setSelectedUserId(null)}
                userId={selectedUserId}
                onUpdate={fetchUsers}
            />
        </div>
    );
}
