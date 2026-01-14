"use client";

import { Check, Copy, Share2, QrCode } from "lucide-react";
import { useState } from "react";

interface ReferralCodeCardProps {
    referralCode: string;
}

export function ReferralCodeCard({ referralCode }: ReferralCodeCardProps) {
    const [copied, setCopied] = useState(false);

    const copyReferralCode = () => {
        if (referralCode) {
            navigator.clipboard.writeText(referralCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const shareViaWhatsApp = () => {
        const message = `Join GDIP using my referral code: ${referralCode}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <div className="bg-gradient-to-br from-amber-50 to-white border-2 border-dashed border-amber-300 rounded-xl p-6 mb-4">
            <p className="text-xs text-gray-600 font-medium mb-2">Your Referral Code</p>
            <div className="flex items-center justify-between gap-3">
                <span className="text-2xl font-bold font-mono text-amber-600">
                    {referralCode || 'LOADING...'}
                </span>
                <button
                    onClick={copyReferralCode}
                    className="p-2 hover:bg-amber-100 rounded-lg transition-colors"
                    title="Copy code"
                >
                    {copied ? (
                        <Check className="w-5 h-5 text-emerald-600" />
                    ) : (
                        <Copy className="w-5 h-5 text-gray-400" />
                    )}
                </button>
            </div>

            {/* QR Code & Share Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6 pt-4 border-t border-amber-200 border-dashed">
                {/* Minimalist QR Code Placeholder */}
                <div className="flex-shrink-0 flex items-center justify-center p-2 bg-white rounded-lg border border-gray-200">
                    <div className="w-24 h-24 bg-gray-900 flex items-center justify-center rounded">
                        <QrCode className="w-12 h-12 text-white" />
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-1 gap-2">
                    <button
                        onClick={shareViaWhatsApp}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-lg hover:bg-[#128c7e] transition-colors text-sm font-medium"
                    >
                        <Share2 className="w-4 h-4" />
                        Share on WhatsApp
                    </button>
                    <button
                        onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Join GDIP using my code: ${referralCode}`)}`, '_blank')}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                    >
                        <span className="w-4 h-4 flex items-center justify-center font-bold text-xs">𝕏</span>
                        Share on X
                    </button>
                    <button
                        onClick={copyReferralCode}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                        <Copy className="w-4 h-4" />
                        Copy Link
                    </button>
                </div>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------

interface ReferralHistoryProps {
    referredUsers: Array<{
        joinDate: Date;
        status: string;
        hasTPIA: boolean;
        earnings: number;
    }>;
}

export function ReferralHistory({ referredUsers }: ReferralHistoryProps) {
    if (!referredUsers || referredUsers.length === 0) return null;

    return (
        <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Recent Referrals</p>
            <div className="space-y-2">
                {referredUsers.slice(0, 5).map((user, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {index + 1}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    Joined {new Date(user.joinDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {user.hasTPIA ? '✓ Active Investor' : 'Not yet invested'}
                                </p>
                            </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
                            }`}>
                            {user.status}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
