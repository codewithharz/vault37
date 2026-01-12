import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function HomePage() {
    const t = useTranslations('Dashboard');
    const auth = useTranslations('Auth');

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Vault37 GDIP</h1>
                <p className="text-gray-600 mb-8">{t('welcome')}</p>

                <div className="space-y-4">
                    <Link
                        href="/login"
                        className="block w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
                    >
                        {auth('loginButton')}
                    </Link>

                    <Link
                        href="/dashboard"
                        className="block w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition-colors border border-gray-200"
                    >
                        User Dashboard
                    </Link>

                    <Link
                        href="/admin"
                        className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                        Admin Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
