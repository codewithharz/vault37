"use client";

import { Card, CardContent, CardHeader } from "../ui/Card";
import { useStore } from "@/store/useStore";
import { Wallet, ArrowUpCircle, ArrowDownCircle, Info } from "lucide-react";
import { Button } from "../ui/Button";
import { useState } from "react";
import { WalletModals } from "./WalletModals";
import { useTranslations } from "next-intl";
import { Tooltip } from "../ui/Tooltip";

export function WalletCard() {
    const t = useTranslations("Wallet");
    const tTip = useTranslations("Tooltips");
    const { wallet } = useStore();
    const [isModalsOpen, setIsModalsOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'deposit' | 'withdrawal'>('deposit');

    const handleOpenModal = (mode: 'deposit' | 'withdrawal') => {
        setModalMode(mode);
        setIsModalsOpen(true);
    };

    return (
        <Card className="h-auto flex flex-col">
            <CardHeader className="flex-row items-center justify-between space-y-0 py-4">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                        <Wallet className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-gray-900">{t('walletBalance')}</span>
                </div>
                <Info className="h-4 w-4 text-gray-400 cursor-help" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between py-4">
                <div className="space-y-4">
                    <div>
                        <div className="flex items-center gap-1">
                            <p className="text-sm font-medium text-gray-500">{t('availableBalance')}</p>
                            <Tooltip content={tTip('availableBalance')}>
                                <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                            </Tooltip>
                        </div>
                        <p className="text-3xl font-black text-gray-900">
                            ₦{(wallet?.availableBalance ?? 0).toLocaleString()}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="flex items-center gap-1">
                                <span className="text-xs font-medium text-gray-500 block">{t('earnings')}</span>
                                <Tooltip content={tTip('earnings')}>
                                    <Info className="h-3 w-3 text-gray-400 cursor-help" />
                                </Tooltip>
                            </div>
                            <span className="text-sm font-bold text-green-600">₦{(wallet?.earningsBalance ?? 0).toLocaleString()}</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-1">
                                <span className="text-xs font-medium text-gray-500 block">{t('lockedBalance') || "Locked Balance"}</span>
                                <Tooltip content={tTip('lockedBalance')}>
                                    <Info className="h-3 w-3 text-gray-400 cursor-help" />
                                </Tooltip>
                            </div>
                            <span className="text-sm font-bold text-amber-600">
                                ₦{((wallet?.lockedBalance ?? 0) + (wallet?.pendingWithdrawalBalance ?? 0)).toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                        <span className="text-xs text-gray-400 flex justify-between">
                            <div className="flex items-center gap-1">
                                <span>{t('totalBalance') || "Total Balance"}:</span>
                                <Tooltip content={tTip('totalBalance')}>
                                    <Info className="h-3 w-3 text-gray-400 cursor-help" />
                                </Tooltip>
                            </div>
                            <span>₦{(wallet?.totalBalance ?? 0).toLocaleString()}</span>
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-6">
                    <Button
                        variant="primary"
                        size="sm"
                        className="w-full gap-2 h-11"
                        onClick={() => handleOpenModal('deposit')}
                    >
                        <ArrowDownCircle className="h-4 w-4" />
                        {t('deposit')}
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        className="w-full gap-2 h-11"
                        onClick={() => handleOpenModal('withdrawal')}
                    >
                        <ArrowUpCircle className="h-4 w-4" />
                        {t('withdraw')}
                    </Button>
                </div>
            </CardContent>

            <WalletModals
                isOpen={isModalsOpen}
                onClose={() => setIsModalsOpen(false)}
                initialMode={modalMode}
            />
        </Card>
    );
}
