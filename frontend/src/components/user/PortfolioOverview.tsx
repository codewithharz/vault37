import { Card, CardContent } from "../ui/Card";
import { TrendingUp, DollarSign, Wallet, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { Tooltip } from "../ui/Tooltip";

interface PortfolioStats {
    totalInvested: number;
    currentValue: number;
    totalProfit: number;
    roi: number;
}

export function PortfolioOverview({ stats }: { stats: PortfolioStats }) {
    const t = useTranslations("Portfolio");
    const tTip = useTranslations("Tooltips");

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-none">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-1">
                                <p className="text-amber-100 text-sm font-medium">{t('totalValue')}</p>
                                <Tooltip content={tTip('totalValue')}>
                                    <Info className="h-3.5 w-3.5 text-amber-200 cursor-help" />
                                </Tooltip>
                            </div>
                            <h3 className="text-3xl font-bold mt-2">
                                ₦{stats.currentValue.toLocaleString()}
                            </h3>
                        </div>
                        <div className="bg-white/20 p-2 rounded-lg">
                            <DollarSign className="h-6 w-6 text-white" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-amber-100 text-sm">
                        <span className="bg-white/20 px-2 py-0.5 rounded text-white font-medium mr-2">
                            +{stats.roi}%
                        </span>
                        <span>{t('allTimeReturn')}</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-1">
                                <p className="text-gray-500 text-sm font-medium">{t('totalInvested')}</p>
                                <Tooltip content={tTip('totalInvested')}>
                                    <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                                </Tooltip>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mt-2">
                                ₦{stats.totalInvested.toLocaleString()}
                            </h3>
                        </div>
                        <div className="bg-blue-50 p-2 rounded-lg">
                            <Wallet className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-1">
                                <p className="text-gray-500 text-sm font-medium">{t('totalProfit')}</p>
                                <Tooltip content={tTip('totalProfit')}>
                                    <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                                </Tooltip>
                            </div>
                            <h3 className="text-2xl font-bold text-green-600 mt-2">
                                +₦{stats.totalProfit.toLocaleString()}
                            </h3>
                        </div>
                        <div className="bg-green-50 p-2 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
