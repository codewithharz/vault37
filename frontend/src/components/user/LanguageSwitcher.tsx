"use client";

import { useLocale } from "next-intl";
import { routing, usePathname, useRouter } from "@/i18n/navigation";
import { Languages } from "lucide-react";
import { Button } from "../ui/Button";
import { useState, useRef, useEffect } from "react";

export function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' }
    ];

    const currentLanguage = languages.find(l => l.code === locale) || languages[0];

    const switchLanguage = (newLocale: string) => {
        router.replace(pathname, { locale: newLocale as any });
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-2 hover:bg-gray-100"
            >
                <Languages className="h-5 w-5 text-gray-500" />
                <span className="text-xs font-bold uppercase text-gray-600">{locale}</span>
            </Button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-xl bg-white p-2 shadow-xl ring-1 ring-black ring-opacity-5 z-50">
                    <div className="space-y-1">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => switchLanguage(lang.code)}
                                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${locale === lang.code
                                        ? "bg-amber-50 text-amber-700 font-bold"
                                        : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                <span className="text-lg">{lang.flag}</span>
                                <span>{lang.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
