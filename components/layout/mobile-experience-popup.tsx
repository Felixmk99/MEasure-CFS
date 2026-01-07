'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Laptop } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/components/providers/language-provider'
import Image from 'next/image'

export function MobileExperiencePopup() {
    const [isOpen, setIsOpen] = useState(false)
    const { t } = useLanguage()

    useEffect(() => {
        // 1. Check if we are on mobile (< 768px matches our 'md' breakpoint typically, or use a specific mobile width)
        const isMobile = window.innerWidth < 768

        // 2. Check if user has seen this before
        const hasSeenHint = localStorage.getItem('hasSeenDesktopHint')

        if (isMobile && !hasSeenHint) {
            // 3. Wait 4 seconds before showing
            const timer = setTimeout(() => {
                setIsOpen(true)
                // Mark as seen immediately so it doesn't show again on refresh even if they don't close it explicitly
                localStorage.setItem('hasSeenDesktopHint', 'true')
            }, 4000)

            return () => clearTimeout(timer)
        }
    }, [])

    const handleClose = () => {
        setIsOpen(false)
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
                    />

                    {/* Popup */}
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-4 left-4 right-4 z-[61] sm:max-w-sm sm:mx-auto sm:bottom-8"
                    >
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 relative overflow-hidden">
                            {/* Decorative Background Elements */}
                            <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                                {/* Logo / Icon */}
                                <div className="w-16 h-16 relative bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 flex items-center justify-center mb-1">
                                    <Image
                                        src="/branding/icon-only.png"
                                        alt="MEasure-CFS"
                                        width={40}
                                        height={40}
                                        className="object-contain"
                                    />
                                    <div className="absolute -bottom-2 -right-2 bg-primary text-white p-1.5 rounded-full shadow-sm">
                                        <Laptop className="w-3 h-3" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="font-bold text-xl tracking-tight">
                                        {t('mobile_popup.title')}
                                    </h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {t('mobile_popup.description')}
                                    </p>
                                </div>

                                <Button
                                    onClick={handleClose}
                                    className="w-full rounded-xl h-11 font-medium shadow-lg shadow-primary/20"
                                >
                                    {t('mobile_popup.close')}
                                </Button>
                            </div>

                            {/* Close X Top Right */}
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
