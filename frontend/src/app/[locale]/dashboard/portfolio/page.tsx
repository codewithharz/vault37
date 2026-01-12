"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import { Card, CardHeader, CardContent } from "../../../../components/ui/Card";
import { Button } from "../../../../components/ui/Button";
import { Badge } from "../../../../components/ui/Badge";
import {
    PieChart,
    ChevronRight,
    TrendingUp,
    Shield,
    ArrowUpRight,
    Search
} from "lucide-react";
import { TPIADetailsModal } from "../../../../components/user/TPIADetailsModal";

interface TPIA {
    _id: string;
    tpiaId?: string;
    tpiaNumber?: string;
    commodity: { name: string; symbol?: string } | string;
    initialInvestment?: number;
    currentValue: number;
    currentCycle?: number;
    status: string;
    cycleStartMode?: string;
    profitHistory?: any[];
}

export default function PortfolioPage() {
    const t = useTranslations("Portfolio");
    const [tpias, setTpias] = useState<TPIA[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTpia, setSelectedTpia] = useState<TPIA | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                const response = await api.get('/tpia/my-tpias');
                if (response.data.success) {
                    setTpias(response.data.data.tpias || []);
                }
            } catch (error) {
                console.error("Failed to fetch portfolio", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPortfolio();
    }, []);

    const handleViewDetails = (tpia: TPIA) => {
        setSelectedTpia(tpia);
        setIsDetailsOpen(true);
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading Portfolio...</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">{t("title")}</h2>
                    <p className="text-gray-500">{t("subtitle")}</p>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search investments..."
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    />
                </div>
            </div>

            {tpias.length === 0 ? (
                <Card className="border-dashed border-2 py-12">
                    <CardContent className="text-center">
                        <PieChart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900">{t("noTPIAs")}</h3>
                        <p className="text-gray-500 mt-1">Visit the marketplace to start building your wealth.</p>
                        <Button className="mt-6 bg-amber-600 hover:bg-amber-700 text-white">Go to Marketplace</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {tpias.map((tpia) => (
                        <Card key={tpia._id} className="hover:shadow-md transition-all overflow-hidden border-l-4 border-l-amber-500">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center gap-6">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">
                                                #{tpia.tpiaId || tpia.tpiaNumber}
                                            </span>
                                            <Badge variant={tpia.status === 'active' ? 'success' : 'default'}>
                                                {tpia.status.toUpperCase()}
                                            </Badge>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {typeof tpia.commodity === 'object' ? tpia.commodity.name : tpia.commodity}
                                        </h3>
                                        <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                                            <div className="flex items-center gap-1">
                                                <TrendingUp className="h-4 w-4 text-green-500" />
                                                Cycle {tpia.currentCycle || 1}/24
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Shield className="h-4 w-4 text-blue-500" />
                                                Protected
                                            </div>
                                        </div>
                                    </div>

                                    <div className="md:text-right space-y-1">
                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{t("value")}</p>
                                        <p className="text-3xl font-black text-gray-900">
                                            ₦{tpia.currentValue.toLocaleString()}
                                        </p>
                                        <p className="text-xs font-bold text-green-600 flex items-center md:justify-end gap-1">
                                            <ArrowUpRight className="h-4 w-4" />
                                            +₦{(tpia.currentValue - (tpia.initialInvestment || 100000)).toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 flex items-center justify-end">
                                        <Button
                                            onClick={() => handleViewDetails(tpia)}
                                            variant="outline"
                                            className="group"
                                        >
                                            {t("details")}
                                            <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {selectedTpia && (
                <TPIADetailsModal
                    isOpen={isDetailsOpen}
                    onClose={() => setIsDetailsOpen(false)}
                    tpia={selectedTpia}
                />
            )}
        </div>
    );
}
