
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { AlertCircle, CheckCircle2, Wallet, RefreshCw } from "lucide-react";
import api from "@/lib/api";

interface Commodity {
    _id: string;
    name: string;
    symbol: string;
    navPrice: number;
    availableSlots?: number;
}

interface TPIAPurchaseFormProps {
    onPurchaseSuccess: () => void;
}

export function TPIAPurchaseForm({ onPurchaseSuccess }: TPIAPurchaseFormProps) {
    const [commodities, setCommodities] = useState<Commodity[]>([]);
    const [selectedCommodityId, setSelectedCommodityId] = useState<string>("");
    const [quantity, setQuantity] = useState(1);
    const [cycleMode, setCycleMode] = useState<"CLUSTER" | "IMMEDIATE">("CLUSTER");
    const [walletBalance, setWalletBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const initData = async () => {
            try {
                const [commRes, walletRes] = await Promise.all([
                    api.get("/commodities"),
                    api.get("/wallet")
                ]);

                if (commRes.data.success) {
                    setCommodities(commRes.data.data);
                    if (commRes.data.data.length > 0) {
                        setSelectedCommodityId(commRes.data.data[0]._id);
                        // Reset quantity if it exceeds new limit (though mostly 1 on init)
                        const firstComm = commRes.data.data[0];
                        if (firstComm.availableSlots && quantity > firstComm.availableSlots) {
                            setQuantity(1);
                        }
                    }
                }
                if (walletRes.data.success) {
                    // Backend returns { success: true, data: { wallet: { ... } } }
                    // We want availableBalance for purchasing power
                    const wallet = walletRes.data.data.wallet;
                    setWalletBalance(wallet?.availableBalance ?? 0);
                }
            } catch (err) {
                console.error("Failed to load TPIA form data", err);
            } finally {
                setInitializing(false);
            }
        };

        initData();
    }, []);

    const handlePurchase = async () => {
        if (!selectedCommodityId) return;

        setLoading(true);
        setError("");
        try {
            const payload = {
                commodityId: selectedCommodityId,
                cycleStartMode: cycleMode,
                quantity: quantity
            };
            const response = await api.post("/tpia/purchase", payload);

            if (response.data.success) {
                setSuccess(true);
                // Refresh balance
                const walletRes = await api.get("/wallet");
                if (walletRes.data.success) setWalletBalance(walletRes.data.data.balance);

                // Notify parent to refresh list
                onPurchaseSuccess();

                // Reset after delay
                setTimeout(() => {
                    setSuccess(false);
                    setQuantity(1);
                }, 3000);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Purchase failed. Please check your balance.");
        } finally {
            setLoading(false);
        }
    };

    const selectedCommodity = commodities.find(c => c._id === selectedCommodityId);
    const maxQuantity = selectedCommodity?.availableSlots || 10;

    // Ensure quantity respects limit if commodity changes
    useEffect(() => {
        if (quantity > maxQuantity) setQuantity(maxQuantity > 0 ? 1 : 0);
    }, [selectedCommodityId, maxQuantity, quantity]);

    if (initializing) return <div className="h-64 flex items-center justify-center text-gray-400">Loading Form...</div>;

    const totalCost = quantity * 1000000;
    const canAfford = walletBalance !== null && walletBalance >= totalCost;

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-xl font-black text-gray-900 mb-6">Purchase TPIA Block</h3>

            <div className="space-y-6">
                {/* Commodity Selection */}
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Select Protected Asset</label>
                    <select
                        value={selectedCommodityId}
                        onChange={(e) => setSelectedCommodityId(e.target.value)}
                        className="w-full p-3 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-900 focus:ring-2 focus:ring-amber-500 outline-none transition-all shadow-sm"
                    >
                        {commodities.map(c => (
                            <option key={c._id} value={c._id}>
                                {c.name} ({c.symbol})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Quantity */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Quantity</label>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                className="h-10 w-10 font-bold border-gray-300 hover:bg-gray-50"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            >-</Button>
                            <div className="flex-1 text-center font-black text-lg bg-gray-50 text-gray-900 h-10 flex items-center justify-center rounded-md border border-gray-300 shadow-inner">
                                {quantity}
                            </div>
                            <Button
                                variant="outline"
                                className="h-10 w-10 font-bold border-gray-300 hover:bg-gray-50"
                                onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                                disabled={quantity >= maxQuantity}
                            >+</Button>
                        </div>
                        <div className="text-[10px] text-right mt-1 font-medium text-amber-600">
                            {maxQuantity} slots available in current cluster
                        </div>
                    </div>

                    {/* Cycle Mode */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Cycle Mode</label>
                        <select
                            value={cycleMode}
                            onChange={(e) => setCycleMode(e.target.value as any)}
                            className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-900 focus:ring-2 focus:ring-amber-500 outline-none shadow-sm"
                        >
                            <option value="CLUSTER">Cluster (Standard)</option>
                            <option value="IMMEDIATE">Immediate Start</option>
                        </select>
                    </div>
                </div>

                {/* Quick Quality Selection */}
                <div className="grid grid-cols-3 gap-2">
                    <button
                        onClick={() => setQuantity(1)}
                        className={`text-xs font-bold py-2 px-1 rounded-lg border transition-all ${quantity === 1
                            ? 'bg-amber-100 border-amber-300 text-amber-800 ring-1 ring-amber-300'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        Single (1)
                    </button>

                    <button
                        onClick={() => setQuantity(maxQuantity)}
                        className={`text-xs font-bold py-2 px-1 rounded-lg border transition-all ${quantity === maxQuantity && maxQuantity < 10
                            ? 'bg-amber-100 border-amber-300 text-amber-800 ring-1 ring-amber-300'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                        title="Buy all remaining slots in this cluster"
                    >
                        Fill Cluster ({maxQuantity})
                    </button>

                    <button
                        onClick={() => setQuantity(10)}
                        disabled={maxQuantity < 10}
                        className={`text-xs font-bold py-2 px-1 rounded-lg border transition-all ${quantity === 10
                            ? 'bg-amber-100 border-amber-300 text-amber-800 ring-1 ring-amber-300'
                            : maxQuantity < 10
                                ? 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                        title={maxQuantity < 10 ? "Cluster has limited slots" : "Buy a full node of 10 TPIAs"}
                    >
                        Full Node (10)
                    </button>
                </div>

                {/* Order Summary */}
                <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-4 shadow-inner">
                    <h4 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Wallet className="h-4 w-4" /> Order Summary
                    </h4>

                    <div className="space-y-3">
                        <div className="flex justify-between text-sm items-center">
                            <span className="text-slate-400 font-medium">Selected Units</span>
                            <span className="font-bold text-white text-base">{quantity} Block(s)</span>
                        </div>

                        <div className="flex justify-between text-sm items-center">
                            <span className="text-slate-400 font-medium">Unit Price</span>
                            <span className="font-bold text-white">₦1,000,000</span>
                        </div>

                        <div className="flex justify-between text-sm items-center pt-3 border-t border-slate-700/50">
                            <span className="text-slate-400 font-medium">Wallet Balance</span>
                            <span className={`font-bold ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                                {typeof walletBalance === 'number' ? `₦${walletBalance.toLocaleString()}` : '...'}
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-dashed border-slate-700 mt-2">
                        <span className="font-bold text-slate-300">Grand Total</span>
                        <span className="text-2xl font-black text-amber-500">₦{totalCost.toLocaleString()}</span>
                    </div>
                </div>

                {/* Action */}
                <div className="pt-2">
                    {success ? (
                        <div className="bg-green-100 text-green-800 p-4 rounded-xl flex items-center justify-center gap-2 font-bold animate-pulse">
                            <CheckCircle2 className="h-5 w-5" />
                            <span>Purchase Successful!</span>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-xs font-bold flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}
                            <Button
                                onClick={handlePurchase}
                                disabled={loading || !canAfford}
                                className={`w-full h-12 text-lg font-bold shadow-lg transition-all ${canAfford
                                    ? 'bg-gray-900 hover:bg-gray-800 text-white shadow-gray-200'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2"><RefreshCw className="h-4 w-4 animate-spin" /> Processing...</span>
                                ) : (
                                    canAfford ? "Confirm Investment" : "Insufficient Funds"
                                )}
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div >
    );
}
