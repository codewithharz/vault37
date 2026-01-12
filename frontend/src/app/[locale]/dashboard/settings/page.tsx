"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
    User,
    Shield,
    Lock,
    Bell,
    CreditCard,
    ChevronRight,
    Upload,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { useStore } from "@/store/useStore";
import api from "@/lib/api";
import { toast } from "sonner";

export default function SettingsPage() {
    const t = useTranslations("Settings");
    const tCommon = useTranslations("Common");
    const { user, fetchProfile, isLoading } = useStore();
    const { wallet, fetchWallet } = useStore();

    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: ''
    });

    // KYC State
    const [kycData, setKycData] = useState({
        idType: 'National ID',
        idNumber: ''
    });

    const [bankModalOpen, setBankModalOpen] = useState(false);
    const [bankLoading, setBankLoading] = useState(false);
    const [bankData, setBankData] = useState({
        bankName: '',
        accountNumber: '',
        accountName: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                phone: user.phone || ''
            });
        } else {
            fetchProfile();
        }
        fetchWallet();
    }, [user, fetchProfile, fetchWallet]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            toast.loading("Updating profile...");
            await api.put('/users/profile', formData);
            await fetchProfile(); // Refresh global store
            toast.dismiss();
            toast.success("Profile updated successfully");
            setIsEditing(false);
        } catch (error: any) {
            toast.dismiss();
            const message = error.response?.data?.message || error.response?.data?.error || "Failed to update profile";
            toast.error(message);
        }
    };

    const handleAddBank = async (e: React.FormEvent) => {
        e.preventDefault();
        setBankLoading(true);
        try {
            await api.post('/wallet/bank-account', bankData);
            await fetchWallet();
            setBankModalOpen(false);
            setBankData({ bankName: '', accountNumber: '', accountName: '' });
            toast.success("Bank account added successfully");
        } catch (error: any) {
            const message = error.response?.data?.message || error.response?.data?.error || "Failed to add bank account";
            toast.error(message);
        } finally {
            setBankLoading(false);
        }
    };

    const handleDeleteBank = async (id: string) => {
        if (!confirm("Are you sure you want to delete this bank account?")) return;
        try {
            toast.loading("Deleting bank account...");
            await api.delete(`/wallet/bank-account/${id}`);
            await fetchWallet();
            toast.dismiss();
            toast.success("Bank account deleted");
        } catch (error: any) {
            toast.dismiss();
            const message = error.response?.data?.message || error.response?.data?.error || "Failed to delete bank account";
            toast.error(message);
        }
    };

    const handleSetDefaultBank = async (id: string) => {
        try {
            toast.loading("Setting default...");
            await api.patch(`/wallet/bank-account/${id}/default`);
            await fetchWallet();
            toast.dismiss();
            toast.success("Default bank account updated");
        } catch (error: any) {
            toast.dismiss();
            const message = error.response?.data?.message || error.response?.data?.error || "Failed to update default bank account";
            toast.error(message);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">{t("loading")}</div>;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">{t("title")}</h2>
                <p className="text-gray-500">{t("subtitle")}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex flex-col items-center text-center">
                                <div className="h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                                    <User className="h-10 w-10 text-amber-600" />
                                </div>
                                <h3 className="font-bold text-gray-900">{user?.fullName}</h3>
                                <p className="text-sm text-gray-500 mb-4">{user?.email}</p>
                                <Badge variant={user?.kycStatus === 'verified' ? 'success' : 'default'} className="uppercase">
                                    KYC: {user?.kycStatus || 'NOT STARTED'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <nav className="flex flex-col gap-1">
                        {[
                            { id: 'profile', icon: User, label: t('profile') },
                            { id: 'billing', icon: CreditCard, label: t('billing') }
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex items-center justify-between p-3 text-sm font-medium rounded-lg transition-colors group ${activeTab === item.id
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className={`h-4 w-4 ${activeTab === item.id ? 'text-amber-600' : 'text-gray-400 group-hover:text-amber-600'}`} />
                                    {item.label}
                                </div>
                                <ChevronRight className={`h-4 w-4 ${activeTab === item.id ? 'text-amber-400' : 'text-gray-300'}`} />
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="md:col-span-2 space-y-6">
                    {activeTab === 'profile' ? (
                        <>
                            <Card>
                                <CardHeader>
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{t("kyc")}</h3>
                                </CardHeader>
                                <CardContent className="p-6">
                                    {user?.kycStatus === 'verified' ? (
                                        <div className="flex items-start gap-4 p-4 bg-green-50 border border-green-100 rounded-xl">
                                            <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                                            <div>
                                                <h4 className="font-bold text-green-900">{t("verified")}</h4>
                                                <p className="text-sm text-green-800">{t("verifiedDesc")}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="flex items-start gap-4 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                                                <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0" />
                                                <div>
                                                    <h4 className="font-bold text-amber-900">{t("unverified")}</h4>
                                                    <p className="text-sm text-amber-800">{t("verificationDesc")}</p>
                                                </div>
                                            </div>

                                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center space-y-4">
                                                <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                                                    <Upload className="h-6 w-6 text-gray-400" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{t("uploadDoc")}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{t("uploadLimit") || "Max 5MB (JPG, PNG, PDF)"}</p>
                                                </div>

                                                <div className="max-w-xs mx-auto">
                                                    <input
                                                        type="file"
                                                        id="kyc-upload"
                                                        className="hidden"
                                                        accept=".jpg,.jpeg,.png,.pdf"
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (!file) return;

                                                            const formData = new FormData();
                                                            formData.append('document', file);
                                                            formData.append('idType', kycData.idType);
                                                            formData.append('idNumber', kycData.idNumber);

                                                            try {
                                                                if (!kycData.idNumber) {
                                                                    toast.error("Please enter your ID Number first");
                                                                    return;
                                                                }

                                                                toast.loading("Uploading document...");
                                                                await api.post('/user/kyc', formData, {
                                                                    headers: { 'Content-Type': 'multipart/form-data' }
                                                                });
                                                                toast.dismiss();
                                                                toast.success("KYC submission successful! Awaiting review.");
                                                                await fetchProfile();
                                                            } catch (error) {
                                                                toast.dismiss();
                                                                toast.error("Upload failed. Please try again.");
                                                            }
                                                        }}
                                                    />
                                                    <Button
                                                        variant="primary"
                                                        className="w-full"
                                                        onClick={() => document.getElementById('kyc-upload')?.click()}
                                                    >
                                                        {t("selectFiles") || "Select Document"}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{t("profileInfo")}</h3>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">{t("fullName") || "Full Name"}</label>
                                            <input
                                                type="text"
                                                value={formData.fullName}
                                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm text-gray-900 placeholder:text-gray-400"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">{t("phone") || "Phone Number"}</label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm text-gray-900 placeholder:text-gray-400"
                                            />
                                        </div>
                                        <div className="space-y-1 md:col-span-2">
                                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">{t("email")}</label>
                                            <input type="email" value={user?.email || ''} disabled className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-sm cursor-not-allowed" />
                                        </div>
                                        <div className="md:col-span-2 pt-4">
                                            <Button type="submit" variant="primary" className="w-full md:w-auto">{t("saveChanges")}</Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{t("bankAccounts")}</h3>
                                    <p className="text-xs text-gray-500 mt-1">{t("bankAccountsDesc")}</p>
                                </div>
                                <Button size="sm" onClick={() => setBankModalOpen(true)}>
                                    {t("addAccount")}
                                </Button>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {!wallet?.bankAccounts || wallet.bankAccounts.length === 0 ? (
                                        <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                            <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                            <p className="text-sm text-gray-500 font-medium">{t("noAccounts")}</p>
                                        </div>
                                    ) : (
                                        wallet.bankAccounts.map((account) => (
                                            <div key={account._id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 bg-amber-50 rounded-full flex items-center justify-center">
                                                        <CreditCard className="h-5 w-5 text-amber-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{account.bankName}</p>
                                                        <p className="text-xs text-gray-500">{account.accountNumber} • {account.accountName}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {!account.isDefault && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                                            onClick={() => handleSetDefaultBank(account._id)}
                                                        >
                                                            {t("setDefault")}
                                                        </Button>
                                                    )}
                                                    {account.isDefault && (
                                                        <Badge variant="success" className="text-[10px]">{t("default")}</Badge>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => handleDeleteBank(account._id)}
                                                    >
                                                        {t("deleteAccount")}
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {bankModalOpen && (
                                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                                        <Card className="max-w-md w-full animate-in fade-in zoom-in duration-200">
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-bold text-gray-900">{t("addAccount")}</h3>
                                                    <button onClick={() => setBankModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                                        <ChevronRight className="h-5 w-5 rotate-90" />
                                                    </button>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <form onSubmit={handleAddBank} className="space-y-4">
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-bold text-gray-700 uppercase">{t("bankName")}</label>
                                                        <input
                                                            required
                                                            type="text"
                                                            value={bankData.bankName}
                                                            onChange={(e) => setBankData({ ...bankData, bankName: e.target.value })}
                                                            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm text-gray-900 placeholder:text-gray-400"
                                                            placeholder="e.g. GTBank"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-bold text-gray-700 uppercase">{t("accountNumber")}</label>
                                                        <input
                                                            required
                                                            type="text"
                                                            maxLength={10}
                                                            value={bankData.accountNumber}
                                                            onChange={(e) => setBankData({ ...bankData, accountNumber: e.target.value.replace(/\D/g, '') })}
                                                            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm text-gray-900 placeholder:text-gray-400"
                                                            placeholder="10 digits"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-bold text-gray-700 uppercase">{t("accountName")}</label>
                                                        <input
                                                            required
                                                            type="text"
                                                            value={bankData.accountName}
                                                            onChange={(e) => setBankData({ ...bankData, accountName: e.target.value })}
                                                            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm text-gray-900 placeholder:text-gray-400"
                                                            placeholder="Full Account Name"
                                                        />
                                                    </div>
                                                    <div className="flex gap-2 pt-4">
                                                        <Button type="button" variant="ghost" className="flex-1" onClick={() => setBankModalOpen(false)}>
                                                            {tCommon("cancel")}
                                                        </Button>
                                                        <Button type="submit" disabled={bankLoading} className="flex-1">
                                                            {bankLoading ? t("adding") : t("addAccount")}
                                                        </Button>
                                                    </div>
                                                </form>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
