"use client";

import { Modal } from "../ui/Modal";
import { Badge } from "../ui/Badge";
import {
    Calendar,
    TrendingUp,
    ShieldCheck,
    Clock,
    History,
    Activity
} from "lucide-react";
import { useTranslations } from "next-intl";

interface CycleRecord {
    cycleNumber: number;
    profit: number;
    date: string;
    mode: string;
}

interface TPIADetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    tpia: any;
}

export function TPIADetailsModal({ isOpen, onClose, tpia }: TPIADetailsModalProps) {
    const t = useTranslations("Portfolio");
    if (!tpia) return null;

    // Simulate cycle history if not present in the object
    const history: CycleRecord[] = tpia.profitHistory || [
        { cycleNumber: 1, profit: tpia.initialInvestment * 0.08, date: "2026-01-05", mode: tpia.cycleStartMode || "CLUSTER" }
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`TPIA Details: #${tpia.tpiaId || tpia.tpiaNumber}`}
            className="max-w-2xl"
        >
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500 mb-1 text-xs font-medium uppercase tracking-wider">
                            <Activity className="h-4 w-4" />
                            {t("value")}
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            ₦{tpia.currentValue.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1 text-green-600 text-xs mt-1 font-semibold">
                            <TrendingUp className="h-3 w-3" />
                            +₦{(tpia.currentValue - (tpia.initialInvestment || 100000)).toLocaleString()}
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500 mb-1 text-xs font-medium uppercase tracking-wider">
                            <Clock className="h-4 w-4" />
                            {t("progress")}
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            Cycle {tpia.currentCycle || 1}/24
                        </div>
                        <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2">
                            <div
                                className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${((tpia.currentCycle || 1) / 24) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500 mb-1 text-xs font-medium uppercase tracking-wider">
                            <Badge variant="info" className="p-0 bg-transparent border-none text-[10px] uppercase font-bold text-blue-600">
                                {tpia.investmentPhase === 'EXTENDED' ? t('extended') : t('core')}
                            </Badge>
                        </div>
                        <div className="text-sm font-bold text-gray-900 mt-1">
                            {tpia.maturityDate ? new Date(tpia.maturityDate).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1 uppercase font-bold">
                            {t("maturity")}
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <History className="h-4 w-4 text-amber-600" />
                        Trade Cycle History
                    </h4>

                    <div className="border border-gray-100 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3">{t("cycleNumber")}</th>
                                    <th className="px-4 py-3">{t("return")}</th>
                                    <th className="px-4 py-3">{t("mode")}</th>
                                    <th className="px-4 py-3 text-right">{t("date")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {history.map((record) => (
                                    <tr key={record.cycleNumber} className="hover:bg-amber-50/30 transition-colors">
                                        <td className="px-4 py-3 font-bold text-gray-700">Cycle {record.cycleNumber}</td>
                                        <td className="px-4 py-3 text-green-600 font-bold">₦{(record.profit || 0).toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant="default" className="text-[10px] py-0">
                                                {record.mode}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-gray-400 text-right">{new Date(record.date).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-amber-900">{t("protection")}</p>
                        <p className="text-xs text-amber-800">
                            {t("protectionDesc")}
                        </p>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
