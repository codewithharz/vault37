"use client";

import { Modal } from "../ui/Modal";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import {
    Calendar,
    TrendingUp,
    ShieldCheck,
    Clock,
    History,
    Activity,
    MapPin,
    FileText,
    Download,
    ArrowUpRight,
    ExternalLink
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

interface CycleRecord {
    cycleId?: string;
    amount: number;
    date: string;
    userMode: string;
    cycleNumber?: number;
}

interface TPIADetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    tpia: any;
}

export function TPIADetailsModal({ isOpen, onClose, tpia }: TPIADetailsModalProps) {
    const router = useRouter();
    const t = useTranslations("Portfolio");
    if (!tpia) return null;

    const commodity = tpia.commodityId || {};
    const profitHistory: CycleRecord[] = tpia.profitHistory || [];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Investment Detail: TPIA-${tpia.tpiaNumber}`}
            className="w-full max-w-4xl mx-4 md:mx-auto p-0 overflow-hidden my-4 md:my-8 rounded-3xl shadow-2xl"
        >
            <div className="flex flex-col max-h-[85vh] overflow-y-auto">
                {/* Hero Header */}
                <div className="bg-gradient-to-br from-gray-950 via-gray-900 to-gray-900 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <TrendingUp className="w-32 h-32" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <Badge variant={tpia.status === 'active' ? 'success' : 'default'} className="bg-amber-500/20 text-amber-400 border-amber-500/30 px-3 py-1 font-black text-[10px] tracking-widest uppercase">
                                    {tpia.status.replace('_', ' ').toUpperCase()}
                                </Badge>
                                <span className="text-xs font-black text-white/50 uppercase tracking-widest">{commodity.symbol || 'GDIP'} Asset</span>
                            </div>
                            <h2 className="text-4xl font-black tracking-tighter uppercase">{commodity.name || 'Commodity Asset'}</h2>
                            <p className="text-white/60 font-bold flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Purchased on {new Date(tpia.purchaseDate).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="text-left md:text-right">
                            <p className="text-amber-100/60 text-[10px] font-black uppercase tracking-widest">{t("value")}</p>
                            <h3 className="text-4xl font-black tracking-tight mt-0.5">₦{tpia.currentValue.toLocaleString()}</h3>
                            <div className="inline-flex items-center gap-1.5 mt-2 bg-white/10 px-2 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                                <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
                                <span className="text-amber-400 text-xs font-black">{((tpia.currentValue / tpia.amount - 1) * 100).toFixed(1)}% Yield</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 md:p-10 space-y-8 bg-white">
                    {/* Key Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100 shadow-sm transition-transform hover:scale-[1.02]">
                            <div className="flex items-center gap-2 text-amber-600 mb-2 text-[10px] font-black uppercase tracking-widest">
                                <Activity className="h-4 w-4" />
                                {t("principal")}
                            </div>
                            <div className="text-2xl font-black text-gray-900">
                                ₦{tpia.amount.toLocaleString()}
                            </div>
                        </div>

                        <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 shadow-sm transition-transform hover:scale-[1.02]">
                            <div className="flex items-center gap-2 text-blue-600 mb-2 text-[10px] font-black uppercase tracking-widest">
                                <Clock className="h-4 w-4" />
                                {t("lifecycle")}
                            </div>
                            <div className="text-2xl font-black text-gray-900">
                                Cycle {tpia.currentCycle}/{tpia.totalCycles}
                            </div>
                            <div className="w-full bg-blue-200/50 h-2 rounded-full mt-3 overflow-hidden">
                                <div
                                    className="bg-blue-600 h-full rounded-full transition-all duration-1000"
                                    style={{ width: `${(tpia.currentCycle / tpia.totalCycles) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 shadow-sm transition-transform hover:scale-[1.02]">
                            <div className="flex items-center gap-2 text-indigo-600 mb-2 text-[10px] font-black uppercase tracking-widest">
                                <ShieldCheck className="h-4 w-4" />
                                {t("nextMaturity")}
                            </div>
                            <div className="text-xl font-black text-gray-900">
                                {tpia.maturityDate ? new Date(tpia.maturityDate).toLocaleDateString() : 'N/A'}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">
                                {tpia.daysUntilMaturity} {t("daysRemaining")}
                            </p>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                        {/* Payout History */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-black text-gray-900 flex items-center gap-2 uppercase tracking-widest">
                                <History className="h-4 w-4 text-amber-600" />
                                {t("payoutLogs")}
                            </h4>

                            <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm bg-white ring-1 ring-gray-950/5 max-h-[300px] overflow-y-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-gray-50/80 text-gray-400 font-black uppercase tracking-widest border-b border-gray-100 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-5 py-4">{t("status")}</th>
                                            <th className="px-5 py-4">{t("mode")}</th>
                                            <th className="px-5 py-4 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {profitHistory.length > 0 ? profitHistory.map((record, idx) => (
                                            <tr key={idx} className="hover:bg-amber-50/30 transition-colors group">
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                                                        <span className="font-black text-gray-600 uppercase">Cycle {idx + 1}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <Badge variant="info" className="px-2 py-0.5 text-[9px] font-black border-none bg-blue-50 text-blue-600">
                                                        {record.userMode}
                                                    </Badge>
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1 text-green-600 font-black">
                                                        ₦{record.amount.toLocaleString()}
                                                        <ArrowUpRight className="h-3 w-3" />
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={3} className="px-5 py-12 text-center">
                                                    <p className="text-gray-400 font-bold italic text-xs">{t("noActiveTPIAs")}</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Security & Logistics */}
                        <div className="space-y-6">
                            <h4 className="text-sm font-black text-gray-900 flex items-center gap-1 uppercase tracking-widest">
                                <FileText className="h-4 w-4 text-blue-600" />
                                {t("logistics")}
                            </h4>

                            <div className="space-y-4">
                                <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-start gap-4 group hover:border-blue-200 transition-all ring-1 ring-gray-950/5">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform shadow-blue-100/50 shadow-lg">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1 text-wrap">{t("warehouse")}</p>
                                        <p className="text-sm font-black text-gray-900 uppercase">Terminal 4, Lagos Free Zone</p>
                                        <p className="text-xs text-gray-500 font-medium mt-1 font-mono bg-gray-100 px-2 py-0.5 rounded w-fit">LOG-37-SEC</p>
                                    </div>
                                </div>

                                <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm space-y-4 group hover:border-indigo-200 transition-all ring-1 ring-gray-950/5">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform shadow-indigo-100/50 shadow-lg">
                                            <ShieldCheck className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">{t("insurancePolicy")}</p>
                                            <p className="text-sm font-black text-gray-900 uppercase">Full Coverage • Active</p>
                                            <p className="text-xs text-indigo-600 font-black mt-1 font-mono"># {tpia.insurancePolicyNumber || 'INS-PENDING'}</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="w-full border-2 border-indigo-50 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100 text-[10px] font-black uppercase tracking-widest py-3 rounded-xl gap-2 transition-all active:scale-95 shadow-sm">
                                        <Download className="h-4 w-4" />
                                        {t("downloadCertificate")}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer Actions */}
                    <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-4 justify-between">
                        <Button
                            onClick={() => router.push('/dashboard/marketplace')}
                            className="bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:shadow-xl active:scale-[0.98] gap-2 w-full sm:w-auto sm:flex-1"
                        >
                            <ExternalLink className="h-4 w-4" />
                            {t("viewNavChart")}
                        </Button>
                        <Button onClick={onClose} variant="secondary" className="px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border-2 border-transparent hover:border-gray-200 active:scale-[0.98] w-full sm:w-auto sm:flex-1 bg-gray-50 text-gray-600">
                            {t("close")}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}