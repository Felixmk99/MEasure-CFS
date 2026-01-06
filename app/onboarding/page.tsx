'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/components/providers/user-provider'
import { useUpload } from '@/components/providers/upload-provider'
import { Button } from '@/components/ui/button'
import { Smartphone, Activity, Laptop, Watch, Heart, ClipboardList, FileSpreadsheet } from 'lucide-react'
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
        id: 'samsung',
        name: 'Samsung Health',
        icon: Laptop,
        color: 'bg-indigo-50 dark:bg-indigo-900/20',
        textColor: 'text-indigo-600 dark:text-indigo-400',
        description: 'Samsung Galaxy devices'
    },
    {
        id: 'csv',
        name: 'CSV File',
        icon: FileSpreadsheet,
        color: 'bg-stone-50 dark:bg-stone-900',
        textColor: 'text-stone-600 dark:text-stone-400',
        description: 'Upload generic CSV file'
    }
] as const

type SymptomProviderId = typeof SYMPTOM_PROVIDERS[number]['id']
type StepProviderId = typeof STEP_PROVIDERS[number]['id']

export default function OnboardingPage() {
    const [step, setStep] = useState<1 | 2>(1)
    const [selectedSymptom, setSelectedSymptom] = useState<typeof SYMPTOM_PROVIDERS[number]['id']>('visible')
    const [selectedStep, setSelectedStep] = useState<typeof STEP_PROVIDERS[number]['id']>('apple')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { profile, updateStepProvider, updateSymptomProvider } = useUser()
    const { pendingUpload } = useUpload()
    const router = useRouter()

    useEffect(() => {
        if (!pendingUpload || (profile?.step_provider && profile?.symptom_provider)) return;

        if (pendingUpload.type === 'bearable') {
            const autoConfigure = async () => {
                setLoading(true)
                try {
                    await updateSymptomProvider('bearable')
                    await updateStepProvider('apple')
                    router.refresh()
                    router.replace('/upload')
                } catch (err) {
                    console.error("Auto onboarding failed:", err)
                    setStep(2)
                } finally {
                    setLoading(false)
                }
            }
            autoConfigure()
        } else if (pendingUpload.type === 'visible') {
            setSelectedSymptom('visible')
            setStep(2)
        }
    }, [pendingUpload, profile, updateSymptomProvider, updateStepProvider, router])

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
            router.refresh()
            router.replace('/upload')
        } catch (err: unknown) {
            console.error(err)
            const errMsg = err instanceof Error ? err.message : String(err)
            setError('Failed to update selection: ' + errMsg)
            setLoading(false)
        }
    }

    const currentProviders = step === 1 ? SYMPTOM_PROVIDERS : STEP_PROVIDERS
    const selectedId = step === 1 ? selectedSymptom : selectedStep
    const setSelected = (id: SymptomProviderId | StepProviderId) => {
        if (step === 1) setSelectedSymptom(id as SymptomProviderId)
        else setSelectedStep(id as StepProviderId)
    }

    return (
        <div className="min-h-screen bg-[#F8FAFB] flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-slate-900">
                        {step === 1 ? 'Symptom Tracking?' : 'Step Provider?'}
                    </h2>
                    <p className="mt-2 text-slate-600">
                        {step === 1
                            ? 'Which app do you use for symptoms?'
                            : 'Which device tracks your movement?'}
                    </p>
                </div>

                <div className="grid gap-4 mt-8">
                    {currentProviders.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => setSelected(p.id)}
                            className={cn(
                                "flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left group",
                                selectedId === p.id
                                    ? "border-primary bg-primary/5 shadow-md"
                                    : "border-slate-100 hover:border-slate-300 bg-slate-50/50"
                            )}
                        >
                            <div className={cn("p-3 rounded-xl", p.color, p.textColor)}>
                                <p.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors">
                                    {p.name}
                                </h3>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                    {p.description}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>

                {error && (
                    <p className="text-sm text-red-500 text-center font-medium animate-in fade-in slide-in-from-top-1">
                        {error}
                    </p>
                )}

                <Button
                    className="w-full h-12 text-lg font-bold rounded-xl"
                    onClick={handleContinue}
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Continue'}
                </Button>
            </div>
        </div>
    )
}
