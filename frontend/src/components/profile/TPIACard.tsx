import { TrendingUp, Calendar, Package, Shield, Eye } from "lucide-react";

interface TPIACardProps {
    tpia: any;
    viewMode: 'grid' | 'list';
    onViewDetails: () => void;
}

export function TPIACard({ tpia, viewMode, onViewDetails }: TPIACardProps) {
    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active':
            case 'cycling':
                return 'bg-emerald-100 text-emerald-700';
            case 'matured':
                return 'bg-blue-100 text-blue-700';
            case 'pending':
                return 'bg-amber-100 text-amber-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const profitPercentage = tpia.amount > 0
        ? ((tpia.profit / tpia.amount) * 100).toFixed(1)
        : '0.0';

    const cycleProgress = tpia.totalCycles > 0
        ? (tpia.currentCycle / tpia.totalCycles) * 100
        : 0;

    const daysRemaining = tpia.daysRemaining || 0;

    if (viewMode === 'list') {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    {/* Left: TPIA Info */}
                    <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center text-2xl shrink-0">
                            {tpia.symbol || '📦'}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-bold text-gray-900">{tpia.tpiaNumber}</p>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(tpia.status)}`}>
                                    {tpia.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600">{tpia.commodity}</p>
                        </div>
                    </div>

                    {/* Middle: Values */}
                    <div className="grid grid-cols-2 md:flex gap-4 md:gap-8 w-full md:w-auto">
                        <div>
                            <p className="text-xs text-gray-500">Current Value</p>
                            <p className="text-lg font-bold text-gray-900">₦{tpia.currentValue?.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Profit</p>
                            <p className="text-lg font-bold text-emerald-600">+₦{tpia.profit?.toLocaleString()}</p>
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <p className="text-xs text-gray-500">Cycle Progress</p>
                            <p className="text-lg font-bold text-gray-900">{tpia.currentCycle}/{tpia.totalCycles}</p>
                        </div>
                    </div>

                    {/* Right: Action */}
                    <button
                        onClick={onViewDetails}
                        className="w-full md:w-auto px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                    >
                        <Eye className="w-4 h-4" />
                        View Details
                    </button>
                </div>
            </div>
        );
    }

    // Grid View
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-amber-300 transition-all duration-300">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-xl">
                        {tpia.symbol || '📦'}
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 text-sm">{tpia.tpiaNumber}</p>
                        <p className="text-xs text-gray-600">{tpia.commodity}</p>
                    </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(tpia.status)}`}>
                    {tpia.status}
                </span>
            </div>

            {/* Values */}
            <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Base Amount</span>
                    <span className="font-semibold text-gray-900">₦{tpia.amount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Current Value</span>
                    <span className="font-bold text-gray-900">₦{tpia.currentValue?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Profit</span>
                    <span className="font-bold text-emerald-600">+₦{tpia.profit?.toLocaleString()} ({profitPercentage}%)</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-600">Cycle Progress</span>
                    <span className="text-xs font-semibold text-gray-900">
                        {tpia.currentCycle}/{tpia.totalCycles} ({cycleProgress.toFixed(0)}%)
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${cycleProgress}%` }}
                    ></div>
                </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                {daysRemaining > 0 && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Calendar className="w-3 h-3" />
                        <span>{daysRemaining} days until maturity</span>
                    </div>
                )}
                {tpia.insurancePolicyNumber && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Shield className="w-3 h-3 text-emerald-600" />
                        <span>Insured</span>
                    </div>
                )}
                {tpia.userMode && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        <TrendingUp className="w-3 h-3" />
                        <span>Mode: {tpia.userMode}</span>
                    </div>
                )}
            </div>

            {/* Action Button */}
            <button
                onClick={onViewDetails}
                className="w-full px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium text-sm flex items-center justify-center gap-2"
            >
                <Eye className="w-4 h-4" />
                View Details
            </button>
        </div>
    );
}
