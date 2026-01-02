'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Loader2, Mail } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const supabase = createClient()

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        })

        if (error) {
            setError(error.message)
        } else {
            setSuccess(true)
        }
        setLoading(false)
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center px-6 lg:px-16 bg-white dark:bg-background">
            <div className="max-w-md w-full space-y-8">
                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                        Forgot <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#60A5FA] to-[#3B82F6]">
                            your password?
                        </span>
                    </h1>
                    <p className="text-muted-foreground text-base">
                        No worries, we&apos;ll send you reset instructions.
                    </p>
                </div>

                {!success ? (
                    <form onSubmit={handleReset} className="space-y-4">
                        <div className="space-y-1 text-left">
                            <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="jane@example.com"
                                className="bg-muted/30 border-muted-foreground/20 h-11 rounded-xl focus:ring-2 focus:ring-blue-400/20"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-3 text-xs text-red-600 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-900/20">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-11 text-sm font-semibold bg-[#60A5FA] hover:bg-[#3B82F6] text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/20 rounded-full transition-all active:scale-[0.98]"
                            disabled={loading}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Reset Password
                        </Button>

                        <div className="text-center pt-2">
                            <Link
                                href="/login"
                                className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
                            >
                                <ArrowLeft className="mr-2 h-3 w-3 transition-transform group-hover:-translate-x-1" />
                                Back to login
                            </Link>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-6 text-center animate-in fade-in zoom-in duration-300">
                        <div className="mx-auto w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-500">
                            <Mail className="h-8 w-8" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold">Check your email</h3>
                            <p className="text-sm text-muted-foreground">
                                We&apos;ve sent password reset instructions to <br />
                                <span className="font-semibold text-foreground">{email}</span>
                            </p>
                        </div>
                        <Button variant="outline" className="w-full rounded-full h-11" asChild>
                            <Link href="/login">Return to Login</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
