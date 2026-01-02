'use client'

import React, { useMemo } from 'react'
import { InsightMetric, calculateAdvancedCorrelations, detectThresholds } from '@/lib/stats/insights-logic'
import { enhanceDataWithScore } from '@/lib/scoring/composite-score'
import { CorrelationMatrix } from './_components/correlation-matrix'
import { InsightsCards } from './_components/insights-cards'
import { Badge } from '@/components/ui/badge'
import { BrainCircuit, Loader2, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const MIN_DAYS_FOR_INSIGHTS = 7

interface InsightsClientProps {
    data: InsightMetric[]
}

export default function InsightsClient({ data }: InsightsClientProps) {
    const hasData = data && data.length > 0
    const hasInsufficientData = hasData && data.length < MIN_DAYS_FOR_INSIGHTS
    // 1. Enhance Data with Composite Score (Client-Side Calc)
    const enhancedData = useMemo(() => {
        if (!data || data.length === 0) return []
        return enhanceDataWithScore(data)
    }, [data])

    // 2. Process all-time analysis
    const { correlations, thresholds } = useMemo(() => {
        if (!enhancedData || enhancedData.length < MIN_DAYS_FOR_INSIGHTS) return { correlations: [], thresholds: [] }

        // 1. Calculate Correlations
        const corrs = calculateAdvancedCorrelations(enhancedData)
        const thres = detectThresholds(enhancedData)
        return {
            correlations: corrs,
            thresholds: thres
        }
    }, [enhancedData])

    if (!hasData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center animate-in fade-in duration-700">
                <div className="p-6 rounded-full bg-zinc-100 dark:bg-zinc-800/50">
                    <Database className="w-12 h-12 text-zinc-400" />
                </div>
                <div className="max-w-md space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight">No Insights Yet</h2>
                    <p className="text-zinc-500">You need to upload some health data first before we can analyze your symptom patterns.</p>
                </div>
                <Button asChild className="rounded-full px-8 shadow-lg shadow-primary/20">
                    <Link href="/upload">Upload your first CSV</Link>
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
                    <h2 className="text-2xl font-bold tracking-tight">Gathering Biological Data</h2>
                    <p className="text-zinc-500">We need at least 7 days of data to provide statistically significant insights. Keep tracking!</p>
                </div>
                <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50/50">
                    Current Progress: {data.length} / 7 days
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
                                <h1 className="text-4xl font-black tracking-tight tracking-tighter sm:text-5xl">Insights</h1>
                            </div>
                            <p className="text-zinc-500 max-w-xl text-lg">
                                Deep analysis of your all-time health data to find the hidden patterns in your recovery.
                            </p>
                        </div>
                        <div className="flex flex-col items-end">
                            <Badge variant="secondary" className="px-4 py-1.5 text-sm rounded-lg border-none shadow-sm">
                                All-Time Analysis
                            </Badge>
                            <span className="text-[10px] text-zinc-400 mt-2">
                                Last updated: {data.length > 0
                                    ? new Date(data[data.length - 1].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                                    : 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Smart Insights Grid */}
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold tracking-tight px-1">Actionable Patterns</h2>
                    <div className="h-[2px] flex-1 bg-gradient-to-r from-zinc-200 to-transparent dark:from-zinc-800" />
                </div>
                <InsightsCards correlations={correlations} thresholds={thresholds} />
            </div>

            {/* Matrix View */}
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold tracking-tight px-1">Biological Clusters</h2>
                    <div className="h-[2px] flex-1 bg-gradient-to-r from-zinc-200 to-transparent dark:from-zinc-800" />
                </div>
                <CorrelationMatrix correlations={correlations} />
            </div>

            {/* Footer Note */}
            <p className="text-center text-xs text-zinc-400 pb-10">
                Statistical insights are for informational purposes only and not medical advice. Always consult your physician.
            </p>
        </div>
    )
}
