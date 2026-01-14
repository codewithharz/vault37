"use client";

import { useEffect, useState } from "react";
import { ProfileHero } from "@/components/profile/ProfileHero";
import { InvestmentOverview } from "@/components/profile/InvestmentOverview";
import { TPIASection } from "@/components/profile/TPIASection";
import { GDCParticipation } from "@/components/profile/GDCParticipation";
import { EarningsWallet } from "@/components/profile/EarningsWallet";
import { ReferralSection } from "@/components/profile/ReferralSection";
import { ActivityFeed } from "@/components/profile/ActivityFeed";
import { CycleCalendar } from "@/components/profile/CycleCalendar";
import { UpcomingEvents } from "@/components/profile/UpcomingEvents";
import { CyclePerformanceChart } from "@/components/profile/CyclePerformanceChart";
import { NotificationCenter } from "@/components/profile/NotificationCenter";
import { AccountSettings } from "@/components/profile/AccountSettings";
import { Calendar } from "lucide-react";
import api from "@/lib/api";
import { useTranslations } from "next-intl";

interface ProfileData {
    user: any;
    stats: any;
    achievements: any[];
}

interface PortfolioData {
    summary: any;
    diversification: any[];
    performanceHistory: any[];
    tpias: any[];
}

import { motion } from "framer-motion";

export default function ProfilePage() {
    const t = useTranslations("Profile");
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(false);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            setError(false);
            const [profileRes, portfolioRes] = await Promise.all([
                api.get('/users/profile'),
                api.get('/users/portfolio')
            ]);

            setProfileData(profileRes.data.data);
            setPortfolioData(portfolioRes.data.data);
        } catch (error) {
            console.error("Failed to fetch profile data", error);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, []);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-8">
                    <div className="h-64 bg-gray-200 rounded-xl"></div>
                    <div className="h-96 bg-gray-200 rounded-xl"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">⚠️</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load profile</h2>
                <p className="text-gray-600 mb-6">We couldn't retrieve your profile data. Please try again.</p>
                <button
                    onClick={fetchProfileData}
                    className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <motion.div
            className="space-y-8 p-4 md:p-8"
            variants={container}
            initial="hidden"
            animate="show"
        >
            {/* Profile Hero Banner */}
            <motion.div variants={item}>
                <ProfileHero
                    user={profileData?.user}
                    stats={profileData?.stats}
                    achievements={profileData?.achievements || []}
                />
            </motion.div>

            {/* Investment Overview */}
            <motion.div variants={item}>
                <InvestmentOverview
                    summary={portfolioData?.summary}
                    diversification={portfolioData?.diversification || []}
                    performanceHistory={portfolioData?.performanceHistory || []}
                />
            </motion.div>

            {/* My TPIAs Section */}
            <motion.div variants={item}>
                <TPIASection tpias={portfolioData?.tpias || []} />
            </motion.div>

            {/* Additional Sections */}
            <motion.div variants={item} className="grid gap-6 lg:grid-cols-2">
                <GDCParticipation />
                <EarningsWallet />
            </motion.div>

            <motion.div variants={item} className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-6">
                    <ReferralSection />
                    <NotificationCenter />
                </div>
                <div className="space-y-6">
                    <ActivityFeed />
                    <AccountSettings user={profileData?.user} />
                </div>
            </motion.div>

            {/* Cycle Calendar Section */}
            <motion.div variants={item} className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-50 rounded-lg">
                            <Calendar className="w-5 h-5 text-amber-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Cycle Calendar</h3>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h4 className="font-semibold text-gray-700 mb-4 text-sm">Cycle Activity</h4>
                            <CycleCalendar tpias={portfolioData?.tpias || []} />
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h4 className="font-semibold text-gray-700 mb-4 text-sm">Performance Trend</h4>
                            <CyclePerformanceChart tpias={portfolioData?.tpias || []} />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        {/* Header alignment spacer */}
                        <div className="h-9 w-0"></div>
                        <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <UpcomingEvents tpias={portfolioData?.tpias || []} />
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
