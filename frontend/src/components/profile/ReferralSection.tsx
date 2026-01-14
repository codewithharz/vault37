"use client";

import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import api from "@/lib/api";
import { ReferralCodeCard } from "./ReferralCodeCard";
import { ReferralHistory } from "./ReferralHistory";

interface ReferralData {
    referralCode: string;
    totalReferrals: number;
    activeReferrals: number;
    referralEarnings: number;
    referredUsers: Array<{
        joinDate: Date;
        status: string;
        hasTPIA: boolean;
        earnings: number;
    }>;
}

export function ReferralSection() {
    const [referralData, setReferralData] = useState<ReferralData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReferralData = async () => {
            try {
                const response = await api.get('/users/referrals');
                setReferralData(response.data.data);
            } catch (error) {
                console.error("Failed to fetch referral data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReferralData();
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-50 rounded-lg">
                    <Users className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Referral Program</h3>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{referralData?.totalReferrals || 0}</p>
                    <p className="text-xs text-gray-600 mt-1">Total Referrals</p>
                </div>
                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                    <p className="text-2xl font-bold text-emerald-600">{referralData?.activeReferrals || 0}</p>
                    <p className="text-xs text-gray-600 mt-1">Active</p>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                    <p className="text-2xl font-bold text-amber-600">₦{(referralData?.referralEarnings || 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-600 mt-1">Earnings</p>
                </div>
            </div>

            {/* Referral Code Card */}
            <ReferralCodeCard referralCode={referralData?.referralCode || ''} />

            {/* Referral List */}
            <ReferralHistory referredUsers={referralData?.referredUsers || []} />
        </div>
    );
}
