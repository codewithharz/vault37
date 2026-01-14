
"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import { useStore } from "@/store/useStore";
import { TPIAPurchaseForm } from "../../../../components/tpia/TPIAPurchaseForm";
import { AssetProtections } from "../../../../components/tpia/AssetProtections";
import { CommodityCard } from "../../../../components/market/CommodityCard";
import { MarketStats } from "../../../../components/market/MarketStats";
import { TPIADetailsModal } from "../../../../components/tpia/TPIADetailsModal";
import { Button } from "@/components/ui/Button";
import { ShoppingBag } from "lucide-react";

interface Commodity {
    _id: string;
    name: string;
    symbol: string;
    type?: string;
    navPrice: number;
    description?: string;
    recentHistory?: { date: string | Date; price: number }[];
    change24h?: number;
    availableSlots?: number;
    roiPercent?: number;
    cycleDays?: number;
    currentGdc?: number;
}

interface TPIA {
    _id: string;
    tpiaNumber: number;
    gdcNumber: number;
    amount: number;
    currentValue: number;
    profitAmount: number;
    status: string;
    commodityId?: {
        _id: string;
        name: string;
        symbol: string;
        navPrice: number;
        navHistory?: { date: string | Date; price: number }[];
    };
}

export default function MarketplacePage() {
    const t = useTranslations("Marketplace");
    const { wallet, fetchWallet } = useStore();
    const [commodities, setCommodities] = useState<Commodity[]>([]); // For stats
    const [userTPIAs, setUserTPIAs] = useState<TPIA[]>([]);
    const [activeFilter, setActiveFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [selectedTPIAId, setSelectedTPIAId] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            const [marketRes, tpiasRes] = await Promise.all([
                api.get("/commodities"),
                api.get("/tpia/my-tpias")
            ]);

            if (marketRes.data.success) {
                setCommodities(marketRes.data.data);
            }
            if (tpiasRes.data.success) {
                // Use real TPIA data from backend
                setUserTPIAs(tpiasRes.data.data.tpias || []);
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWallet();
        fetchData();
    }, [fetchWallet]);

    const handlePurchaseSuccess = () => {
        fetchWallet(); // Refresh wallet balance
        fetchData(); // Refresh TPIA list
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent"></div>
                    <p className="text-gray-500 font-medium">Loading TPIA Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">TPIA Strategy</h2>
                <p className="text-gray-500 mt-1 text-lg">
                    Manage your commodity-backed assets and automated trade cycles.
                </p>
            </div>

            <MarketStats commodities={commodities} wallet={wallet} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <TPIAPurchaseForm onPurchaseSuccess={handlePurchaseSuccess} />
                </div>
                <div className="lg:col-span-1">
                    <AssetProtections />
                </div>
            </div>

            <div className="pt-8 border-t border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h3 className="text-xl font-black text-gray-900">Explore Opportunities</h3>
                        <p className="text-sm text-gray-500">Find the best clusters to join based on fill-speed and performance.</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {["all", "closing", "grain", "bean"].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${activeFilter === filter
                                    ? "bg-amber-100 border-amber-300 text-amber-800 shadow-sm"
                                    : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                                    }`}
                            >
                                {filter === "all" ? "All Assets" :
                                    filter === "closing" ? "🔥 Closing Soon" :
                                        filter.charAt(0).toUpperCase() + filter.slice(1) + "s"}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-12">
                    {commodities
                        .filter(c => {
                            if (activeFilter === "all") return true;
                            if (activeFilter === "closing") return (c.availableSlots || 0) <= 3;
                            return c.type?.toLowerCase() === activeFilter;
                        })
                        .map((commodity) => (
                            <CommodityCard
                                key={commodity._id}
                                commodity={{
                                    ...commodity,
                                    gdcNumber: commodity.currentGdc
                                } as any}
                                isPurchased={false}
                                onInvest={(c) => {
                                    const selectElement = document.querySelector('select') as HTMLSelectElement;
                                    if (selectElement) {
                                        selectElement.value = c._id;
                                        const event = new Event('change', { bubbles: true });
                                        selectElement.dispatchEvent(event);
                                        selectElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    }
                                }}
                            />
                        ))}
                </div>

                <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    Your Active TPIAs ({userTPIAs.length})
                </h3>

                {userTPIAs.length === 0 ? (
                    <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center shadow-sm">
                        <div className="mx-auto h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <ShoppingBag className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">No Active TPIAs</h3>
                        <p className="mt-2 text-gray-500 max-w-sm mx-auto">Purchase a TPIA block above to start earning compounding returns.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {userTPIAs.map((tpia) => {
                            // Map TPIA to Commodity format for CommodityCard
                            const commodityData = {
                                _id: tpia._id,
                                name: tpia.commodityId?.name || 'Unknown Commodity',
                                symbol: tpia.commodityId?.symbol || 'N/A',
                                navPrice: tpia.commodityId?.navPrice || tpia.amount,
                                currentValue: tpia.currentValue,
                                change24h: 0,
                                recentHistory: tpia.commodityId?.navHistory || [],
                                roiPercent: 5, // Fallback if not populated
                                cycleDays: 37,  // Fallback if not populated
                                tpiaNumber: tpia.tpiaNumber,
                                gdcNumber: tpia.gdcNumber
                            };

                            return (
                                <CommodityCard
                                    key={tpia._id}
                                    commodity={commodityData as any}
                                    isPurchased={true}
                                    onTPIAClick={setSelectedTPIAId}
                                />
                            );
                        })}
                    </div>
                )}
            </div>

            {/* TPIA Details Modal */}
            <TPIADetailsModal
                tpiaId={selectedTPIAId}
                isOpen={!!selectedTPIAId}
                onClose={() => setSelectedTPIAId(null)}
            />
        </div>
    );
}
