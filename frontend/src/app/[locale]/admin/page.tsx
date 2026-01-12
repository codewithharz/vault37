"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { DashboardMetrics, DashboardStats } from "@/components/admin/DashboardMetrics";
import { RecentActivity, ActivityItem } from "@/components/admin/RecentActivity";
import { SystemStatus } from "@/components/admin/SystemStatus";
import { Users, ShieldCheck, ChevronRight, LayoutDashboard, Wallet } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/Card";

import { useTranslations } from "next-intl";

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | undefined>(undefined);
    const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const t = useTranslations("Dashboard");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/admin/dashboard');
                if (response.data.success) {
                    setStats(response.data.data);
                    setRecentActivity(response.data.data.recentActivity || []);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
                toast.error("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">{t('title')}</h2>
                    <p className="text-gray-500">{t('adminWelcome')}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                    <div className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-400 animate-pulse' : 'bg-green-500'}`} />
                    {loading ? t('updating') : t('live')}
                </div>
            </div>

            <DashboardMetrics data={stats} isLoading={loading} />

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/admin/users">
                    <Card className="hover:border-blue-300 transition-colors cursor-pointer group">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{t('manageUsers')}</h3>
                                    <p className="text-xs text-gray-500">{t('viewUserBase')}</p>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/approvals">
                    <Card className="hover:border-purple-300 transition-colors cursor-pointer group">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{t('approvalsCenter')}</h3>
                                    <p className="text-xs text-gray-500">{t('kycTransactions')}</p>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-500" />
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/tpia">
                    <Card className="hover:border-green-300 transition-colors cursor-pointer group">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{t('tpiaManagement')}</h3>
                                    <p className="text-xs text-gray-500">{t('monitorInvestments')}</p>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-green-500" />
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/gdc">
                    <Card className="hover:border-purple-300 transition-colors cursor-pointer group">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                    <LayoutDashboard className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{t('gdcManagement')}</h3>
                                    <p className="text-xs text-gray-500">{t('monitorClusters')}</p>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-500" />
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/wallet">
                    <Card className="hover:border-green-300 transition-colors cursor-pointer group">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
                                    <Wallet className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{t('walletManagement')}</h3>
                                    <p className="text-xs text-gray-500">{t('approveTransactions')}</p>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-green-500" />
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/reports">
                    <Card className="hover:border-blue-300 transition-colors cursor-pointer group">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <LayoutDashboard className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{t('financialReports')}</h3>
                                    <p className="text-xs text-gray-500">{t('analyticsExports')}</p>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                        </CardContent>
                    </Card>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-full lg:col-span-4 h-full">
                    <RecentActivity activities={recentActivity} />
                </div>
                <div className="col-span-full lg:col-span-3 h-full">
                    <SystemStatus />
                </div>
            </div>
        </div>
    );
}
