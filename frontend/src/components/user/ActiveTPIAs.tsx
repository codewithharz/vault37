import { Card, CardContent, CardHeader } from "../ui/Card";
import { Badge } from "../ui/Badge";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "../ui/Button";
import { useTranslations } from "next-intl";

// Mock interface for TPIA
interface TPIA {
    _id: string;
    tpiaId?: string;       // From some objects
    tpiaNumber?: string;   // From portfolioService
    commodity: { name: string; symbol?: string } | string;
    initialInvestment?: number;
    amount?: number;       // From portfolioService
    currentValue: number;
    cycleStartMode?: string;
    currentCycle?: number;
    status: string;
}

export function ActiveTPIAs({ tpias }: { tpias: TPIA[] }) {
    const t = useTranslations("Portfolio");
    const tCommon = useTranslations("Common");

    return (
        <Card className="h-auto">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <h3 className="text-lg font-medium text-gray-900">{t('activeTPIAs')}</h3>
                <Link href="/dashboard/portfolio">
                    <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                        {tCommon('viewAll')} <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                </Link>
            </CardHeader>
            <CardContent>
                {!tpias || !Array.isArray(tpias) || tpias.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        {t('noActiveTPIAs')}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tpias.map((tpia) => (
                            <div key={tpia._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-900">#{tpia.tpiaId || tpia.tpiaNumber}</span>
                                        <Badge variant={tpia.status === 'active' ? 'success' : 'default'}>
                                            {tpia.status.toUpperCase()}
                                        </Badge>
                                        {tpia.cycleStartMode && (
                                            <Badge variant="info">{tpia.cycleStartMode}</Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {typeof tpia.commodity === 'object' ? tpia.commodity.name : tpia.commodity}
                                        {tpia.currentCycle ? ` • ${t('cycleNumber').replace(' #', '')} ${tpia.currentCycle}/24` : ''}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-gray-900">₦{tpia.currentValue.toLocaleString()}</p>
                                    <p className="text-xs text-green-600">
                                        {tpia.status === 'active' ? tCommon('active') : tCommon('processing')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
