"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, Share2, PartyPopper } from "lucide-react";
import { Button } from "../ui/Button";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Modal } from "../ui/Modal";

interface PaymentSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: string;
    reference: string;
}

export function PaymentSuccessModal({ isOpen, onClose, amount, reference }: PaymentSuccessModalProps) {
    const t = useTranslations("Success");
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => setShowContent(true), 400);
            return () => clearTimeout(timer);
        } else {
            setShowContent(false);
        }
    }, [isOpen]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title=""
            className="max-w-md overflow-hidden p-0 border-none bg-transparent shadow-none"
        >
            <div className="relative bg-white rounded-3xl overflow-hidden pt-12 pb-8 px-6 text-center">
                {/* Background Decoration */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-b from-green-50 to-white -z-10" />

                {/* Animated Checkmark Circle */}
                <div className="relative mx-auto w-24 h-24 mb-8">
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                            delay: 0.1
                        }}
                        className="absolute inset-0 bg-green-500 rounded-full shadow-[0_0_40px_-5px_rgba(34,197,94,0.4)]"
                    />
                    <motion.div
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3, ease: "easeInOut" }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <Check className="w-12 h-12 text-white stroke-[4px]" />
                    </motion.div>

                    {/* Floating Particles */}
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ scale: 0, x: 0, y: 0 }}
                            animate={{
                                scale: [0, 1, 0],
                                x: Math.cos(i * 60 * (Math.PI / 180)) * 60,
                                y: Math.sin(i * 60 * (Math.PI / 180)) * 60,
                            }}
                            transition={{
                                duration: 1.5,
                                delay: 0.5,
                                repeat: Infinity,
                                repeatDelay: 1
                            }}
                            className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full bg-green-400/40"
                        />
                    ))}
                </div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-2 mb-8"
                >
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">{t('paymentTitle')}</h2>
                    <p className="text-sm text-gray-500 px-4 leading-relaxed">
                        {t('paymentDesc')}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gray-50 rounded-2xl p-5 mb-8 border border-gray-100"
                >
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200/60">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('amount')}</span>
                        <span className="text-xl font-black text-gray-900">₦{Number(amount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('reference')}</span>
                        <span className="text-[11px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                            {reference}
                        </span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="space-y-3"
                >
                    <Button
                        onClick={onClose}
                        className="w-full h-12 bg-gray-900 text-white hover:bg-black rounded-xl font-bold shadow-xl shadow-gray-200 transition-all active:scale-[0.98]"
                    >
                        {t('done')}
                    </Button>
                    <button className="text-xs font-bold text-gray-400 hover:text-gray-600 flex items-center gap-1.5 mx-auto transition-colors">
                        <Share2 className="w-3 h-3" />
                        Share Receipt
                    </button>
                </motion.div>
            </div>
        </Modal>
    );
}
