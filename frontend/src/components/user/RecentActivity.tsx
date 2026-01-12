import { Card, CardContent, CardHeader } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "../ui/Button";
import { ChevronRight } from "lucide-react";

interface Transaction {
    _id: string;
    type: string;
    amount: number;
    status: string;
    createdAt: string;
    reference: string;
}

export function RecentActivity({ transactions }: { transactions: Transaction[] }) {
    const t = useTranslations("Wallet");
    const tCommon = useTranslations("Common");

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'completed': return 'success';
            case 'pending': return 'warning';
            case 'failed': return 'error';
            default: return 'default';
        }
    };

    const getTypeLabel = (type: string) => {
        // You might want to map these to translation keys if they are essentially enums
        return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
    };

    return (
        <Card className="h-auto">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <h3 className="text-lg font-medium text-gray-900">{t('transactions')}</h3>
                <Link href="/dashboard/history">
                    <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                        {tCommon('viewAll')} <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                </Link>
            </CardHeader>
            <CardContent>
                {!transactions || transactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        {t('noTransactions')}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {transactions.map((tx) => (
                            <div key={tx._id} className="flex items-center justify-between py-3 border-b last:border-0 border-gray-100">
                                <div>
                                    <p className="font-medium text-gray-900">{getTypeLabel(tx.type)}</p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(tx.createdAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className={`font-medium ${tx.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'}`}>
                                        {tx.type === 'withdrawal' ? '-' : '+'}₦{tx.amount.toLocaleString()}
                                    </p>
                                    <Badge variant={getStatusVariant(tx.status) as any} className="mt-1 text-[10px] h-5 px-1.5">
                                        {tx.status.toUpperCase()}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
