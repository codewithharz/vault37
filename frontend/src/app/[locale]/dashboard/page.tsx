"use client";

import { useEffect, useState, Suspense } from "react";
import { PortfolioOverview } from "@/components/user/PortfolioOverview";
import { ActiveTPIAs } from "@/components/user/ActiveTPIAs";
import { WalletCard } from "@/components/user/WalletCard";
import { RecentActivity } from "@/components/user/RecentActivity";
import { ReferralCard } from "@/components/user/ReferralCard";
import { SecurityCard } from "@/components/user/SecurityCard";
import { MaturityCountdown } from "@/components/user/MaturityCountdown";
import { PaymentSuccessModal } from "@/components/user/PaymentSuccessModal";
import api from "@/lib/api";
import { useTranslations } from "next-intl";
import { useStore } from "@/store/useStore";
import { useSearchParams, useRouter } from "next/navigation";

export default function UserDashboard() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-gray-500 font-medium">Loading Dashboard...</div>}>
            <DashboardContent />
        </Suspense>
    );
}

function DashboardContent() {
    const t = useTranslations("Dashboard");
    const { user, fetchProfile, fetchWallet } = useStore();
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [activeTPIAs, setActiveTPIAs] = useState([]);
    const [portfolioData, setPortfolioData] = useState({
        totalInvested: 0,
        currentValue: 0,
        totalProfit: 0,
        roi: 0
    });
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successData, setSuccessData] = useState({ amount: "0", reference: "" });

    const searchParams = useSearchParams();
    const router = useRouter();

    const fetchDashboardData = async () => {
        if (!api.defaults.headers.common['Authorization'] && !localStorage.getItem('token')) {
            return;
        }

        try {
            const [portfolioRes, tpiasRes, txRes] = await Promise.all([
                api.get('/users/portfolio').catch(() => ({ data: { data: { summary: { totalInvested: 0, currentValue: 0 } } } })),
                api.get('/tpia/my-tpias').catch(() => ({ data: { data: { tpias: [] } } })),
                api.get('/wallet/transactions?limit=5').catch(() => ({ data: { data: { transactions: [] } } }))
            ]);

            const portfolioSummary = portfolioRes.data.data?.summary || {};
            const tpiasListData = tpiasRes.data.data?.tpias || [];
            const txData = txRes.data.data?.transactions || [];

            const totalInvested = portfolioSummary.totalInvested || 0;
            const currentValue = portfolioSummary.currentValue || 0;
            const totalProfit = currentValue - totalInvested;
            const roi = totalInvested ? Number(((totalProfit / totalInvested) * 100).toFixed(1)) : 0;

            setPortfolioData({
                totalInvested,
                currentValue,
                totalProfit,
                roi
            });

            setActiveTPIAs(tpiasListData.slice(0, 5));
            setRecentTransactions(txData);

        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        }
    };

    useEffect(() => {
        const status = searchParams.get('status');
        if (status === 'success') {
            setSuccessData({
                amount: searchParams.get('amount') || "0",
                reference: searchParams.get('reference') || ""
            });
            setIsSuccessModalOpen(true);

            // Clean up URL parameters
            const params = new URLSearchParams(searchParams.toString());
            params.delete('status');
            params.delete('amount');
            params.delete('reference');
            const newUrl = params.toString() ? `/dashboard?${params.toString()}` : '/dashboard';
            router.replace(newUrl, { scroll: false });
        }

        fetchProfile();
        fetchWallet();
        fetchDashboardData();
    }, [fetchProfile, fetchWallet, searchParams, router]);

    return (
        <div className="space-y-8 p-4 md:p-8">
            <PaymentSuccessModal
                isOpen={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
                amount={successData.amount}
                reference={successData.reference}
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        {t('userWelcome', { name: user?.fullName?.split(' ')[0] || 'User' })}
                    </h1>
                    <p className="text-gray-500 font-medium">{t('userSubtitle')}</p>
                </div>
            </div>

            <PortfolioOverview stats={portfolioData} />

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <ActiveTPIAs tpias={activeTPIAs} />
                    <RecentActivity transactions={recentTransactions} />
                </div>
                <div className="space-y-4">
                    <WalletCard />
                    <ReferralCard />
                    <MaturityCountdown />
                    <SecurityCard />
                </div>
            </div>
        </div>
    );
}
