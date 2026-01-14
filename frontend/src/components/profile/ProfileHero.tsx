import { User, TrendingUp, Target, Award, Shield, Copy, Check } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface QuickStatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    change?: number;
    format?: 'currency' | 'number' | 'text';
    delay?: number;
}

function QuickStatCard({ icon, label, value, change, format = 'number', delay = 0 }: QuickStatCardProps) {
    const formattedValue = format === 'currency'
        ? `₦${Number(value).toLocaleString()}`
        : format === 'number'
            ? Number(value).toLocaleString()
            : value;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 transform-gpu"
        >
            <div className="flex items-start justify-between">
                <div className="p-3 bg-amber-50 rounded-lg">
                    {icon}
                </div>
                {change !== undefined && (
                    <span className={`text-sm font-semibold ${change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {change >= 0 ? '+' : ''}{change}%
                    </span>
                )}
            </div>
            <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900 font-mono">{formattedValue}</p>
                <p className="text-sm text-gray-600 font-medium mt-1">{label}</p>
            </div>
        </motion.div>
    );
}

interface AchievementBadgeProps {
    achievement: {
        id: string;
        name: string;
        description: string;
        icon: string;
        unlockedAt?: Date;
    };
    index: number;
}

function AchievementBadge({ achievement, index }: AchievementBadgeProps) {
    const isUnlocked = !!achievement.unlockedAt;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.1 * index
            }}
            className={`group relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 cursor-help ${isUnlocked
                ? 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg hover:scale-110 hover:shadow-amber-200'
                : 'bg-gray-200 grayscale opacity-50'
                }`}
            title={achievement.description}
        >
            <span className="text-2xl select-none">{achievement.icon}</span>

            {/* Tooltip with animation */}
            <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 origin-bottom transform transition-all duration-200">
                <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-xl">
                    <p className="font-semibold">{achievement.name}</p>
                    <p className="text-gray-300 text-[10px] mt-0.5">{achievement.description}</p>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                        <div className="border-4 border-transparent border-t-gray-900"></div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

interface ProfileHeroProps {
    user: any;
    stats: any;
    achievements: any[];
}

export function ProfileHero({ user, stats, achievements = [] }: ProfileHeroProps) {
    const [copied, setCopied] = useState(false);

    const copyReferralCode = () => {
        if (user?.referralCode) {
            navigator.clipboard.writeText(user.referralCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const getInitials = (name: string) => {
        return name
            ?.split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'U';
    };

    const memberSince = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : '';

    return (
        <div className="bg-gradient-to-br from-amber-50 via-white to-white rounded-2xl border border-gray-200 p-8 shadow-sm relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-100/30 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

            {/* User Identity Section */}
            <div className="flex flex-col md:flex-row md:items-start gap-6 mb-8 relative z-10">
                {/* Avatar */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15
                    }}
                    className="relative"
                >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg ring-4 ring-amber-50">
                        {getInitials(user?.fullName || 'User')}
                    </div>
                    {user?.kycStatus === 'verified' && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, type: "spring" }}
                            className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center ring-4 ring-white"
                        >
                            <Shield className="w-4 h-4 text-white" />
                        </motion.div>
                    )}
                </motion.div>

                {/* User Info */}
                <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-3xl font-bold text-gray-900">
                            {user?.fullName || 'User'}
                        </h1>
                        {user?.kycStatus === 'verified' && (
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                                Verified
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="font-medium capitalize">{user?.role || 'Investor'}</span>
                        <span>•</span>
                        <span>Member since {memberSince}</span>
                    </div>

                    {/* Referral Code */}
                    {user?.referralCode && (
                        <div className="mt-4 inline-flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 transition-colors hover:border-amber-200">
                            <span className="text-xs text-gray-500 font-medium">Referral Code:</span>
                            <span className="font-mono font-bold text-amber-600 select-all">{user.referralCode}</span>
                            <button
                                onClick={copyReferralCode}
                                className="ml-2 p-1.5 hover:bg-gray-100 rounded transition-colors"
                                title="Copy referral code"
                            >
                                {copied ? (
                                    <Check className="w-4 h-4 text-emerald-600" />
                                ) : (
                                    <Copy className="w-4 h-4 text-gray-400" />
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 relative z-10">
                <QuickStatCard
                    icon={<TrendingUp className="w-6 h-6 text-amber-600" />}
                    label="Portfolio Value"
                    value={stats?.totalPortfolioValue || 0}
                    format="currency"
                    delay={0.1}
                />
                <QuickStatCard
                    icon={<Target className="w-6 h-6 text-amber-600" />}
                    label="Total TPIAs"
                    value={stats?.totalTPIAs || 0}
                    format="number"
                    delay={0.2}
                />
                <QuickStatCard
                    icon={<Award className="w-6 h-6 text-amber-600" />}
                    label="Active Cycles"
                    value={stats?.activeCycles || 0}
                    format="number"
                    delay={0.3}
                />
                <QuickStatCard
                    icon={<TrendingUp className="w-6 h-6 text-emerald-600" />}
                    label="Total Profit"
                    value={stats?.totalProfitEarned || 0}
                    format="currency"
                    delay={0.4}
                />
            </div>

            {/* Achievement Badges */}
            {achievements.length > 0 && (
                <div className="pt-6 border-t border-gray-200 relative z-10">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Achievements</h3>
                    <div className="flex items-center gap-3 flex-wrap">
                        {achievements.map((achievement, index) => (
                            <AchievementBadge
                                key={achievement.id}
                                achievement={achievement}
                                index={index}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
