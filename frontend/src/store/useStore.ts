import { create } from 'zustand';
import api from '@/lib/api';

interface User {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    role: string;
    kycStatus: string;
    mode: string;
}

interface BankAccount {
    _id: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
    isDefault: boolean;
}

interface Wallet {
    balance: number;
    earningsBalance: number;
    lockedBalance: number;
    pendingWithdrawalBalance: number;
    availableBalance: number;
    totalBalance: number;
    bankAccounts: BankAccount[];
}

interface AppState {
    user: User | null;
    wallet: Wallet | null;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    setWallet: (wallet: Wallet | null) => void;
    fetchProfile: () => Promise<void>;
    fetchWallet: () => Promise<void>;
}

export const useStore = create<AppState>((set) => ({
    user: null,
    wallet: null,
    isLoading: false,
    setUser: (user) => set({ user }),
    setWallet: (wallet) => set({ wallet }),
    fetchProfile: async () => {
        try {
            const response = await api.get('/auth/me');
            if (response.data.success) {
                set({ user: response.data.data });
            }
        } catch (error) {
            console.error('Failed to fetch profile', error);
        }
    },
    fetchWallet: async () => {
        try {
            const response = await api.get('/wallet');
            if (response.data.success) {
                set({ wallet: response.data.data.wallet });
            }
        } catch (error) {
            console.error('Failed to fetch wallet', error);
        }
    }
}));
