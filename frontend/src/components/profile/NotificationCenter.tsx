"use client";

import { useState } from "react";
import { Bell, CheckCircle, AlertCircle, Info } from "lucide-react";
import { EmptyState } from "./EmptyStates";

export function NotificationCenter() {
    // Mock notifications for now
    const [notifications, setNotifications] = useState([
        { id: 1, type: 'success', title: 'Cycle Completed', message: 'Your Agro TPIA (Cycle 2) has completed successfully.', date: '2h ago', read: false },
        { id: 2, type: 'info', title: 'New Feature', message: 'Check out the new cycle calendar in your profile.', date: '1d ago', read: true },
        { id: 3, type: 'alert', title: 'Action Required', message: 'Please update your KYC documents to continue investing.', date: '2d ago', read: true },
    ]);

    const markAsRead = (id: number) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-5 h-5 text-emerald-600" />;
            case 'alert': return <AlertCircle className="w-5 h-5 text-red-600" />;
            default: return <Info className="w-5 h-5 text-blue-600" />;
        }
    };

    const [filter, setFilter] = useState('all');

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !n.read;
        return n.type === filter;
    });

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                {/* ... header ... */}
            </div>

            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {['all', 'unread', 'success', 'info', 'alert'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${filter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {filteredNotifications.length === 0 ? (
                <EmptyState type="notifications" />
            ) : (
                <div className="space-y-2">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`p-4 rounded-lg border transition-all ${notification.read
                                ? 'bg-white border-transparent'
                                : 'bg-blue-50/30 border-blue-100'
                                }`}
                        >
                            <div className="flex gap-3">
                                <div className="mt-0.5">{getIcon(notification.type)}</div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <p className={`text-sm font-medium ${notification.read ? 'text-gray-900' : 'text-blue-900'}`}>
                                            {notification.title}
                                        </p>
                                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                            {notification.date}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {notification.message}
                                    </p>
                                    {!notification.read && (
                                        <button
                                            onClick={() => markAsRead(notification.id)}
                                            className="text-xs font-medium text-blue-600 mt-2 hover:underline"
                                        >
                                            Mark as read
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
