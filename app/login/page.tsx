'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowRight, Loader2, Shield } from 'lucide-react'
import Link from 'next/link'
import { useUpload } from '@/components/providers/upload-provider'
import { useLanguage } from '@/components/providers/language-provider'
import { loginSchema } from '@/lib/validation/auth'

export default function LoginPage() {
    const { t } = useLanguage()
    const { pendingUpload } = useUpload()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleSignIn = async () => {
        setLoading(true)
        setError(null)

        const result = loginSchema.safeParse({ email, password })
        if (!result.success) {
            setError(result.error.issues[0].message)
            setLoading(false)
            return
        }

        const { data } = result

        const { error } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
        })
        if (error) {
            // Check if error suggests invalid credentials (could be "User not found" masked)
            if (error.message.includes("Invalid login credentials")) {
                setError(t('auth.login.error_invalid'))
            } else {
                setError(error.message)
            }
        } else {
            if (pendingUpload) {
                router.push('/upload')
            } else {
                router.push('/dashboard')
            }
            router.refresh()
        }
        setLoading(false)
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
            <div className="flex-1 flex flex-col justify-center px-6 lg:px-16 py-4 bg-white dark:bg-background overflow-y-auto">
                <div className="max-w-md w-full mx-auto space-y-4">
                    <div className="space-y-2">
                        <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
                            {t('auth.login.title_start')} <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#60A5FA] to-[#3B82F6]">
                                {t('auth.login.title_highlight')}
                            </span>
                        </h1>
                        <p className="text-muted-foreground italic mb-4">&quot;{t('auth.login.testimonial.quote')}&quot;</p>
                        <p className="text-muted-foreground text-base">
                            {t('auth.login.subtitle')}
                        </p>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); handleSignIn() }} className="space-y-3">
                        <div className="space-y-1">
                            <Label htmlFor="email" className="text-xs font-medium">{t('auth.common.email')}</Label>
                            <Input
                                id="email" type="email" placeholder={t('auth.common.placeholder_email')} className="bg-muted/30 border-muted-foreground/20 h-10"
                                value={email} onChange={e => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" title='Password' className="text-xs font-medium">{t('auth.common.password')}</Label>
                                <Link
                                    href="/forgot-password"
                                    className="text-[10px] font-semibold text-muted-foreground hover:text-primary transition-colors"
                                >
                                    {t('auth.login.forgot_password')}
                                </Link>
                            </div>
                            <Input
                                id="password" type="password" placeholder={t('auth.common.placeholder_password')} className="bg-muted/30 border-muted-foreground/20 h-10"
                                value={password} onChange={e => setPassword(e.target.value)}
                            />
                        </div>

                        {error && (
                            <div className="p-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/10 rounded-md border border-red-200 dark:border-red-900/20">
                                {error}
                                {/* Smart Redirect suggestion */}
                                {error.includes("sign up") && (
                                    <div className="mt-2 text-center">
                                        <Button variant="link" size="sm" asChild className="text-[#3B82F6] h-auto p-0">
                                            <Link href="/signup">{t('auth.login.button_create')} &rarr;</Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-10 text-sm font-semibold bg-[#60A5FA] hover:bg-[#3B82F6] text-white shadow-md shadow-blue-200 dark:shadow-blue-900/20 rounded-full transition-all hover:scale-[1.01]"
                            disabled={loading}
                        >
                            {loading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                            {t('auth.login.button_signin')}
                            {!loading && <ArrowRight className="ml-2 h-3 w-3" />}
                        </Button>
                    </form>

                    <div className="text-center pt-1">
                        <p className="text-xs text-muted-foreground">
                            {t('auth.login.no_account')}{' '}
                            <Link href="/signup" className="font-semibold text-foreground underline hover:text-primary transition-colors">
                                {t('auth.login.button_create')}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            <div className="hidden lg:block lg:flex-1 relative bg-gradient-to-br from-gray-900 to-black overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                <div className="relative h-full flex items-center justify-center p-12">
                    <div className="max-w-md bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-500/20 rounded-full text-green-400">
                                <Shield className="h-5 w-5" />
                            </div>
                            <span className="font-semibold tracking-wide text-sm uppercase">{t('auth.common.privacy_guaranteed')}</span>
                        </div>
                        <h3 className="text-xl font-bold mb-4 leading-relaxed">
                            &quot;{t('auth.common.privacy_quote')}&quot;
                        </h3>
                        <div className="h-1 w-20 bg-[#F59E0B] rounded-full mt-6"></div>
                    </div>
                </div>
            </div>
        </div >
    )
}
