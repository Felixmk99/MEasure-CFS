'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowRight, Loader2, Shield, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useUpload } from '@/components/providers/upload-provider'
import { Info } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { useLanguage } from '@/components/providers/language-provider'
import { signupSchema } from '@/lib/validation/auth'

export default function SignupPage() {
    const { t } = useLanguage()
    const { pendingUpload } = useUpload()
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [agreeTerms, setAgreeTerms] = useState(false)
    const [agreeHealth, setAgreeHealth] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const handleSignUp = async () => {
        setLoading(true)
        setError(null)

        // Validate with Zod
        const result = signupSchema.safeParse({
            firstName,
            lastName,
            email,
            password,
            agreeTerms,
            agreeHealth
        })

        if (!result.success) {
            const firstError = result.error.issues[0].message
            setError(firstError)
            setLoading(false)
            return
        }

        const { data } = result

        const { error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                emailRedirectTo: `${location.origin}/auth/callback`,
                data: {
                    first_name: data.firstName,
                    last_name: data.lastName,
                    consent_terms_at: new Date().toISOString(),
                    consent_health_data_at: new Date().toISOString()
                }
            },
        })
        if (error) {
            if (error.message.includes("already registered")) {
                setError(t('auth.signup.error_exists'))
            } else {
                setError(error.message)
            }
        }
        else {
            if (pendingUpload) {
                setError(t('auth.signup.success_pending'))
            } else {
                setError(t('auth.signup.success_confirm'))
            }
        }
        setLoading(false)
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
            <div className="flex-1 flex flex-col justify-start lg:justify-center px-6 lg:px-16 py-4 bg-white dark:bg-background overflow-y-auto">
                <div className="max-w-md w-full mx-auto space-y-3">
                    <div className="space-y-1">
                        <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
                            {t('auth.signup.title_start')} <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#60A5FA] to-[#3B82F6]">
                                {t('auth.signup.title_highlight')}
                            </span>
                        </h1>
                        <p className="text-muted-foreground italic mb-4">&quot;{t('auth.login.testimonial.quote')}&quot;</p>
                    </div>

                    <div className="space-y-2.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="firstName" className="text-xs font-medium">{t('auth.signup.first_name')}</Label>
                                <Input
                                    id="firstName" placeholder={t('auth.signup.placeholder_first_name')} className="bg-muted/30 border-muted-foreground/20 h-10"
                                    value={firstName} onChange={e => setFirstName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="lastName" className="text-xs font-medium">{t('auth.signup.last_name')}</Label>
                                <Input
                                    id="lastName" placeholder={t('auth.signup.placeholder_last_name')} className="bg-muted/30 border-muted-foreground/20 h-10"
                                    value={lastName} onChange={e => setLastName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="email" className="text-xs font-medium">{t('auth.common.email')}</Label>
                            <Input
                                id="email" type="email" placeholder={t('auth.common.placeholder_email')} className="bg-muted/30 border-muted-foreground/20 h-10"
                                value={email} onChange={e => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="password" className="text-xs font-medium">{t('auth.common.password')}</Label>
                            <Input
                                id="password" type="password" placeholder={t('auth.common.placeholder_password')} className="bg-muted/30 border-muted-foreground/20 h-10"
                                value={password} onChange={e => setPassword(e.target.value)}
                            />
                            <p className="text-[10px] text-muted-foreground">{t('auth.signup.password_hint')}</p>
                        </div>

                        {/* Legal Selection */}
                        <div className="space-y-2">
                            <div className="flex items-start space-x-3">
                                <Checkbox
                                    id="terms"
                                    checked={agreeTerms}
                                    onCheckedChange={setAgreeTerms}
                                />
                                <div className="grid gap-1.5 leading-none">
                                    <Label htmlFor="terms" className="text-xs font-normal text-muted-foreground cursor-pointer leading-relaxed">
                                        {t('legal.agree_terms_privacy')}
                                        <div className="flex gap-2 mt-1">
                                            <Link href="/terms" target="_blank" className="text-blue-500 hover:underline">{t('legal.terms')}</Link>
                                            <Link href="/privacy" target="_blank" className="text-blue-500 hover:underline">{t('legal.privacy')}</Link>
                                        </div>
                                    </Label>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <Checkbox
                                    id="health"
                                    checked={agreeHealth}
                                    onCheckedChange={setAgreeHealth}
                                />
                                <div className="grid gap-1.5 leading-none">
                                    <Label htmlFor="health" className="text-xs font-normal text-muted-foreground cursor-pointer leading-relaxed">
                                        {t('legal.agree_health_data')}
                                    </Label>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/10 rounded-md border border-red-200 dark:border-red-900/20">
                                {error}
                            </div>
                        )}

                        <Button
                            className="w-full h-10 text-sm font-semibold bg-[#60A5FA] hover:bg-[#3B82F6] text-white shadow-md shadow-blue-200 dark:shadow-blue-900/20 rounded-full transition-all hover:scale-[1.01]"
                            onClick={handleSignUp}
                            disabled={loading}
                        >
                            {loading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                            {t('auth.signup.button_create')}
                            {!loading && <ArrowRight className="ml-2 h-3 w-3" />}
                        </Button>

                        <div className="text-center pt-1">
                            <p className="text-xs text-muted-foreground">
                                {t('auth.signup.already_have_account')}{' '}
                                <Link href="/login" className="font-semibold text-foreground underline hover:text-primary transition-colors">
                                    {t('auth.signup.button_login')}
                                </Link>
                            </p>
                        </div>
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
                        <div className="h-1 w-20 bg-[#F59E0B] rounded-full my-6"></div>

                        <div className="grid gap-4 mt-8 opacity-80">
                            <div className="flex items-start gap-3">
                                <div className="p-1.5 bg-white/10 rounded-lg text-white">
                                    <TrendingUp className="h-4 w-4" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm">{t('auth.signup.feature_baseline_title')}</h4>
                                    <p className="text-xs text-white/60">{t('auth.signup.feature_baseline_desc')}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-1.5 bg-white/10 rounded-lg text-white">
                                    <Shield className="h-4 w-4" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm">{t('auth.signup.feature_design_title')}</h4>
                                    <p className="text-xs text-white/60">{t('auth.signup.feature_design_desc')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-2">
                            <Info className="w-4 h-4 text-amber-400 shrink-0" />
                            <span className="text-[11px] font-black uppercase tracking-widest text-white/90">
                                {t('legal.not_medical_product')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
