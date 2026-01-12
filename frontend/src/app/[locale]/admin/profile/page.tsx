"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
    User,
    Shield,
    Mail,
    Phone,
    UserCircle,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { useStore } from "@/store/useStore";
import api from "@/lib/api";
import { toast } from "sonner";

export default function AdminProfilePage() {
    const t = useTranslations("Settings");
    const { user, fetchProfile, isLoading } = useStore();
    const [formData, setFormData] = useState({
        fullName: '',
        phone: ''
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
    }, [user, fetchProfile]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            toast.loading("Updating profile...");
            await api.put('/users/profile', formData);
            await fetchProfile(); // Refresh global store
            toast.dismiss();
            toast.success("Profile updated successfully");
        } catch (error: any) {
            toast.dismiss();
            toast.error(error.response?.data?.message || "Failed to update profile");
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Admin Profile</h2>
                <p className="text-gray-500">Manage your personal account information and security.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex flex-col items-center text-center">
                                <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center mb-4 text-blue-600">
                                    <User className="h-10 w-10" />
                                </div>
                                <h3 className="font-bold text-gray-900">{user?.fullName}</h3>
                                <p className="text-sm text-gray-500 mb-4">{user?.email}</p>
                                <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase">
                                    Admin Access
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account Security</h4>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Shield className="h-4 w-4 text-green-500" />
                                <span>Multi-factor Auth: <span className="font-medium">Active</span></span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                                <span>Identity Verified</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <UserCircle className="w-5 h-5 text-gray-400" />
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Profile Information</h3>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="text"
                                                value={formData.fullName}
                                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium text-gray-700">Email Address (Read-only)</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="email"
                                                value={user?.email || ''}
                                                disabled
                                                className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 text-sm cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4 border-t border-gray-100">
                                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Save Profile Updates</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-gray-400" />
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">System Access Log</h3>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-gray-100">
                                <div className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                                            <CheckCircle2 className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Last successful login</p>
                                            <p className="text-xs text-gray-500">IP: 192.168.1.1 (Lagos, NG)</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400">Just now</span>
                                </div>
                                <div className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
                                            <AlertCircle className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Setting changed: arbitrage_margin</p>
                                            <p className="text-xs text-gray-500">Modified from 10.5% to 11%</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400">2 hours ago</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
