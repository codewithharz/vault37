"use client";

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
