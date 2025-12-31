'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/components/providers/user-provider'
import { Button } from '@/components/ui/button'
import { Smartphone, Activity, Laptop, Watch, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

const PROVIDERS = [
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
        description: 'Samsung Galaxy devices (Coming Soon)'
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
    const [selected, setSelected] = useState<typeof PROVIDERS[number]['id']>('apple')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { updateStepProvider } = useUser()
    const router = useRouter()

    const handleContinue = async () => {
        setLoading(true)
        setError(null)
        try {
            await updateStepProvider(selected)
            // Force a refresh to ensure layout/providers pick up the new step_provider
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

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950">
            <div className="max-w-xl w-full space-y-8 text-center">
                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight">
                        Choose your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#60A5FA] to-[#3B82F6]">
                            Step Provider
                        </span>
                    </h1>
                    <p className="text-muted-foreground">
                        Select which app you use to track your daily steps.
                        You can always change this in your profile settings.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    {PROVIDERS.map((provider) => {
                        const Icon = provider.icon
                        const isSelected = selected === provider.id
                        const isComingSoon = ['garmin', 'samsung', 'whoop'].includes(provider.id)

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

                <div className="pt-8">
                    <Button
                        onClick={handleContinue}
                        disabled={loading}
                        className="w-full h-12 rounded-full text-base font-bold bg-[#3B82F6] hover:bg-blue-600 shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98]"
                    >
                        {loading ? 'Setting up...' : 'Continue to Data Upload'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
