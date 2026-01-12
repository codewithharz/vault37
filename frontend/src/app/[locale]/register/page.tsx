"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link, useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import api from '@/lib/api';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertCircle } from 'lucide-react';

export default function RegisterPage() {
    const t = useTranslations('Auth');
    const { login } = useAuth();
    const router = useRouter();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (password !== confirmPassword) {
            setError(t('passwordMismatch') || 'Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const response = await api.post('/auth/register', {
                fullName,
                email,
                phone,
                password,
                confirmPassword
            });
            const { tokens, user } = response.data.data;

            login(tokens.accessToken, user);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || t('error') || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('registerTitle')}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t('registerSubtitle')}</p>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('nameLabel') || 'Full Name'}
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('emailLabel')}
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                placeholder="name@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('phoneLabel') || 'Phone Number'}
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                placeholder="08012345678"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('passwordLabel')}
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t('confirmPasswordLabel') || 'Confirm Password'}
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                placeholder="••••••••"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? t('creatingAccount') : t('registerButton')}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                            {t('loginLink')}
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
