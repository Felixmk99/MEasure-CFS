'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

import { Lock, User as UserIcon, Settings, FileText, AlertTriangle, Activity, Smartphone, ClipboardList, FileSpreadsheet } from 'lucide-react'
import { useUser } from '@/components/providers/user-provider'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useLanguage } from '@/components/providers/language-provider'

import type { User } from '@supabase/supabase-js'

export default function SettingsClient({ user }: { user: User }) {
    const { t, locale } = useLanguage()
    const supabase = createClient()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    // Form State
    const [firstName, setFirstName] = useState(user.user_metadata?.first_name || '')
    const [lastName, setLastName] = useState(user.user_metadata?.last_name || '')

    // Delete Account State
    const [deleteConfirmation, setDeleteConfirmation] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)

    // Update Profile Handler
    const handleUpdateProfile = async () => {
        setIsLoading(true)


        try {
            const { error: updateAuthError } = await supabase.auth.updateUser({
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    full_name: `${firstName} ${lastName}`.trim()
                }
            })

            if (updateAuthError) throw updateAuthError

            // Also update the 'profiles' table directly if needed, though the instruction snippet was malformed.
            // Assuming the intent was to update auth metadata, which is handled above.
            // If there was a separate 'profiles' table update intended, it would look like this:
            // const { error: updateProfileError } = await supabase
            //     .from('profiles')
            //     .update({ first_name: firstName, last_name: lastName, full_name: `${firstName} ${lastName}`.trim() })
            //     .eq('id', user.id);
            // if (updateProfileError) throw updateProfileError;


            router.refresh()
        } catch (err: unknown) {
            console.error(err)

        } finally {
            setIsLoading(false)
        }
    }

    // Delete Account Handler
    const handleDeleteAccount = async () => {
        const confirmKeyword = t('settings.delete_account.confirm_keyword')
        if (deleteConfirmation.trim().toLocaleUpperCase(locale) !== confirmKeyword.trim().toLocaleUpperCase(locale)) return
        setIsDeleting(true)

        try {
            // 1. Delete Account & Data (Server-Side Secure Wipe)
            const response = await fetch('/api/auth/delete-account', { method: 'DELETE' })
            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || t('settings.delete_account.error_fallback'))
            }

            try {
                // 3. Sign Out (only if deletion was successful)
                await supabase.auth.signOut()
                // 4. Hard redirect to home - appropriate for account deletion to reset all state
                window.location.href = '/'
            } catch (error) {
                console.error('Logout after deletion failed:', error)
                toast.error(t('settings.delete_account.signout_failed'))
                window.location.href = '/'
            }

        } catch (err: unknown) {
            const error = err as Error
            toast.error(t('settings.delete_account.error_toast', { error: error.message }))
            setIsDeleting(false)
        }
    }

    return (
        <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Navigation */}
            <aside className="w-full md:w-64 flex flex-col gap-2">
                <div className="mb-4 px-4">
                    <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
                    <p className="text-sm text-muted-foreground">{t('settings.subtitle')}</p>
                </div>

                <nav className="flex flex-col space-y-1">
                    <Button variant="secondary" className="justify-start">
                        <UserIcon className="mr-2 h-4 w-4" />
                        {t('settings.sidebar.profile')}
                    </Button>
                    <Button variant="ghost" className="justify-start" disabled>
                        <Lock className="mr-2 h-4 w-4" />
                        {t('settings.sidebar.security')} ({t('settings.sidebar.soon')})
                    </Button>
                    <Button variant="ghost" className="justify-start" disabled>
                        <Settings className="mr-2 h-4 w-4" />
                        {t('settings.sidebar.preferences')} ({t('settings.sidebar.soon')})
                    </Button>
                    <Button variant="ghost" className="justify-start" disabled>
                        <FileText className="mr-2 h-4 w-4" />
                        {t('settings.sidebar.data_export')} ({t('settings.sidebar.soon')})
                    </Button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 space-y-8">

                {/* Public Profile Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('settings.profile.title')}</CardTitle>
                        <CardDescription>{t('settings.profile.description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">


                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">{t('settings.profile.first_name')}</Label>
                                <Input
                                    id="firstName"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">{t('settings.profile.last_name')}</Label>
                                <Input
                                    id="lastName"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                            </div>
                        </div>


                    </CardContent>
                    <CardFooter className="flex justify-between border-t px-6 py-4">
                        <Button onClick={handleUpdateProfile} disabled={isLoading}>
                            {isLoading ? t('settings.profile.button_saving') : t('settings.profile.button_save')}
                        </Button>
                    </CardFooter>
                </Card>

                {/* Personal Details Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('settings.personal.title')}</CardTitle>
                        <CardDescription>{t('settings.personal.description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">{t('settings.personal.email')}</Label>
                            <Input id="email" value={user.email} disabled className="bg-muted" />
                        </div>
                    </CardContent>
                </Card>

                {/* Symptom Data Integration Card */}
                <SymptomProviderCard />

                {/* Step Data Integration Card */}
                <StepProviderCard />

                {/* Delete Account Card */}
                <Card className="border-red-200 dark:border-red-900/50 bg-red-50/10 dark:bg-red-900/10">
                    <CardHeader>
                        <CardTitle className="text-red-600 dark:text-red-400">{t('settings.delete_account.title')}</CardTitle>
                        <CardDescription>
                            {t('settings.delete_account.description')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-100 dark:border-red-900/30">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800 dark:text-red-300">{t('settings.delete_account.warning_title')}</h3>
                                    <div className="mt-2 text-sm text-red-700 dark:text-red-400">
                                        <ul className="list-disc pl-5 space-y-1">
                                            <li>{t('settings.delete_account.warning_access')}</li>
                                            <li>{t('settings.delete_account.warning_data')}</li>
                                            <li>{t('settings.delete_account.warning_recovery')}</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmDelete" className="text-sm font-medium">
                                {t('settings.delete_account.confirm_label_before')}
                                <span className="font-bold text-red-600">{t('settings.delete_account.confirm_keyword')}</span>
                                {t('settings.delete_account.confirm_label_after')}
                            </Label>
                            <Input
                                id="confirmDelete"
                                placeholder={t('settings.delete_account.confirm_keyword')}
                                value={deleteConfirmation}
                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                className="max-w-md bg-white dark:bg-zinc-950"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end border-t border-red-200 dark:border-red-900/30 px-6 py-4 bg-red-50/30 dark:bg-red-900/5">
                        <Button
                            variant="destructive"
                            onClick={handleDeleteAccount}
                            disabled={deleteConfirmation.trim().toLocaleUpperCase(locale) !== t('settings.delete_account.confirm_keyword').trim().toLocaleUpperCase(locale) || isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? t('settings.delete_account.button_deleting') : t('settings.delete_account.button_delete')}
                        </Button>
                    </CardFooter>
                </Card>

            </main>
        </div>
    )
}

