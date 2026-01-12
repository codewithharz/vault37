import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Inter, Outfit } from "next/font/google";
import "../globals.css";
import { notFound } from 'next/navigation';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

import { Toaster } from 'sonner';

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    // Ensure that the incoming `locale` is valid
    if (!['en', 'fr'].includes(locale)) {
        notFound();
    }

    // Providing all messages to the client
    // side is the easiest way to get started
    const messages = await getMessages();

    return (
        <html lang={locale}>
            <body className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-background text-foreground`}>
                <NextIntlClientProvider messages={messages}>
                    <AuthProvider>
                        {children}
                        <Toaster position="top-right" richColors />
                    </AuthProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
