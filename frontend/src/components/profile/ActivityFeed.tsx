import { useState, useEffect } from "react";
import { Activity } from "lucide-react";
import api from "@/lib/api";
import { ActivityItem } from "./ActivityItem";
import { EmptyState } from "./EmptyStates";
import { ListSkeleton } from "./Skeletons";

interface ActivityItemType {
    type: string;
    description: string;
    amount: number;
    timestamp: Date;
    metadata?: any;
}

export function ActivityFeed() {
    const [activities, setActivities] = useState<ActivityItemType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                const response = await api.get('/users/activity?limit=10');
                setActivities(response.data.data.activities || []);
            } catch (error) {
                console.error("Failed to fetch activity", error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivity();
    }, []);

    if (loading) {
        return <ListSkeleton />;
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-50 rounded-lg">
                    <Activity className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>

            {activities.length === 0 ? (
                <EmptyState type="transactions" description="No recent activity found on your account." />
            ) : (
                <div className="space-y-3">
                    {activities.map((activity, index) => (
                        <ActivityItem key={index} activity={activity} />
                    ))}
                </div>
            )}
        </div>
    );
}
