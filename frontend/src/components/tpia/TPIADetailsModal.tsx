import React, { useEffect, useState } from 'react';
import { X, TrendingUp, Calendar, Target, BarChart3 } from 'lucide-react';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface TPIADetailsModalProps {
    tpiaId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

interface TPIADetails {
    _id: string;
    tpiaNumber: number;
    gdcNumber: number;
    amount: number;
    currentValue: number;
    profitAmount: number;
    status: string;
    userMode: string;
    cycleStartMode: string;
    purchaseDate: string;
    approvalDate?: string;
    maturityDate?: string;
    currentCycle: number;
    totalCycles: number;
    daysUntilMaturity: number | null;
    commodityId?: {
        name: string;
        symbol: string;
        navPrice: number;
        description?: string;
    };
    gdc?: {
        gdcNumber: number;
        currentFill: number;
        capacity: number;
        status: string;
        cycleStartDate?: string;
    };
    transactionId?: {
        reference: string;
        amount: number;
    };
}

export const TPIADetailsModal: React.FC<TPIADetailsModalProps> = ({ tpiaId, isOpen, onClose }) => {
    const [tpia, setTpia] = useState<TPIADetails | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && tpiaId) {
            fetchTPIADetails();
        }
    }, [isOpen, tpiaId]);

    const fetchTPIADetails = async () => {
        if (!tpiaId) return;

        setLoading(true);
        try {
            const response = await api.get(`/tpia/${tpiaId}`);
            if (response.data.success) {
                setTpia(response.data.data.tpia);
            }
        } catch (error) {
            console.error('Failed to fetch TPIA details', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case 'ACTIVE': return 'success';
            case 'PENDING': return 'warning';
            case 'MATURED': return 'info';
            case 'COMPLETED': return 'default';
            default: return 'default';
        }
    };

    const roi = tpia ? ((tpia.profitAmount / tpia.amount) * 100).toFixed(2) : '0';
    const cycleProgress = tpia ? (tpia.currentCycle / tpia.totalCycles) * 100 : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {loading ? (
                    <div className="flex items-center justify-center p-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent"></div>
                    </div>
                ) : tpia ? (
                    <>
                        {/* Header */}
                        <div className="bg-white border-b border-gray-200 p-6 flex items-center justify-between flex-shrink-0">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900">
                                    TPIA-{tpia.tpiaNumber}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {tpia.commodityId?.name} ({tpia.commodityId?.symbol})
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant={getStatusColor(tpia.status)}>
                                    {tpia.status}
                                </Badge>
                                <button
                                    onClick={onClose}
                                    className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                                >
                                    <X className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="p-6 space-y-6 overflow-y-auto flex-1">
                            {/* Key Metrics */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-none">
                                    <CardContent className="p-4">
                                        <p className="text-xs text-blue-700 font-medium mb-1">Investment</p>
                                        <p className="text-xl font-bold text-blue-900">₦{tpia.amount.toLocaleString()}</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-none">
                                    <CardContent className="p-4">
                                        <p className="text-xs text-green-700 font-medium mb-1">Current Value</p>
                                        <p className="text-xl font-bold text-green-900">₦{tpia.currentValue.toLocaleString()}</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-none">
                                    <CardContent className="p-4">
                                        <p className="text-xs text-amber-700 font-medium mb-1">Profit</p>
                                        <p className="text-xl font-bold text-amber-900">₦{tpia.profitAmount.toLocaleString()}</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-none">
                                    <CardContent className="p-4">
                                        <p className="text-xs text-purple-700 font-medium mb-1">ROI</p>
                                        <p className="text-xl font-bold text-purple-900">{roi}%</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Cycle Progress */}
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-lg font-bold text-gray-900">Cycle Progress</h3>
                                        <span className="text-sm font-medium text-gray-600">
                                            Day {tpia.currentCycle} of {tpia.totalCycles}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                                        <div
                                            className="bg-gradient-to-r from-amber-500 to-amber-600 h-3 rounded-full transition-all duration-500"
                                            style={{ width: `${cycleProgress}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>Started: {new Date(tpia.purchaseDate).toLocaleDateString()}</span>
                                        {tpia.daysUntilMaturity !== null && (
                                            <span className="font-medium text-amber-600">
                                                {tpia.daysUntilMaturity} days remaining
                                            </span>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* GDC Cluster */}
                            {tpia.gdc && (
                                <Card>
                                    <CardContent className="p-6">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                                            GDC Cluster #{tpia.gdc.gdcNumber}
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <p className="text-sm text-gray-500">Status</p>
                                                <p className="text-base font-semibold text-gray-900">{tpia.gdc.status}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Capacity</p>
                                                <p className="text-base font-semibold text-gray-900">
                                                    {tpia.gdc.currentFill} / {tpia.gdc.capacity} TPIAs
                                                </p>
                                            </div>
                                        </div>
                                        {/* Visual Capacity */}
                                        <div className="flex gap-2 flex-wrap">
                                            {Array.from({ length: tpia.gdc.capacity }).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`h-10 w-10 rounded-lg flex items-center justify-center text-xs font-bold ${i < tpia.gdc!.currentFill
                                                        ? 'bg-amber-500 text-white'
                                                        : 'bg-gray-200 text-gray-400'
                                                        }`}
                                                >
                                                    {i + 1}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Commodity Info */}
                            {tpia.commodityId && (
                                <Card>
                                    <CardContent className="p-6">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4">Commodity Details</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500">Name</p>
                                                <p className="text-base font-semibold text-gray-900">{tpia.commodityId.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Symbol</p>
                                                <p className="text-base font-semibold text-gray-900">{tpia.commodityId.symbol}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Current NAV</p>
                                                <p className="text-base font-semibold text-gray-900">
                                                    ₦{tpia.commodityId.navPrice.toLocaleString()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Mode</p>
                                                <p className="text-base font-semibold text-gray-900">{tpia.userMode}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Transaction Info */}
                            {tpia.transactionId && (
                                <Card>
                                    <CardContent className="p-6">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4">Transaction</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-500">Reference</span>
                                                <span className="text-sm font-mono font-medium text-gray-900">
                                                    {tpia.transactionId.reference}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-500">Amount</span>
                                                <span className="text-sm font-semibold text-gray-900">
                                                    ₦{tpia.transactionId.amount.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="p-12 text-center text-gray-500">
                        No TPIA data available
                    </div>
                )}
            </div>
        </div>
    );
};