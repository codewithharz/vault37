"use client";

import { Calendar, AlertCircle, Clock } from "lucide-react";

interface UpcomingEventsProps {
    tpias: any[];
}

export function UpcomingEvents({ tpias }: UpcomingEventsProps) {
    // Filter and sort upcoming events
    const events = tpias
        .filter(t => t.status === 'active' || t.status === 'cycling')
        .map(t => {
            // Calculate next meaningful date (mock logic for now if nextCycleDate missing)
            const nextDate = t.nextCycleDate ? new Date(t.nextCycleDate) : new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000);
            return {
                id: t._id,
                type: 'Cycle Completion',
                name: `${t.commodity} TPIA`,
                date: nextDate,
                daysRemaining: Math.ceil((nextDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
                isUrgent: false
            };
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(0, 5); // Show next 5 events

    if (events.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl border border-gray-100 h-full">
                <Calendar className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-gray-500 font-medium">No upcoming events</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {events.map((event, index) => (
                <div key={event.id || index} className="flex items-center gap-4 p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className={`p-3 rounded-lg flex-shrink-0 ${event.daysRemaining <= 3 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                        <Clock className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{event.name}</p>
                        <p className="text-xs text-gray-500 block truncate">
                            {event.type} • {event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                        <span className={`text-sm font-bold ${event.daysRemaining <= 3 ? 'text-red-600' : 'text-gray-900'
                            }`}>
                            {event.daysRemaining} days
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