function SymptomProviderCard() {
    const { t } = useLanguage()
    const { profile, updateSymptomProvider } = useUser()
    const [updating, setUpdating] = useState(false)

    const handleProviderChange = async (val: string) => {
        setUpdating(true)
        try {
            await updateSymptomProvider(val as 'visible' | 'bearable')
        } catch (error) {
            console.error(error)
        } finally {
            setUpdating(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('settings.symptom_integration.title')}</CardTitle>
                <CardDescription>{t('settings.symptom_integration.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-sm font-medium">{t('settings.symptom_integration.provider_label')}</Label>
                    <Select
                        value={profile?.symptom_provider || 'visible'}
                        onValueChange={handleProviderChange}
                        disabled={updating}
                    >
                        <SelectTrigger className="w-full md:w-[350px]">
                            <SelectValue placeholder={t('settings.symptom_integration.placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="visible">
                                <span className="flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-rose-500" /> {t('settings.symptom_integration.visible')}
                                </span>
                            </SelectItem>
                            <SelectItem value="bearable">
                                <span className="flex items-center gap-2">
                                    <ClipboardList className="w-4 h-4 text-orange-500" /> {t('settings.symptom_integration.bearable')}
                                </span>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground">
                        {t('settings.symptom_integration.hint')}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}

function StepProviderCard() {
    const { t } = useLanguage()
    const { profile, updateStepProvider } = useUser()
    const [updating, setUpdating] = useState(false)

    const handleProviderChange = async (val: string) => {
        setUpdating(true)
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await updateStepProvider(val as any)
        } catch (error) {
            console.error(error)
        } finally {
            setUpdating(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('settings.step_integration.title')}</CardTitle>
                <CardDescription>{t('settings.step_integration.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-sm font-medium">{t('settings.step_integration.provider_label')}</Label>
                    <Select
                        value={profile?.step_provider || 'apple'}
                        onValueChange={handleProviderChange}
                        disabled={updating}
                    >
                        <SelectTrigger className="w-full md:w-[350px]">
                            <SelectValue placeholder={t('settings.step_integration.placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="apple">
                                <span className="flex items-center gap-2">
                                    <Smartphone className="w-4 h-4" /> {t('settings.step_integration.apple')}
                                </span>
                            </SelectItem>
                            <SelectItem value="google">
                                <span className="flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-blue-500" /> {t('settings.step_integration.google')}
                                </span>
                            </SelectItem>
                            <SelectItem value="garmin" disabled>
                                <span className="flex items-center gap-2">{t('settings.step_integration.garmin')} ({t('settings.step_integration.soon')})</span>
                            </SelectItem>
                            <SelectItem value="samsung">
                                <span className="flex items-center gap-2">
                                    <Smartphone className="w-4 h-4 text-indigo-500" /> {t('settings.step_integration.samsung')}
                                </span>
                            </SelectItem>
                            <SelectItem value="csv">
                                <span className="flex items-center gap-2">
                                    <FileSpreadsheet className="w-4 h-4 text-stone-500" /> {t('settings.step_integration.csv')}
                                </span>
                            </SelectItem>
                            <SelectItem value="whoop" disabled>
                                <span className="flex items-center gap-2">{t('settings.step_integration.whoop')} ({t('settings.step_integration.soon')})</span>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground">
                        {t('settings.step_integration.hint')}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
