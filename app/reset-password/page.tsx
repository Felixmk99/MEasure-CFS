'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    // Ensure session exists (Supabase handles the token-to-session conversion automatically on the redirect)
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                // If no session, the link might be expired or invalid
                // But we show the form anyway, and Supabase will error on update if invalid
            }
        }
        checkSession()
    }, [supabase])

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters")
            return
        }

        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.updateUser({
            password: password
        })

        if (error) {
            setError(error.message)
        } else {
            setSuccess(true)
            // Redirect after a short delay
            setTimeout(() => {
                router.push('/login')
            }, 3000)
        }
        setLoading(false)
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center px-6 lg:px-16 bg-white dark:bg-background text-foreground">
            <div className="max-w-md w-full space-y-8">
                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-extrabold tracking-tight">
                        Set new <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#60A5FA] to-[#3B82F6]">
                            password
                        </span>
                    </h1>
                    <p className="text-muted-foreground text-base">
                        Your new password must be different from previous ones.
                    </p>
                </div>

                {!success ? (
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div className="space-y-1 text-left">
                            <Label htmlFor="password" title='Password' className="text-xs font-medium uppercase tracking-wider text-muted-foreground">New Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="bg-muted/30 border-muted-foreground/20 h-11 rounded-xl"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-1 text-left">
                            <Label htmlFor="confirmPassword" title='Confirm' className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Confirm New Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                className="bg-muted/30 border-muted-foreground/20 h-11 rounded-xl"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
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
                            className="w-full h-11 text-sm font-semibold bg-[#60A5FA] hover:bg-[#3B82F6] text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/20 rounded-full transition-all"
                            disabled={loading}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Password
                        </Button>
                    </form>
                ) : (
                    <div className="space-y-6 text-center animate-in fade-in zoom-in duration-300">
                        <div className="mx-auto w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-500">
                            <CheckCircle2 className="h-8 w-8" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold">Password updated</h3>
                            <p className="text-sm text-muted-foreground">
                                You can now log in with your new password. Redirecting to login page...
                            </p>
                        </div>
                        <Button variant="outline" className="w-full rounded-full h-11" asChild>
                            <Link href="/login">Return to Login Now</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
