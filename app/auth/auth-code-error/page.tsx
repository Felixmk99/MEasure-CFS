'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle, ArrowLeft, Mail } from 'lucide-react'
import { useLanguage } from '@/components/providers/language-provider'

export default function AuthCodeError() {
    const { t } = useLanguage()

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6 text-center">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-8">
                <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>

            <h1 className="text-3xl font-bold tracking-tight mb-4">
                Login Link Expired
            </h1>

            <p className="text-muted-foreground text-lg max-w-md mb-8">
                It looks like this confirmation link has already been used or has expired. For security, each link can only be used once.
            </p>

            <div className="grid gap-4 w-full max-w-xs">
                <Button asChild className="rounded-full h-12 text-base font-semibold">
                    <Link href="/login">
                        Try Logging In
                    </Link>
                </Button>

                <Button asChild variant="outline" className="rounded-full h-12 text-base font-semibold">
                    <Link href="/">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </Link>
                </Button>
            </div>

            <div className="mt-12 p-6 bg-zinc-50 dark:bg-zinc-900 rounded-3xl max-w-md border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3 mb-3 text-sm font-bold uppercase tracking-tight text-[#3B82F6]">
                    <Mail className="w-4 h-4" />
                    Need help?
                </div>
                <p className="text-sm text-left text-muted-foreground leading-relaxed">
                    If you haven't logged in yet, try requesting a new link by entering your email at the login or signup page again. If the issue persists, feel free to contact us.
                </p>
            </div>
        </div>
    )
}
