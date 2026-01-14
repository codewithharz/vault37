"use client";

import { ShieldCheck, Clock, AlertTriangle, Upload } from "lucide-react";

interface KYCStatusCardProps {
    status: 'verified' | 'pending' | 'rejected' | 'unverified';
}

export function KYCStatusCard({ status }: KYCStatusCardProps) {
    const getConfig = () => {
        switch (status) {
            case 'verified':
                return {
                    icon: <ShieldCheck className="w-8 h-8 text-emerald-600" />,
                    color: 'bg-emerald-50 border-emerald-100',
                    title: 'Verified Investor',
                    desc: 'Your identity has been verified. You have full access to all platform features.',
                    badge: 'Verified'
                };
            case 'pending':
                return {
                    icon: <Clock className="w-8 h-8 text-amber-600" />,
                    color: 'bg-amber-50 border-amber-100',
                    title: 'Verification Pending',
                    desc: 'We are currently reviewing your documents. This usually takes 24-48 hours.',
                    badge: 'In Review'
                };
            case 'rejected':
                return {
                    icon: <AlertTriangle className="w-8 h-8 text-red-600" />,
                    color: 'bg-red-50 border-red-100',
                    title: 'Verification Failed',
                    desc: 'There was an issue with your documents. Please review the feedback and try again.',
                    badge: 'Action Required'
                };
            default:
                return {
                    icon: <ShieldCheck className="w-8 h-8 text-gray-400" />,
                    color: 'bg-gray-50 border-gray-200',
                    title: 'Identity Verification',
                    desc: 'Verify your identity to unlock higher limits and withdrawal features.',
                    badge: 'Unverified'
                };
        }
    };

    const config = getConfig();

    return (
        <div className={`p-6 rounded-xl border ${config.color} mb-6`}>
            <div className="flex items-start justify-between">
                <div className="flex gap-4">
                    <div className="p-3 bg-white rounded-full shadow-sm">
                        {config.icon}
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
                            {config.title}
                            <span className="text-xs px-2 py-1 rounded-full bg-white border border-gray-200 font-medium">
                                {config.badge}
                            </span>
                        </h4>
                        <p className="text-sm text-gray-600 mt-1 max-w-lg">
                            {config.desc}
                        </p>
                    </div>
                </div>
                {status === 'unverified' || status === 'rejected' ? (
                    <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm font-medium">
                        <Upload className="w-4 h-4" />
                        Upload Documents
                    </button>
                ) : null}
            </div>
        </div>
    );
}
