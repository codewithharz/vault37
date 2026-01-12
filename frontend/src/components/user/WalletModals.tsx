"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AlertCircle, ArrowUpRight, ArrowDownLeft, Wallet, ShieldCheck, CreditCard, ChevronRight } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { useStore } from "@/store/useStore";
import { useTranslations } from "next-intl";

interface DepositModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function DepositModal({ isOpen, onClose }: DepositModalProps) {
    const t = useTranslations("Wallet");
    const tCommon = useTranslations("Common");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleDeposit = async () => {
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            setError(t('invalidAmount'));
            return;
        }

        setLoading(true);
        setError("");
        try {
            const response = await api.post("/wallet/deposit", {
                amount: Number(amount)
                // user email is handled by the backend from the auth token
            });

            if (response.data.success && (response.data.data.authorizationUrl || response.data.data.authorization_url)) {
                // Redirect to Paystack
                window.location.href = response.data.data.authorizationUrl || response.data.data.authorization_url;
            } else {
                setError(t('depositError'));
            }
        } catch (err: any) {
            setError(err.response?.data?.message || t('depositError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('depositFunds')} className="max-w-md">
            <div className="space-y-6">
                <div className="bg-green-50 rounded-lg p-4 border border-green-100 flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-green-600 mt-0.5" />
                    <p className="text-xs text-green-700">
                        {t('depositHelp')}
                    </p>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-start gap-3 text-sm">
                        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <p>{error}</p>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">{t('amount')} (₦)</label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₦</div>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-3 bg-white border-2 border-gray-100 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none font-bold text-xl text-gray-900 placeholder:text-gray-300"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    {[50000, 100000, 500000].map((val) => (
                        <button
                            key={val}
                            onClick={() => setAmount(val.toString())}
                            className="py-2.5 text-xs font-bold bg-gray-50 border border-gray-100 text-gray-700 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 rounded-lg transition-all"
                        >
                            +₦{val.toLocaleString()}
                        </button>
                    ))}
                </div>

                <Button
                    onClick={handleDeposit}
                    disabled={loading}
                    className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-lg shadow-amber-600/20 active:scale-[0.98] transition-all"
                >
                    {loading ? tCommon('processing') : t('proceedToPayment')}
                </Button>
            </div>
        </Modal>
    );
}

interface WithdrawModalProps {
    isOpen: boolean;
    onClose: () => void;
    balance: number;
}

export function WithdrawModal({ isOpen, onClose, balance }: WithdrawModalProps) {
    const { wallet } = useStore();
    const t = useTranslations("Wallet");
    const tCommon = useTranslations("Common");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleWithdraw = async () => {
        const numAmount = Number(amount);
        if (!amount || isNaN(numAmount) || numAmount <= 0) {
            setError(t('invalidAmount'));
            return;
        }

        if (numAmount > balance) {
            setError(t('insufficientBalance'));
            return;
        }

        if (numAmount < 5000) {
            setError(t('minWithdrawalError', { amount: '5,000' }));
            return;
        }

        setLoading(true);
        setError("");
        try {
            const response = await api.post("/wallet/withdraw", {
                amount: numAmount
            });

            if (response.data.success) {
                setSuccess(true);
                setTimeout(() => {
                    onClose();
                    window.location.reload();
                }, 2000);
            }
        } catch (err: any) {
            const message = err.response?.data?.message || err.response?.data?.error || t('withdrawError');
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('withdrawFunds')} className="max-w-md">
            <div className="space-y-6">
                {success ? (
                    <div className="py-8 text-center space-y-4">
                        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <ArrowDownLeft className="h-8 w-8 text-green-600" />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900">{t('withdrawRequested')}</h4>
                        <p className="text-sm text-gray-500">{t('withdrawSuccessDesc')}</p>
                    </div>
                ) : !wallet?.bankAccounts || wallet.bankAccounts.length === 0 ? (
                    <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100/50 space-y-4 text-center">
                        <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                            <CreditCard className="h-8 w-8 text-amber-600" />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-lg font-bold text-gray-900">{t('noBankAccount')}</h4>
                            <p className="text-sm text-gray-500 leading-relaxed px-4">
                                {t('noBankAccountDesc')}
                            </p>
                        </div>
                        <Link
                            href="/dashboard/settings"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-amber-600 font-bold rounded-xl border-2 border-amber-100 hover:bg-amber-50 hover:border-amber-200 transition-all active:scale-95 group"
                            onClick={onClose}
                        >
                            {t('goToSettings')}
                            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 space-y-3">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Wallet className="h-4 w-4 text-amber-600" />
                                    <span className="text-xs text-amber-800 font-bold uppercase tracking-wider">{t('availableBalance')}</span>
                                </div>
                                <span className="font-black text-amber-900 text-base">₦{balance.toLocaleString()}</span>
                            </div>

                            {/* Removed redundant pending deduction as it is already included in availableBalance virtual */}
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-start gap-3 text-sm border border-red-100">
                                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <p className="font-medium">{error}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">{t('amountToWithdraw')} (₦)</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₦</div>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full pl-8 pr-4 py-3 bg-white border-2 border-gray-100 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none font-bold text-xl text-gray-900 placeholder:text-gray-300"
                                />
                            </div>
                        </div>

                        <Button
                            onClick={handleWithdraw}
                            disabled={loading}
                            className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-lg shadow-amber-600/20 active:scale-[0.98] transition-all"
                        >
                            {loading ? tCommon('processing') : t('confirmWithdrawal')}
                        </Button>
                    </>
                )}
            </div>
        </Modal>
    );
}
export function WalletModals({ isOpen, onClose, initialMode = 'deposit' }: { isOpen: boolean, onClose: () => void, initialMode?: 'deposit' | 'withdrawal' }) {
    const { wallet } = useStore();
    return (
        <>
            {initialMode === 'deposit' ? (
                <DepositModal isOpen={isOpen} onClose={onClose} />
            ) : (
                <WithdrawModal
                    isOpen={isOpen}
                    onClose={onClose}
                    balance={wallet?.availableBalance || 0}
                />
            )}
        </>
    );
}
