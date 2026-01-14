export function ProfileHeroSkeleton() {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div className="space-y-4 flex-1 w-full">
                    <div className="space-y-2">
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ChartSkeleton() {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse h-80">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="flex items-end gap-2 h-60">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div key={i} className="bg-gray-100 rounded-t w-full" style={{ height: `${Math.random() * 100}%` }}></div>
                ))}
            </div>
        </div>
    );
}

export function ListSkeleton() {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function CardGridSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 h-48 space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                        </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full w-full"></div>
                    <div className="h-10 bg-gray-100 rounded-lg w-full"></div>
                </div>
            ))}
        </div>
    );
}
