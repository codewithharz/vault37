"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ShoppingBag, TrendingUp, Info } from "lucide-react";
import { PurchaseTPIAModal } from "../../../../components/user/PurchaseTPIAModal";

interface Commodity {
    _id: string;
    name: string;
    symbol: string;
    navPrice: number;
    description?: string;
}

export default function MarketplacePage() {
    const t = useTranslations("Marketplace");
    const [commodities, setCommodities] = useState<Commodity[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCommodity, setSelectedCommodity] = useState<Commodity | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchCommodities = async () => {
            try {
                const response = await api.get("/commodities");
                if (response.data.success) {
                    setCommodities(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch commodities", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCommodities();
    }, []);

    const handlePurchaseClick = (commodity: Commodity) => {
        setSelectedCommodity(commodity);
        setIsModalOpen(true);
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading Marketplace...</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">{t("title")}</h2>
                <p className="text-gray-500">{t("subtitle")}</p>
            </div>

            {commodities.length === 0 ? (
                <div className="bg-white rounded-lg border border-dashed border-gray-300 p-12 text-center">
                    <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No commodities</h3>
                    <p className="mt-1 text-sm text-gray-500">{t("noCommodities")}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {commodities.map((commodity) => (
                        <Card key={commodity._id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <CardHeader className="bg-gray-50/50 border-b border-gray-100 flex-row items-center justify-between space-y-0 py-4">
                                <div className="flex items-center space-x-3">
                                    <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                                        <TrendingUp className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{commodity.name}</h3>
                                        <span className="text-xs font-medium text-gray-500">{commodity.symbol}</span>
                                    </div>
                                </div>
                                <Badge variant="default" className="bg-green-50 text-green-700 border-green-200">
                                    Active
                                </Badge>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="flex flex-col space-y-4">
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                                                {t("currentPrice")}
                                            </p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                ₦{commodity.navPrice.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500 italic">
                                                {t("nav")} {t("perUnit")}
                                            </p>
                                        </div>
                                    </div>

                                    {commodity.description && (
                                        <p className="text-sm text-gray-600 line-clamp-2">
                                            {commodity.description}
                                        </p>
                                    )}

                                    <Button
                                        onClick={() => handlePurchaseClick(commodity)}
                                        className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                                    >
                                        {t("investNow")}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {selectedCommodity && (
                <PurchaseTPIAModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    commodity={selectedCommodity}
                />
            )}
        </div>
    );
}
