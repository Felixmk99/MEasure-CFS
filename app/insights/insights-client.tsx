'use client'

import React, { useMemo } from 'react'
import { InsightMetric, calculateAdvancedCorrelations, detectThresholds, calculateRecoveryVelocity } from '@/lib/stats/insights-logic'
import { enhanceDataWithScore, ExertionPreference } from '@/lib/scoring/composite-score'
import { CorrelationMatrix } from './_components/correlation-matrix'
import { InsightsCards } from './_components/insights-cards'
import { Badge } from '@/components/ui/badge'
import { BrainCircuit, Loader2, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useLanguage } from '@/components/providers/language-provider'
import { useUser } from '@/components/providers/user-provider'

const MIN_DAYS_FOR_INSIGHTS = 7

interface InsightsClientProps {
    data: InsightMetric[]
    exertionPreference?: ExertionPreference
}

export default function InsightsClient({ data, exertionPreference: initialPreference }: InsightsClientProps) {
    const { t } = useLanguage()
    const { profile } = useUser()
    const exertionPreference = profile?.exertion_preference ?? initialPreference ?? 'desirable'

    const hasData = data && data.length > 0
    const hasInsufficientData = hasData && data.length < MIN_DAYS_FOR_INSIGHTS
    // 1. Enhance Data with Composite Score (Client-Side Calc)
    const enhancedData = useMemo(() => {
        if (!data || data.length === 0) return []
        return enhanceDataWithScore(data, undefined, exertionPreference || 'desirable')
    }, [data, exertionPreference])

    // 2. Process all-time analysis
    const { correlations, thresholds, recovery } = useMemo(() => {
        if (!enhancedData || enhancedData.length < MIN_DAYS_FOR_INSIGHTS) return { correlations: [], thresholds: [], recovery: [] }

        // 1. Calculate Correlations
        const corrs = calculateAdvancedCorrelations(enhancedData)
        const thres = detectThresholds(enhancedData)
        const recov = calculateRecoveryVelocity(enhancedData)
        return {
            correlations: corrs,
            thresholds: thres,
            recovery: recov
        }
    }, [enhancedData])

    if (!hasData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center animate-in fade-in duration-700">
                <div className="p-6 rounded-full bg-zinc-100 dark:bg-zinc-800/50">
                    <Database className="w-12 h-12 text-zinc-400" />
                </div>
                <div className="max-w-md space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight">{t('insights.empty.title')}</h2>
                    <p className="text-zinc-500">{t('insights.empty.desc')}</p>
                </div>
                <Button asChild className="rounded-full px-8 shadow-lg shadow-primary/20">
                    <Link href="/upload">{t('insights.empty.button')}</Link>
                </Button>
            </div>
        )
    }

    if (hasInsufficientData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
                <div className="p-6 rounded-full bg-amber-50 dark:bg-amber-900/10">
                    <Loader2 className="w-12 h-12 text-amber-500 animate-spin-slow" />
                </div>
                <div className="max-w-md space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight">{t('insights.gathering.title')}</h2>
                    <p className="text-zinc-500">{t('insights.gathering.desc')}</p>
                </div>
                <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50/50">
                    {t('insights.gathering.progress', { count: data.length })}
                </Badge>
            </div>
        )
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Hero Header */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-zinc-400/20 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative p-8 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-3xl rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                    <BrainCircuit className="w-6 h-6" />
                                </div>
                                <h1 className="text-4xl font-black tracking-tight tracking-tighter sm:text-5xl">{t('insights.hero.title')}</h1>
                            </div>
                            <p className="text-zinc-500 max-w-xl text-lg">
                                {t('insights.hero.desc')}
                            </p>
                        </div>
                        <div className="flex flex-col items-end">
                            <Badge variant="secondary" className="px-4 py-1.5 text-sm rounded-lg border-none shadow-sm">
                                {t('insights.hero.all_time')}
                            </Badge>
                            <span className="text-[10px] text-zinc-400 mt-2" suppressHydrationWarning>
                                {t('insights.hero.last_updated', {
                                    date: data.length > 0
                                        ? new Date(data[data.length - 1].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                                        : 'N/A'
                                })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Smart Insights Grid */}
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold tracking-tight px-1">{t('insights.patterns.title')}</h2>
                    <div className="h-[2px] flex-1 bg-gradient-to-r from-zinc-200 to-transparent dark:from-zinc-800" />
                </div>
                <InsightsCards correlations={correlations} thresholds={thresholds} />
            </div>

            {/* Matrix View */}
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold tracking-tight px-1">{t('insights.clusters.title')}</h2>
                    <div className="h-[2px] flex-1 bg-gradient-to-r from-zinc-200 to-transparent dark:from-zinc-800" />
                </div>
                <CorrelationMatrix correlations={correlations} />
            </div>

            {/* Footer Note */}
            <p className="text-center text-xs text-zinc-400 pb-10">
                {t('insights.footer.disclaimer')}
            </p>
        </div>
    )
}
