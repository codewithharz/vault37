"use client";

import { useState } from "react";
import { Lock, Shield, Smartphone } from "lucide-react";

export function SecuritySettings() {
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Password update simulated");
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    };

    return (
        <div className="space-y-8">
            {/* Change Password */}
            <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-500" />
                    Change Password
                </h4>
                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                    <div>
                        <input
                            type="password"
                            placeholder="Current Password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="New Password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Confirm New Password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                        Update Password
                    </button>
                </form>
            </div>

            {/* 2FA Toggle */}
            <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-gray-500" />
                            Two-Factor Authentication
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">Secure your account with 2FA.</p>
                    </div>
                    <button
                        onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${twoFactorEnabled ? 'bg-emerald-500' : 'bg-gray-200'
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>
            </div>
        </div>
    );
}
