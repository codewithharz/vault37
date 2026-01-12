"use client";

import { Card, CardContent } from "../ui/Card";
import { Copy, Gift, Settings, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useStore } from "@/store/useStore";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/Button";

export function ReferralCard() {
    const t = useTranslations("Referral");
    const { user } = useStore();
    const [copied, setCopied] = useState(false);

    const referralCode = user?.email?.split('@')[0].toUpperCase() || "GDIP-USER"; // Fallback logic

    const handleCopy = () => {
        navigator.clipboard.writeText(referralCode);
        setCopied(true);
        toast.success(t('copied'));
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card className="overflow-hidden border-none bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-white/20 p-2 rounded-lg">
                        <Gift className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm tracking-tight">{t('title')}</h4>
                        <p className="text-[10px] text-indigo-100 uppercase font-bold tracking-wider">{t('code')}</p>
                    </div>
                </div>

                <div
                    className="bg-white/10 rounded-xl p-3 flex items-center justify-between border border-white/10"
                    style={{
                        WebkitBackdropFilter: 'blur(12px)',
                        backdropFilter: 'blur(12px)',
                        backgroundColor: 'rgba(255, 255, 255, 0.15)'
                    }}
                >
                    <span className="font-mono font-bold text-lg tracking-widest">{referralCode}</span>
                    <button
                        onClick={handleCopy}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                </div>

                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                    <div>
                        <span className="text-[10px] text-indigo-100 uppercase font-bold tracking-wider block">{t('earningsMode')}</span>
                        <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                        >
                            {user?.mode || "TPM"}
                        </span>
                    </div>
                    <Button
                        variant="secondary"
                        size="sm"
                        className="bg-white text-indigo-600 hover:bg-indigo-50 border-none h-8 text-[11px] font-bold px-3"
                    >
                        <Settings className="h-3 w-3 mr-1.5" />
                        {t('switchMode')}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
