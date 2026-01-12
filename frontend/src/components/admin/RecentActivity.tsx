"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { User, ShoppingCart, AlertCircle, CheckCircle, Clock, XCircle, FileText, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";

export interface ActivityItem {
    type: 'user' | 'payment' | 'withdrawal' | 'order';
    timestamp: string;
    data: any;
}

import { useTranslations } from "next-intl";

export function RecentActivity({ activities = [] }: { activities?: ActivityItem[] }) {
    const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
    const t = useTranslations("AdminActivity");
    const tCommon = useTranslations("Common");

    if (!activities.length) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <h3 className="text-lg font-medium text-gray-900">{t('title')}</h3>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <AlertCircle className="h-10 w-10 mb-2 opacity-20" />
                    <p>{t('noActivity')}</p>
                </CardContent>
            </Card>
        );
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'user': return { icon: User, color: 'bg-blue-100 text-blue-600' };
            case 'payment': return { icon: ArrowDownLeft, color: 'bg-green-100 text-green-600' };
            case 'withdrawal': return { icon: ArrowUpRight, color: 'bg-orange-100 text-orange-600' };
            case 'order': return { icon: ShoppingCart, color: 'bg-purple-100 text-purple-600' };
            default: return { icon: AlertCircle, color: 'bg-gray-100 text-gray-600' };
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return t('justNow');
        if (diffInMinutes < 60) return t('minutesAgo', { minutes: diffInMinutes });
        if (diffInMinutes < 1440) return t('hoursAgo', { hours: Math.floor(diffInMinutes / 60) });
        return date.toLocaleDateString();
    }

    const renderModalContent = (activity: ActivityItem) => {
        const { type, data, timestamp } = activity;

        const DetailRow = ({ label, value, className = "" }: any) => (
            <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-gray-500 text-sm">{label}</span>
                <span className={`font-medium text-gray-900 text-sm ${className}`}>{value || 'N/A'}</span>
            </div>
        );

        return (
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col items-center text-center pb-4 border-b border-gray-100">
                    <div className={`p-3 rounded-full mb-3 ${getIcon(type).color}`}>
                        {(() => { const Icon = getIcon(type).icon; return <Icon className="w-8 h-8" />; })()}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 capitalize">
                        {type === 'user' ? t('newUserRegistration') :
                            type === 'payment' ? t('depositReceived') :
                                type === 'withdrawal' ? t('withdrawalRequest') : t('tpiaPurchase')}
                    </h3>
                    <p className="text-sm text-gray-500">{new Date(timestamp).toLocaleString()}</p>
                </div>

                {/* Details Section */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-1">
                    {type === 'user' && (
                        <>
                            <DetailRow label={t('details.fullName')} value={data.username} />
                            <DetailRow label={t('details.email')} value={data.email} />
                            <DetailRow label={t('details.phone')} value={data.phone} />
                            <DetailRow label={t('details.kycStatus')} value={data.kycStatus} className="capitalize" />
                        </>
                    )}

                    {type === 'payment' && (
                        <>
                            <DetailRow label={t('details.user')} value={data.username} />
                            <DetailRow label={t('details.email')} value={data.userEmail} />
                            <DetailRow label={t('details.amount')} value={`₦${data.amount?.toLocaleString()}`} className="text-green-600 font-bold" />
                            <DetailRow label={t('details.reference')} value={data.reference} className="font-mono text-xs" />
                            <DetailRow label={t('details.status')} value={data.status} className="uppercase" />
                            <DetailRow label={t('details.provider')} value={data.provider} />
                        </>
                    )}

                    {type === 'withdrawal' && (
                        <>
                            <DetailRow label={t('details.user')} value={data.username} />
                            <DetailRow label={t('details.email')} value={data.userEmail} />
                            <DetailRow label={t('details.amount')} value={`₦${data.amount?.toLocaleString()}`} className="text-red-600 font-bold" />
                            <DetailRow label={t('details.status')} value={data.status} className="uppercase" />
                        </>
                    )}

                    {type === 'order' && (
                        <>
                            <DetailRow label={t('details.user')} value={data.username} />
                            <DetailRow label={t('details.commodity')} value={data.title} />
                            <DetailRow label={t('details.investment')} value={`₦${data.totalPrice?.toLocaleString()}`} className="text-purple-600 font-bold" />
                            <DetailRow label={t('details.orderNumber')} value={data.orderNumber} className="font-mono text-xs" />
                        </>
                    )}
                </div>

                <div className="flex justify-end pt-2">
                    <Button variant="outline" onClick={() => setSelectedActivity(null)}>{tCommon('close')}</Button>
                </div>
            </div>
        );
    };

    return (
        <Card className="h-full">
            <CardHeader>
                <h3 className="text-lg font-medium text-gray-900">{t('title')}</h3>
            </CardHeader>
            <CardContent>
                <div className="relative border-l border-gray-200 ml-3 space-y-6">
                    {activities.map((activity, index) => {
                        const { icon: Icon, color } = getIcon(activity.type);
                        return (
                            <div
                                key={index}
                                className="relative pl-6 cursor-pointer group"
                                onClick={() => setSelectedActivity(activity)}
                            >
                                <span className={`absolute -left-4 top-1 h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-white transition-transform group-hover:scale-110 ${color}`}>
                                    <Icon className="h-4 w-4" />
                                </span>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start group-hover:bg-gray-50 p-2 -ml-2 rounded-lg transition-colors">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {activity.type === 'user' ? t('newUserRegistration') :
                                                activity.type === 'payment' ? t('depositReceived') :
                                                    activity.type === 'withdrawal' ? t('withdrawalRequest') :
                                                        activity.type === 'order' ? t('tpiaPurchase') : tCommon('systemEvent')}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {activity.type === 'user' ? t('joinedPlatform', { name: activity.data.username }) :
                                                activity.type === 'payment' ? t('depositedAmount', { name: activity.data.username, amount: activity.data.amount?.toLocaleString() }) :
                                                    activity.type === 'withdrawal' ? t('requestedWithdrawal', { name: activity.data.username, amount: activity.data.amount?.toLocaleString() }) :
                                                        activity.type === 'order' ? t('boughtCommodity', { name: activity.data.username, title: activity.data.title }) :
                                                            JSON.stringify(activity.data)}
                                        </p>
                                    </div>
                                    <time className="text-xs text-gray-400 mt-1 sm:mt-0 whitespace-nowrap ml-2">{formatTime(activity.timestamp)}</time>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>

            <Modal
                isOpen={!!selectedActivity}
                onClose={() => setSelectedActivity(null)}
                title={t('activityDetails')}
            >
                {selectedActivity && renderModalContent(selectedActivity)}
            </Modal>
        </Card>
    );
}
