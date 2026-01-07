'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import Image from "next/image"

export function DonationDialog({ variant = 'default' }: { variant?: 'default' | 'mobile' }) {
    const { t } = useLanguage()
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size={variant === 'mobile' ? 'default' : 'sm'}
                    className={variant === 'mobile'
                        ? "w-full justify-start text-base font-medium px-2 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20"
                        : "text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 mr-2"
                    }
                >
                    <Heart className={variant === 'mobile' ? "w-4 h-4 mr-2 text-red-500" : "w-4 h-4 mr-2"} />
                    <span className={variant === 'mobile' ? "" : "hidden lg:inline"}>
                        {t('donation.button_label')}
                    </span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t('donation.dialog_title')}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center space-y-6 py-4">
                    <DialogDescription className="text-center text-muted-foreground">
                        {t('donation.dialog_desc')}
                    </DialogDescription>

                    <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700">
                        <Image
                            src="/QR_code_paypal_pool.png"
                            alt="PayPal Pool QR Code"
                            width={200}
                            height={200}
                            className="w-48 h-48"
                        />
                    </div>

                    <Button asChild className="w-full sm:w-auto" size="lg">
                        <a
                            href="https://www.paypal.com/pool/9lxn4Sh3sl?sr=wccr"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {t('donation.open_paypal')}
                        </a>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
