'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from '@/components/ui/button'
import { Activity, Ban, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/components/providers/language-provider'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ExertionPreferenceModalProps {
    currentPreference?: 'desirable' | 'undesirable' | null
}

export function ExertionPreferenceModal({ currentPreference }: ExertionPreferenceModalProps) {
    const { t } = useLanguage()
    const [open, setOpen] = useState(false)
    const [selected, setSelected] = useState<'desirable' | 'undesirable' | undefined>(undefined)
    const [loading, setLoading] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        // Open if preference is strictly NULL (not set)
        // If it's undefined, it might be loading, but we assume parent handles loading check or passes valid props
        if (currentPreference === null) {
            setOpen(true)
        }
    }, [currentPreference])

    const handleSave = async () => {
        if (!selected) return

        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { error } = await supabase
                .from('profiles')
                // @ts-ignore
                .update({ exertion_preference: selected })
                .eq('id', user.id)

            if (error) throw error

            toast.success(t('exertion_preference.modal.success_toast'))
            setOpen(false)
            router.refresh()
        } catch (error) {
            console.error('Failed to save preference:', error)
            toast.error(t('common.error'))
        } finally {
            setLoading(false)
        }
    }

    // Prevent closing by clicking outside if it's a forced choice (initial setup)
    // We allow closing via 'Esc' merely for accessibility, but UI encourages selection.
    const handleOpenChange = (val: boolean) => {
        if (currentPreference === null && !val) {
            // Optional: Force user to choose? 
            // User rule: "This popup will prompt the user to choose their preference and will reappear until a choice is made (though users can close it, temporarily defaulting to 'desirable' for the session)."
            // So we allow closing.
            setOpen(false)
        } else {
            setOpen(val)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-serif text-center mb-2">
                        {t('exertion_preference.modal.title')}
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        {t('exertion_preference.modal.description')}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <RadioGroup
                        value={selected}
                        onValueChange={(v) => setSelected(v as 'desirable' | 'undesirable')}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        {/* Option 1: Desirable */}
                        <Label
                            htmlFor="desirable"
                            className={cn(
                                "flex flex-col h-full cursor-pointer rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-emerald-500 [&:has([data-state=checked])]:border-emerald-500 transition-all",
                                selected === 'desirable' && "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20"
                            )}
                        >
                            <RadioGroupItem value="desirable" id="desirable" className="sr-only" />
                            <div className="flex w-full items-center justify-between mb-4">
                                <Activity className={cn("h-6 w-6 text-muted-foreground", selected === 'desirable' && "text-emerald-500")} />
                                {selected === 'desirable' && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-semibold leading-none tracking-tight">
                                    {t('exertion_preference.modal.option_desirable.title')}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {t('exertion_preference.modal.option_desirable.description')}
                                </p>
                            </div>
                        </Label>

                        {/* Option 2: Undesirable */}
                        <Label
                            htmlFor="undesirable"
                            className={cn(
                                "flex flex-col h-full cursor-pointer rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-rose-500 [&:has([data-state=checked])]:border-rose-500 transition-all",
                                selected === 'undesirable' && "border-rose-500 bg-rose-50/50 dark:bg-rose-900/20"
                            )}
                        >
                            <RadioGroupItem value="undesirable" id="undesirable" className="sr-only" />
                            <div className="flex w-full items-center justify-between mb-4">
                                <Ban className={cn("h-6 w-6 text-muted-foreground", selected === 'undesirable' && "text-rose-500")} />
                                {selected === 'undesirable' && <CheckCircle2 className="h-5 w-5 text-rose-500" />}
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-semibold leading-none tracking-tight">
                                    {t('exertion_preference.modal.option_undesirable.title')}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {t('exertion_preference.modal.option_undesirable.description')}
                                </p>
                            </div>
                        </Label>
                    </RadioGroup>
                </div>

                <DialogFooter className="sm:justify-center">
                    <Button
                        onClick={handleSave}
                        disabled={!selected || loading}
                        className="w-full sm:w-auto px-12"
                    >
                        {loading ? t('exertion_preference.modal.loading') : t('exertion_preference.modal.submit')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
