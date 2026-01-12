"use client";

import { Card, CardContent } from "../ui/Card";
import { ShieldCheck, History, ShieldAlert, CheckCircle2, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";

export function SecurityCard() {
    const t = useTranslations("Security");
    const { user } = useStore();

    const kycStatus = user?.kycStatus || "pending";

    const statusMap = {
        verified: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50", text: t('verified') },
        pending: { icon: Clock, color: "text-amber-500", bg: "bg-amber-50", text: t('pending') },
        rejected: { icon: ShieldAlert, color: "text-red-500", bg: "bg-red-50", text: t('notStarted') },
        "not-started": { icon: ShieldAlert, color: "text-gray-400", bg: "bg-gray-50", text: t('notStarted') }
    };

    const currentStatus = statusMap[kycStatus as keyof typeof statusMap] || statusMap.pending;

    const activities = [
        { id: 1, type: "login", label: t('lastLogin'), time: "2 mins ago" },
        { id: 2, type: "profile", label: t('profileUpdate'), time: "1 day ago" },
        { id: 3, type: "bank", label: t('bankLinked'), time: "Jan 10, 2026" }
    ];

    return (
        <Card className="border-gray-100 shadow-sm">
            <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-5">
                    <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                        <ShieldCheck className="h-5 w-5" />
                    </div>
                    <h4 className="font-bold text-sm text-gray-900">{t('title')}</h4>
                </div>

                <div className={cn("p-4 rounded-xl flex items-center justify-between mb-6", currentStatus.bg)}>
                    <div>
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block mb-1">{t('kycStatus')}</span>
                        <span className={cn("text-xs font-bold flex items-center gap-1.5", currentStatus.color)}>
                            <currentStatus.icon className="h-3.5 w-3.5" />
                            {currentStatus.text}
                        </span>
                    </div>
                    <button className="text-[10px] font-bold text-blue-600 underline">View Details</button>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{t('activity')}</span>
                        <History className="h-3 w-3 text-gray-400" />
                    </div>

                    <div className="space-y-3">
                        {activities.map((activity) => (
                            <div key={activity.id} className="flex items-center justify-between group">
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-blue-400 group-hover:scale-125 transition-transform" />
                                    <span className="text-xs text-gray-700 font-medium">{activity.label}</span>
                                </div>
                                <span className="text-[10px] text-gray-400">{activity.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
