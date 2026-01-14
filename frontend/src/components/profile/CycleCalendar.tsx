"use client";

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CycleCalendarProps {
    tpias: any[];
}

export function CycleCalendar({ tpias }: CycleCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const getEventsForDay = (day: number) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        return tpias.filter(t => {
            // Mock logic: assume nextCycleDate is available, or use a pseudo-random stable date for demo
            if (t.nextCycleDate) {
                const cycleDate = new Date(t.nextCycleDate);
                return cycleDate.getDate() === day &&
                    cycleDate.getMonth() === currentDate.getMonth() &&
                    cycleDate.getFullYear() === currentDate.getFullYear();
            }
            return false;
        });
    };

    const renderCalendarGrid = () => {
        const grid = [];
        // Empty cells for previous month
        for (let i = 0; i < firstDayOfMonth; i++) {
            grid.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
        }

        // Days of current month
        for (let day = 1; day <= daysInMonth; day++) {
            const events = getEventsForDay(day);
            const isToday = day === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear();

            const hasEvents = events.length > 0;

            grid.push(
                <div key={day} className="h-10 w-10 flex flex-col items-center justify-center relative">
                    <button
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors
                            ${isToday
                                ? 'bg-gray-900 text-white font-semibold'
                                : hasEvents
                                    ? 'bg-amber-50 text-amber-900 font-medium hover:bg-amber-100'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        {day}
                    </button>

                    {/* Event Dots */}
                    {hasEvents && (
                        <div className="absolute bottom-1 flex gap-0.5">
                            {events.slice(0, 3).map((e, i) => ( // Max 3 dots
                                <div key={i} className="w-1 h-1 rounded-full bg-amber-500 mt-0.5"></div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        return grid;
    };

    return (
        <div className="w-full">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900 text-base">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <div className="flex gap-1">
                    <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors border border-gray-200">
                        <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors border border-gray-200">
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Days Header */}
            <div className="grid mb-2 place-items-center" style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, i) => (
                    <div key={i} className="text-[0.8rem] font-medium text-gray-500 h-10 w-10 flex items-center justify-center">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid place-items-center gap-y-1" style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
                {renderCalendarGrid()}
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center gap-4 text-xs text-gray-500 justify-center pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span>Cycle Event</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-gray-900"></div>
                    <span>Today</span>
                </div>
            </div>
        </div>
    );
}
