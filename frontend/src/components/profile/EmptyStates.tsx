import { Box, UserPlus, Bell, CreditCard } from "lucide-react";

interface EmptyStateProps {
    type: 'tpias' | 'referrals' | 'notifications' | 'transactions';
    title?: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function EmptyState({ type, title, description, actionLabel, onAction }: EmptyStateProps) {
    const getConfig = () => {
        switch (type) {
            case 'tpias':
                return {
                    icon: <Box className="w-12 h-12 text-gray-300" />,
                    defaultTitle: "No Active TPIAs",
                    defaultDesc: "You haven't started any cycles yet. Purchase a TPIA to start earning.",
                };
            case 'referrals':
                return {
                    icon: <UserPlus className="w-12 h-12 text-gray-300" />,
                    defaultTitle: "No Referrals Yet",
                    defaultDesc: "Invite friends to join GDIP and earn rewards when they start investing.",
                };
            case 'notifications':
                return {
                    icon: <Bell className="w-12 h-12 text-gray-300" />,
                    defaultTitle: "No Notifications",
                    defaultDesc: "You're all caught up! Check back later for updates.",
                };
            case 'transactions':
                return {
                    icon: <CreditCard className="w-12 h-12 text-gray-300" />,
                    defaultTitle: "No Transactions",
                    defaultDesc: "Your transaction history will appear here once you make a deposit or withdrawal.",
                };
        }
    };

    const config = getConfig();

    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-gray-50 rounded-xl border border-gray-100 border-dashed">
            <div className="mb-4 p-4 bg-white rounded-full shadow-sm">
                {config.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {title || config.defaultTitle}
            </h3>
            <p className="text-gray-500 max-w-sm mb-6">
                {description || config.defaultDesc}
            </p>
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
