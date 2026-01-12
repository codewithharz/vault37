"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { AlertCircle, ShieldCheck, Zap, TrendingUp } from "lucide-react";
import api from "@/lib/api";

interface Commodity {
    _id: string;
    name: string;
    symbol: string;
    navPrice: number;
}

interface PurchaseTPIAModalProps {
    isOpen: boolean;
    onClose: () => void;
    commodity: Commodity;
}

export function PurchaseTPIAModal({ isOpen, onClose, commodity }: PurchaseTPIAModalProps) {
    const t = useTranslations("Marketplace");
    const [cycleStartMode, setCycleStartMode] = useState<"CLUSTER" | "IMMEDIATE">("CLUSTER");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handlePurchase = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await api.post("/tpia/purchase", {
                commodityId: commodity._id,
                cycleStartMode: cycleStartMode
            });

            if (response.data.success) {
                setSuccess(true);
                setTimeout(() => {
                    onClose();
                    window.location.reload();
                }, 2000);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Purchase failed. Please check your balance.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Confirm Investment"
            className="max-w-md"
        >
            <div className="space-y-6">
                {error && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-start gap-3 text-sm border border-red-100">
                        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <p>{error}</p>
                    </div>
                )}

                {success ? (
                    <div className="py-8 text-center space-y-4">
                        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <ShieldCheck className="h-8 w-8 text-green-600" />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900">Purchase Successful!</h4>
                        <p className="text-sm text-gray-500">Your TPIA is being processed and will appear in your dashboard shortly.</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-amber-50/50 rounded-lg p-4 border border-amber-100">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-600">Commodity</span>
                                <span className="font-bold text-gray-900">{commodity.name} ({commodity.symbol})</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-600">Unit Price</span>
                                <span className="font-bold text-gray-900">₦{commodity.navPrice.toLocaleString()}</span>
                            </div>
                            <div className="pt-2 mt-2 border-t border-amber-100 flex justify-between items-center">
                                <span className="text-sm font-semibold text-gray-900">Total Investment</span>
                                <span className="text-lg font-bold text-amber-700">₦1,000,000</span>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-2">* TPIA investment amount is fixed at ₦1,000,000 per agreement.</p>
                        </div>

                        <div className="space-y-3">
                            <div
                                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${cycleStartMode === 'CLUSTER' ? 'border-amber-600 bg-amber-50/30' : 'border-gray-200'}`}
                                onClick={() => setCycleStartMode('CLUSTER')}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                        <Zap className="h-4 w-4 text-gray-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900">{t("cluster")}</h4>
                                        <p className="text-xs text-gray-500">Standard trade cycle (awaits cluster fill).</p>
                                    </div>
                                </div>
                            </div>

                            <div
                                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${cycleStartMode === 'IMMEDIATE' ? 'border-amber-600 bg-amber-50/30' : 'border-gray-200'}`}
                                onClick={() => setCycleStartMode('IMMEDIATE')}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                                        <TrendingUp className="h-4 w-4 text-amber-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900">{t("immediate")}</h4>
                                        <p className="text-xs text-gray-500">Starts immediately upon approval.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handlePurchase}
                            className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-lg shadow-amber-600/20"
                            disabled={loading}
                        >
                            {loading ? "Processing..." : "Confirm & Invest"}
                        </Button>
                    </>
                )}
            </div>
        </Modal>
    );
}
