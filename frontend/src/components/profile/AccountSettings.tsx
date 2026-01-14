"use client";

import { Settings, User, Shield, Briefcase, Lock } from "lucide-react";
import { PersonalInfoForm } from "./PersonalInfoForm";
import { KYCStatusCard } from "./KYCStatusCard";
import { BankAccountsManager } from "./BankAccountsManager";
import { SecuritySettings } from "./SecuritySettings";

export function AccountSettings({ user }: { user: any }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                        <Settings className="w-5 h-5 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Account Settings</h3>
                </div>
            </div>

            <div className="divide-y divide-gray-100">
                {/* Personal Info Section */}
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <User className="w-4 h-4 text-gray-500" />
                        <h4 className="font-medium text-gray-900">Personal Information</h4>
                    </div>
                    <PersonalInfoForm user={user} />
                </div>

                {/* Verification Section */}
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Shield className="w-4 h-4 text-gray-500" />
                        <h4 className="font-medium text-gray-900">Identity & Security</h4>
                    </div>
                    <KYCStatusCard status="unverified" />
                </div>

                {/* Security Section */}
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Lock className="w-4 h-4 text-gray-500" />
                        <h4 className="font-medium text-gray-900">Security</h4>
                    </div>
                    <SecuritySettings />
                </div>

                {/* Financial Section */}
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Briefcase className="w-4 h-4 text-gray-500" />
                        <h4 className="font-medium text-gray-900">Financial Accounts</h4>
                    </div>
                    <BankAccountsManager />
                </div>
            </div>
        </div>
    );
}
