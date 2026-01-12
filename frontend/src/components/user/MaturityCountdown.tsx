"use client";

import { Card, CardContent } from "../ui/Card";
import { Timer, ArrowRight, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { useStore } from "@/store/useStore";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";

export function MaturityCountdown() {
    const t = useTranslations("Maturity");
    const { user } = useStore();
    const [timeLeft, setTimeLeft] = useState({ days: 12, hours: 8, progress: 65 });

    // Mock progress calculation - in real app, this would use TPIA maturity dates
    useEffect(() => {
        const timer = setInterval(() => {
            // Simulated countdown
        }, 1000 * 60 * 60);
        return () => clearInterval(timer);
    }, []);

    return (
        <Card className="border-gray-100 shadow-sm overflow-hidden bg-gray-50/50">
            <CardContent className="p-0">
                <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                                <Timer className="h-5 w-5" />
                            </div>
                            <h4 className="font-bold text-sm text-gray-900">{t('title')}</h4>
                        </div>
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ring-1 ring-amber-100">
                            {t('active')}
                        </span>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xs text-gray-500 font-medium">{t('nextCycle')}</span>
                                <div className="flex gap-2">
                                    <div className="text-center">
                                        <span className="text-lg font-black text-gray-900 block leading-none">{timeLeft.days}</span>
                                        <span className="text-[8px] text-gray-400 uppercase font-black">{t('days')}</span>
                                    </div>
                                    <span className="text-lg font-black text-gray-200">:</span>
                                    <div className="text-center">
                                        <span className="text-lg font-black text-gray-900 block leading-none">{timeLeft.hours}</span>
                                        <span className="text-[8px] text-gray-400 uppercase font-black">{t('hours')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-amber-500 rounded-full transition-all duration-1000 ease-in-out"
                                    style={{ width: `${timeLeft.progress}%` }}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-2 border-t border-gray-100">
                            <span className="text-gray-500">{t('maturity')}:</span>
                            <span className="font-bold text-gray-900">May 14, 2027</span>
                        </div>
                    </div>
                </div>

                <Link
                    href="/portfolio"
                    className="flex items-center justify-between px-5 py-3 bg-white hover:bg-gray-50 border-t border-gray-100 transition-colors group"
                >
                    <span className="text-xs font-bold text-gray-900 flex items-center gap-2">
                        {t('viewPortfolio')}
                        <ExternalLink className="h-3 w-3 text-gray-400" />
                    </span>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </Link>
            </CardContent>
        </Card>
    );
}
