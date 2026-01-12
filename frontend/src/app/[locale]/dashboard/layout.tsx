"use client";

import { UserHeader } from "@/components/user/UserHeader";
import { UserSidebar } from "@/components/user/UserSidebar";
import { ReactNode, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "@/i18n/navigation";
import { useStore } from "@/store/useStore";

export default function UserLayout({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    const { fetchProfile, fetchWallet } = useStore();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        } else if (isAuthenticated) {
            fetchProfile();
            fetchWallet();
        }
    }, [isAuthenticated, isLoading, router, fetchProfile, fetchWallet]);

    if (isLoading) {
        return <div className="h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
    }

    if (!isAuthenticated) {
        return null; // Prevents flashing content while redirecting
    }

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <UserSidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <UserHeader />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="mx-auto max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
