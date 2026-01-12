"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import api from "@/lib/api";
import { toast } from "sonner";
import {
    Save,
    RefreshCcw,
    ShieldCheck,
    PieChart,
    TrendingUp,
    AlertTriangle,
    Info,
    Lock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";

interface SystemSettings {
    tpia: {
        investmentAmount: number;
        profitAmount: number;
        cycleDurationDays: number;
        autoApproveEnabled: boolean;
        approvalWindowMin: number;
        approvalWindowMax: number;
        totalCycles: number;
        coreCycles: number;
        extendedCycles: number;
        exitWindowInterval: number;
        exitWindowDuration: number;
    };
    gdc: {
        tpiasPerGdc: number;
    };
    economics: {
        monthlyMarginPercent: number;
    };
    exitPenalties: Record<string, number>;
}

export default function SettingsPage() {
    const t = useTranslations('AdminSettings');
    const locale = useLocale();
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [resetting, setResetting] = useState(false);

    // Security modal state
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordInput, setPasswordInput] = useState("");
    const [reasonInput, setReasonInput] = useState("");
    const [confirmationInput, setConfirmationInput] = useState("");
    const [pendingAction, setPendingAction] = useState<"save" | "reset" | null>(null);

    const formatValue = (value: number) => {
        return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
    };

    const parseValue = (value: string) => {
        // Remove all non-numeric characters
        const cleanValue = value.replace(/[^0-9]/g, '');
        return cleanValue === '' ? 0 : parseInt(cleanValue, 10);
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await api.get("/settings");
            if (response.data.success) {
                setSettings(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch settings", error);
            toast.error(t('messages.loadError'));
        } finally {
            setLoading(false);
        }
    };

    const handleSaveInitiate = () => {
        setPendingAction("save");
        setIsPasswordModalOpen(true);
    };

    const handleResetInitiate = () => {
        if (!confirm(t('messages.resetConfirm'))) return;
        setPendingAction("reset");
        setIsPasswordModalOpen(true);
    };

    const handlePasswordConfirm = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!passwordInput) {
            toast.error(t('messages.passwordRequired'));
            return;
        }

        if (reasonInput.length < 10) {
            toast.error(t('messages.reasonRequired'));
            return;
        }

        if (confirmationInput !== "CONFIRM") {
            toast.error(t('messages.confirmRequired'));
            return;
        }

        if (pendingAction === "save") {
            await executeSave();
        } else if (pendingAction === "reset") {
            await executeReset();
        }

        setIsPasswordModalOpen(false);
        setPasswordInput("");
        setReasonInput("");
        setConfirmationInput("");
        setPendingAction(null);
    };

    const executeSave = async () => {
        if (!settings) return;
        try {
            setSaving(true);
            const response = await api.patch("/settings", {
                ...settings,
                password: passwordInput,
                reason: reasonInput,
                confirmation: confirmationInput
            });
            if (response.data.success) {
                toast.success(t('messages.saveSuccess'));
            }
        } catch (error: any) {
            console.error("Failed to update settings", error);
            toast.error(error.response?.data?.message || t('messages.saveError'));
        } finally {
            setSaving(false);
        }
    };

    const executeReset = async () => {
        try {
            setResetting(true);
            const response = await api.post("/settings/reset", {
                password: passwordInput,
                reason: reasonInput,
                confirmation: confirmationInput
            });
            if (response.data.success) {
                setSettings(response.data.data);
                toast.success(t('messages.resetSuccess'));
            }
        } catch (error: any) {
            console.error("Failed to reset settings", error);
            toast.error(error.response?.data?.message || t('messages.resetError'));
        } finally {
            setResetting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!settings) return null;

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">{t('title')}</h2>
                    <p className="text-gray-500">{t('description')}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="secondary"
                        onClick={handleResetInitiate}
                        disabled={resetting || saving}
                        className="gap-2"
                    >
                        <RefreshCcw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
                        {t('buttons.reset')}
                    </Button>
                    <Button
                        onClick={handleSaveInitiate}
                        disabled={saving || resetting}
                        className="gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? t('buttons.saving') : t('buttons.save')}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* TPIA Configuration */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-blue-600" />
                                <CardTitle>{t('sections.tpia.title')}</CardTitle>
                            </div>
                            <CardDescription>{t('sections.tpia.description')}</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{t('form.investmentAmount')}</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                                    value={formatValue(settings.tpia.investmentAmount)}
                                    onChange={(e) => setSettings({ ...settings, tpia: { ...settings.tpia, investmentAmount: parseValue(e.target.value) } })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{t('form.profitAmount')}</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                                    value={formatValue(settings.tpia.profitAmount)}
                                    onChange={(e) => setSettings({ ...settings, tpia: { ...settings.tpia, profitAmount: parseValue(e.target.value) } })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{t('form.cycleDuration')}</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                                    value={formatValue(settings.tpia.cycleDurationDays)}
                                    onChange={(e) => setSettings({ ...settings, tpia: { ...settings.tpia, cycleDurationDays: parseValue(e.target.value) } })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{t('form.exitWindowInterval')}</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                                    value={formatValue(settings.tpia.exitWindowInterval)}
                                    onChange={(e) => setSettings({ ...settings, tpia: { ...settings.tpia, exitWindowInterval: parseValue(e.target.value) } })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                                <CardTitle>{t('sections.lifecycle.title')}</CardTitle>
                            </div>
                            <CardDescription>{t('sections.lifecycle.description')}</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{t('form.coreCycles')}</label>
                                <input
                                    type="number"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                                    value={settings.tpia.coreCycles}
                                    onChange={(e) => setSettings({ ...settings, tpia: { ...settings.tpia, coreCycles: parseInt(e.target.value) } })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{t('form.extendedCycles')}</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                                    value={formatValue(settings.tpia.coreCycles)}
                                    onChange={(e) => setSettings({ ...settings, tpia: { ...settings.tpia, coreCycles: parseValue(e.target.value) } })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{t('form.extendedCycles')}</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                                    value={formatValue(settings.tpia.extendedCycles)}
                                    onChange={(e) => setSettings({ ...settings, tpia: { ...settings.tpia, extendedCycles: parseValue(e.target.value) } })}
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{t('form.autoApprove.label')}</p>
                                    <p className="text-xs text-gray-500">{t('form.autoApprove.desc')}</p>
                                </div>
                                <button
                                    onClick={() => setSettings({ ...settings, tpia: { ...settings.tpia, autoApproveEnabled: !settings.tpia.autoApproveEnabled } })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${settings.tpia.autoApproveEnabled ? 'bg-blue-600' : 'bg-gray-200'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.tpia.autoApproveEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{t('form.approvalWindowMax')}</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                                    value={formatValue(settings.tpia.approvalWindowMax)}
                                    onChange={(e) => setSettings({ ...settings, tpia: { ...settings.tpia, approvalWindowMax: parseValue(e.target.value) } })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Settings */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-amber-600" />
                                <CardTitle>{t('sections.economics.title')}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-700">{t('form.monthlyMargin')}</label>
                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{settings.economics.monthlyMarginPercent}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="50"
                                    step="0.5"
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    value={settings.economics.monthlyMarginPercent}
                                    onChange={(e) => setSettings({ ...settings, economics: { monthlyMarginPercent: parseFloat(e.target.value) } })}
                                />
                                <div className="p-3 bg-blue-50 rounded-lg flex items-start gap-2">
                                    <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-[10px] text-blue-700 leading-relaxed">
                                        {t('form.marginInfo')}
                                    </p>
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">{t('form.gdcClusterSize')}</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                                        value={formatValue(settings.gdc.tpiasPerGdc)}
                                        onChange={(e) => setSettings({ ...settings, gdc: { tpiasPerGdc: parseValue(e.target.value) } })}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">TPIAs</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card border-red-200>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                                <CardTitle>{t('sections.penalties.title')}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {Object.entries(settings.exitPenalties).sort((a, b) => parseInt(a[0]) - parseInt(b[0])).map(([cycle, penalty]) => (
                                <div key={cycle} className="flex items-center justify-between gap-4">
                                    <span className="text-sm text-gray-600 min-w-[80px]">{t('form.cycleLabel', { cycle })}</span>
                                    <div className="flex-1 relative">
                                        <input
                                            type="number"
                                            className="w-full pl-3 pr-8 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-gray-900 bg-white"
                                            value={penalty * 100}
                                            onChange={(e) => {
                                                const newPenalties = { ...settings.exitPenalties };
                                                newPenalties[cycle] = parseFloat(e.target.value) / 100;
                                                setSettings({ ...settings, exitPenalties: newPenalties });
                                            }}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">%</span>
                                    </div>
                                </div>
                            ))}
                            <div className="p-3 bg-red-50 rounded-lg">
                                <p className="text-[10px] text-red-700 leading-relaxed font-medium">
                                    {t('sections.penalties.caution')}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Password Verification Modal */}
            <Modal
                isOpen={isPasswordModalOpen}
                onClose={() => {
                    setIsPasswordModalOpen(false);
                    setPasswordInput("");
                    setReasonInput("");
                    setConfirmationInput("");
                    setPendingAction(null);
                }}
                title={t('securityModal.title')}
            >
                <form onSubmit={handlePasswordConfirm} className="space-y-4">
                    <div className="flex flex-col items-center text-center p-2 mb-2">
                        <div className="h-12 w-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-3">
                            <Lock className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{t('securityModal.heading')}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            {t('securityModal.subheading')}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">{t('securityModal.reasonLabel')}</label>
                            <textarea
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-sm min-h-[80px] text-gray-900 bg-white"
                                placeholder={t('securityModal.reasonPlaceholder')}
                                value={reasonInput}
                                onChange={(e) => setReasonInput(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">{t('securityModal.passwordLabel')}</label>
                            <Input
                                type="password"
                                placeholder={t('securityModal.passwordPlaceholder')}
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-gray-700">{t('securityModal.confirmLabel')}</label>
                                <span className="text-[10px] text-gray-400">{t('securityModal.typeConfirm')} <span className="font-bold text-gray-600">CONFIRM</span></span>
                            </div>
                            <Input
                                type="text"
                                placeholder={t('securityModal.confirmPlaceholder')}
                                value={confirmationInput}
                                onChange={(e) => setConfirmationInput(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-4">
                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            disabled={saving || resetting}
                        >
                            {t('securityModal.authorize')}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                setIsPasswordModalOpen(false);
                                setPasswordInput("");
                                setReasonInput("");
                                setConfirmationInput("");
                                setPendingAction(null);
                            }}
                            className="w-full"
                        >
                            {t('securityModal.cancel')}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
