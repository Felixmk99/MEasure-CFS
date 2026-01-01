'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/components/providers/user-provider'
import { useUpload } from '@/components/providers/upload-provider'
import { Button } from '@/components/ui/button'
import { Smartphone, Activity, Laptop, Watch, Heart, FileText, ClipboardList } from 'lucide-react'
import { cn } from '@/lib/utils'

const SYMPTOM_PROVIDERS = [
    {
        id: 'visible',
        name: 'Visible App',
        icon: Activity,
        color: 'bg-rose-50 dark:bg-rose-900/20',
        textColor: 'text-rose-600 dark:text-rose-400',
        description: 'Morning stability and daily check-ins'
    },
    {
        id: 'bearable',
        name: 'Bearable App',
        icon: ClipboardList,
        color: 'bg-orange-50 dark:bg-orange-900/20',
        textColor: 'text-orange-600 dark:text-orange-400',
        description: 'Extensive symptom and factor tracking'
    }
] as const

const STEP_PROVIDERS = [
    {
        id: 'apple',
        name: 'Apple Health',
        icon: Smartphone,
        color: 'bg-zinc-100 dark:bg-zinc-900',
        textColor: 'text-zinc-900 dark:text-zinc-100',
        description: 'iPhone and Apple Watch users'
    },
    {
        id: 'google',
        name: 'Google Fit',
        icon: Activity,
        color: 'bg-blue-50 dark:bg-blue-900/20',
        textColor: 'text-blue-600 dark:text-blue-400',
        description: 'Android and Google ecosystem'
    },
    {
        id: 'garmin',
        name: 'Garmin Connect',
        icon: Watch,
        color: 'bg-slate-100 dark:bg-slate-900',
        textColor: 'text-slate-900 dark:text-slate-100',
        description: 'Garmin wearables (Coming Soon)'
    },
    {
        id: 'samsung',
        name: 'Samsung Health',
        icon: Laptop,
        color: 'bg-indigo-50 dark:bg-indigo-900/20',
        textColor: 'text-indigo-600 dark:text-indigo-400',
        description: 'Samsung Galaxy devices'
    },
    {
        id: 'whoop',
        name: 'Whoop',
        icon: Heart,
        color: 'bg-red-50 dark:bg-red-900/20',
        textColor: 'text-red-600 dark:text-red-400',
        description: 'Whoop fitness trackers (Coming Soon)'
    }
] as const

export default function OnboardingPage() {
    const [step, setStep] = useState<1 | 2>(1)
    const [selectedSymptom, setSelectedSymptom] = useState<typeof SYMPTOM_PROVIDERS[number]['id']>('visible')
    const [selectedStep, setSelectedStep] = useState<typeof STEP_PROVIDERS[number]['id']>('apple')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { updateStepProvider, updateSymptomProvider } = useUser()
    const { pendingUpload } = useUpload()
    const router = useRouter()

    useEffect(() => {
        if (pendingUpload && (pendingUpload.type === 'visible' || pendingUpload.type === 'bearable')) {
            setSelectedSymptom(pendingUpload.type)
            setStep(2)
        }
    }, [pendingUpload])

    const handleContinue = async () => {
        if (step === 1) {
            setStep(2)
            return
        }

        setLoading(true)
        setError(null)
        try {
            await updateSymptomProvider(selectedSymptom)
            await updateStepProvider(selectedStep)
            // Force a refresh to ensure layout/providers pick up the new selections
            router.refresh()
            // Using replace to prevent going back to onboarding
            router.replace('/upload')
        } catch (err: any) {
            console.error(err)
            setError(err.message || 'Failed to update selection. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const currentProviders = step === 1 ? SYMPTOM_PROVIDERS : STEP_PROVIDERS
    const selectedId = step === 1 ? selectedSymptom : selectedStep
    const setSelected = (id: any) => step === 1 ? setSelectedSymptom(id) : setSelectedStep(id)

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950">
            <div className="max-w-xl w-full space-y-8 text-center">
                {/* Step Indicator */}
                <div className="flex justify-center gap-2">
                    <div className={cn("h-1.5 w-12 rounded-full transition-colors", step >= 1 ? "bg-[#3B82F6]" : "bg-zinc-200 dark:bg-zinc-800")} />
                    <div className={cn("h-1.5 w-12 rounded-full transition-colors", step >= 2 ? "bg-[#3B82F6]" : "bg-zinc-200 dark:bg-zinc-800")} />
                </div>

                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight">
                        {step === 1 ? 'Which app do you use for' : 'Choose your'} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#60A5FA] to-[#3B82F6]">
                            {step === 1 ? 'Symptom Tracking?' : 'Step Provider'}
                        </span>
                    </h1>
                    <p className="text-muted-foreground">
                        {step === 1
                            ? "Select the primary source of your health measurements and symptom scores."
                            : "Select which app you use to track your daily steps."}
                        <br />You can always change this in your settings later.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    {currentProviders.map((provider) => {
                        const Icon = provider.icon
                        const isSelected = selectedId === provider.id
                        const isComingSoon = (provider as any).description.includes('Coming Soon')

                        return (
                            <button
                                key={provider.id}
                                disabled={isComingSoon}
                                onClick={() => setSelected(provider.id)}
                                className={cn(
                                    "relative flex items-center p-4 rounded-2xl border transition-all text-left group",
                                    isSelected
                                        ? "border-[#3B82F6] bg-white dark:bg-zinc-900 shadow-lg ring-1 ring-[#3B82F6]"
                                        : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700",
                                    isComingSoon && "opacity-60 grayscale cursor-not-allowed"
                                )}
                            >
                                <div className={cn("p-3 rounded-xl mr-4 transition-colors", provider.color, provider.textColor)}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-sm flex items-center justify-between">
                                        {provider.name}
                                        {isComingSoon && (
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Soon</span>
                                        )}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-0.5">
                                        {provider.description}
                                    </div>
                                </div>
                                {isSelected && (
                                    <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse" />
                                )}
                            </button>
                        )
                    })}
                </div>

                {error && (
                    <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-900/20">
                        {error}
                    </div>
                )}

                <div className="pt-8 flex gap-4">
                    {step === 2 && (
                        <Button
                            variant="outline"
                            onClick={() => setStep(1)}
                            className="h-12 rounded-full px-8 font-bold border-zinc-200 dark:border-zinc-800"
                        >
                            Back
                        </Button>
                    )}
                    <Button
                        onClick={handleContinue}
                        disabled={loading}
                        className="flex-1 h-12 rounded-full text-base font-bold bg-[#3B82F6] hover:bg-blue-600 shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98]"
                    >
                        {loading ? 'Setting up...' : step === 1 ? 'Continue' : 'Complete Setup'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
