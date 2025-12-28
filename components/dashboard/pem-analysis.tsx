'use client'

import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUp, ArrowDown, Activity, Footprints, Heart, AlertCircle, Info, TrendingUp, Target, Settings2 } from "lucide-react"
import { parseISO, subDays, addDays, isSameDay, isWithinInterval, startOfDay, endOfDay } from "date-fns"
import { useLanguage } from '@/components/providers/language-provider'
import { calculateBaselineStats, extractEpochs, calculateZScores, aggregateEpochs, analyzePreCrashPhase, analyzeRecoveryPhase, analyzeCrashPhase } from "@/lib/statistics/pem-cycle"
import { PSTHChart } from "@/components/charts/psth-chart"
import { Tooltip as InfoTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface PEMAnalysisProps {
    data: any[]
    filterRange?: { start: Date, end: Date } | null
}

interface CycleAnalysisResult {
    noCrashes: boolean
    filterApplied: boolean
    episodeCount?: number
    aggregatedProfile?: any[]
    phase1?: any
    phase2?: any
    phase3?: any
}

export function PEMAnalysis({ data, filterRange }: PEMAnalysisProps) {
    const { t } = useLanguage()

    const analysis: CycleAnalysisResult | null = useMemo(() => {
        if (!data || data.length < 10) return null

        // Sort data
        const sorted = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        // 1. Identify Crashes & Episodes
        const crashIndices: number[] = []
        const episodeIndices = new Set<number>()

        // Find all crash starts (Day 0 of an episode)
        let inCrash = false
        sorted.forEach((d, i) => {
            const isCrash = d.custom_metrics?.Crash == 1 || d.custom_metrics?.crash == 1
            if (isCrash) {
                if (!inCrash) {
                    crashIndices.push(i) // Start of episode
                    inCrash = true
                }
                episodeIndices.add(i)
            } else {
                inCrash = false
            }
        })

        if (crashIndices.length === 0) return { noCrashes: true, filterApplied: !!filterRange }

        // 2. Define Baseline Data (Exclude crashes)
        // Use the last 90 non-crash days as the "Normal" reference for this person's current state.
        const baselineDataFull = sorted.filter((_, i) => !episodeIndices.has(i))
        const baselineData = baselineDataFull.slice(-90)

        // 3. Calculate Global Stats (Mean/Std) for Z-Scores
        // Dynamically find all metrics in custom_metrics
        const customKeys = new Set<string>()
        data.forEach(d => {
            if (d.custom_metrics) {
                Object.keys(d.custom_metrics).forEach(k => customKeys.add(k))
            }
        })

        const metrics = [
            'step_count',
            'exertion_score',
            'hrv',
            'composite_score',
            'resting_heart_rate',
            'Crash',
            'crash',
            ...Array.from(customKeys)
        ]
        const baselineStats = calculateBaselineStats(baselineData, metrics)

        // 4. Extract Epochs & Z-Scores
        // Filter crashIndices by range if needed
        const filteredCrashIndices = !filterRange ? crashIndices : crashIndices.filter(i => {
            const date = startOfDay(parseISO(sorted[i].date))
            const rangeStart = startOfDay(filterRange.start)
            const rangeEnd = endOfDay(filterRange.end)
            return date >= rangeStart && date <= rangeEnd
        })

        if (filteredCrashIndices.length === 0) return { noCrashes: true, filterApplied: !!filterRange }

        const epochs = extractEpochs(sorted, filteredCrashIndices, metrics)
        const zScoreEpochs = calculateZScores(epochs, baselineStats)
        const aggregatedProfile = aggregateEpochs(zScoreEpochs, metrics)

        // 5. Run Targeted Analysis
        const phase1 = analyzePreCrashPhase(aggregatedProfile, baselineStats)
        const phase2 = analyzeCrashPhase(zScoreEpochs, baselineStats)
        const phase3 = analyzeRecoveryPhase(zScoreEpochs, baselineStats)

        return {
            noCrashes: false,
            episodeCount: filteredCrashIndices.length,
            aggregatedProfile,
            phase1,
            phase2,
            phase3,
            filterApplied: !!filterRange
        }
    }, [data, filterRange])

    const getFriendlyName = (key: string): string => {
        if (key.includes(' + ')) {
            return key.split(' + ').map(k => getFriendlyName(k)).join(' + ')
        }
        if (key === 'composite_score') return 'Track-Me Score'
        if (key === 'exertion_score') return 'Exertion'
        if (key === 'hrv') return 'HRV'
        if (key === 'resting_heart_rate') return 'Resting HR'
        if (key === 'step_count') return 'Steps'
        return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }

    const getMetricIcon = (key: string, className?: string) => {
        if (key.includes(' + ')) return <Activity className={className} />
        if (key === 'step_count') return <Footprints className={className} />
        if (key === 'hrv' || key === 'resting_heart_rate') return <Heart className={className} />
        if (key === 'exertion_score') return <Activity className={className} />
        if (key === 'composite_score') return <Target className={className} />
        return <Info className={className} />
    }

    if (!analysis || analysis.noCrashes) {
        return (
            <Card className="border-l-4 border-l-green-500 bg-green-50/10 dark:bg-green-950/10">
                <CardHeader className="py-4">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Activity className="w-4 h-4 text-green-500" />
                        No PEM Clusters Detected
                    </CardTitle>
                    <CardDescription>
                        {analysis?.filterApplied
                            ? "No crashes detected in the selected timeframe."
                            : "You don't have enough crash data to perform a full Cycle Analysis yet."}
                    </CardDescription>
                </CardHeader>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* 1. Insights Stack */}
            <div className="flex flex-col gap-6">
                <Card className="border-l-4 border-l-orange-500 bg-card/50 overflow-hidden">
                    <CardHeader className="py-4 pb-2 border-b border-orange-500/10">
                        <div className="flex items-center gap-2 text-sm font-semibold text-orange-500 uppercase tracking-widest">
                            <TrendingUp className="w-4 h-4" />
                            Phase 1: Buildup
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="space-y-4">
                            {analysis.phase1?.discoveries && analysis.phase1.discoveries.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {analysis.phase1.discoveries.map((d: any) => (
                                        <div
                                            key={d.metric}
                                            className={cn(
                                                "p-3 rounded-xl border flex flex-col gap-2 relative overflow-hidden",
                                                d.type === 'spike'
                                                    ? "bg-orange-500/5 border-orange-200/50 dark:border-orange-500/20"
                                                    : "bg-blue-500/5 border-blue-200/50 dark:border-blue-500/20"
                                            )}
                                        >
                                            {/* Header: Icon + Name */}
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "p-1.5 rounded-lg shrink-0",
                                                    d.type === 'spike' ? "bg-orange-100 text-orange-600 dark:bg-orange-950/50" : "bg-blue-100 text-blue-600 dark:bg-blue-950/50"
                                                )}>
                                                    {getMetricIcon(d.metric, "w-3.5 h-3.5")}
                                                </div>
                                                <span className="text-xs font-bold truncate">
                                                    {getFriendlyName(d.metric)}
                                                </span>
                                            </div>

                                            {/* Data: Pct + Direction */}
                                            <div className="flex items-end justify-between">
                                                <div className="flex flex-col">
                                                    <div className={cn(
                                                        "text-xl font-black flex items-center gap-1",
                                                        d.type === 'spike' ? "text-orange-600 dark:text-orange-400" : "text-blue-600 dark:text-blue-400"
                                                    )}>
                                                        {d.type === 'spike' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                                                        {Math.abs(d.pctChange).toFixed(0)}%
                                                    </div>
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">
                                                        {d.type === 'spike' ? 'Increase' : 'Decrease'}
                                                    </span>
                                                </div>

                                                {/* Timeframe Pill */}
                                                <div className="bg-background/80 dark:bg-zinc-900/80 backdrop-blur px-2 py-1 rounded text-[10px] font-bold border border-border/50 shadow-sm">
                                                    {d.leadDaysStart === d.leadDaysEnd ? (
                                                        <span>{d.leadDaysStart}d before</span>
                                                    ) : (
                                                        <span>{d.leadDaysStart}-{d.leadDaysEnd}d before</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Subtle BG Decoration */}
                                            <div className={cn(
                                                "absolute -bottom-2 -right-2 opacity-[0.03]",
                                                d.type === 'spike' ? "text-orange-500" : "text-blue-500"
                                            )}>
                                                {getMetricIcon(d.metric, "w-12 h-12")}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="text-base font-medium text-muted-foreground">
                                        No clear trigger pattern
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        No acute statistical spikes found in your metrics during the 7-day buildup. Your crashes may be caused by a "slow burn" of cumulative baseline energy expenditure.
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* PHASE 2: THE EVENT (Impact Profile) */}
                <Card className="border-l-4 border-l-red-500 bg-card/50 overflow-hidden">
                    <CardHeader className="py-4 pb-2 border-b border-red-500/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm font-semibold text-red-500 uppercase tracking-widest">
                                <Target className="w-4 h-4" />
                                Phase 2: The Event
                            </div>
                            <div className="flex gap-4 text-[10px] font-bold uppercase text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-red-400 opacity-60" />
                                    Logged: {analysis.phase2?.avgLoggedDuration.toFixed(1)}d
                                </div>
                                <div className="flex items-center gap-1.5" title="Window where biomarkers deviate > 1.0 sigma from normal">
                                    <span className="w-2 h-2 rounded-full bg-red-600" />
                                    Physiological: {analysis.phase2?.avgPhysiologicalDuration.toFixed(1)}d
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="space-y-4">
                            <div className="flex items-baseline justify-between mb-2">
                                <h3 className="text-xl font-black text-red-600 dark:text-red-400 leading-none">
                                    {analysis.phase2?.type || 'Unknown'}
                                </h3>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">
                                        Baseline: Last 90 non-crash days
                                    </p>
                                    <p className="text-xs font-bold text-muted-foreground uppercase flex items-center justify-end gap-1.5">
                                        {analysis.phase2?.avgPhysiologicalDuration > analysis.phase2?.avgLoggedDuration
                                            ? `Stress persists +${(analysis.phase2.avgPhysiologicalDuration - analysis.phase2.avgLoggedDuration).toFixed(1)}d after logs`
                                            : "Stress matches logging pattern"}
                                        <TooltipProvider>
                                            <InfoTooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="w-3.5 h-3.5 opacity-50 hover:opacity-100 cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-[250px] text-[11px]">
                                                    <p className="font-bold mb-1">Physiological Duration</p>
                                                    <p>Calculated based on when your metrics (HRV, Resting HR, etc.) return to within 1.0 standard deviation of your 90-day "Normal".</p>
                                                </TooltipContent>
                                            </InfoTooltip>
                                        </TooltipProvider>
                                    </p>
                                    {analysis.phase2?.extendingMetrics?.length > 0 && (
                                        <p className="text-[10px] text-muted-foreground italic">
                                            Extended by: {analysis.phase2.extendingMetrics.map((m: string) => getFriendlyName(m)).join(", ")}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {analysis.phase2?.discoveries?.map((d: any) => (
                                    <div
                                        key={d.metric}
                                        className={cn(
                                            "p-3 rounded-xl border flex flex-col gap-2 relative overflow-hidden",
                                            d.type === 'spike'
                                                ? "bg-red-500/5 border-red-100/50 dark:border-red-500/20"
                                                : "bg-blue-500/5 border-blue-100/50 dark:border-blue-500/20"
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "p-1.5 rounded-lg shrink-0",
                                                d.type === 'spike' ? "bg-red-100 text-red-600 dark:bg-red-950/50" : "bg-blue-100 text-blue-600 dark:bg-blue-950/50"
                                            )}>
                                                {getMetricIcon(d.metric, "w-3.5 h-3.5")}
                                            </div>
                                            <span className="text-xs font-bold truncate">
                                                {getFriendlyName(d.metric)}
                                            </span>
                                        </div>

                                        <div className="flex items-end justify-between">
                                            <div className="flex flex-col">
                                                <div className={cn(
                                                    "text-xl font-black flex items-center gap-1",
                                                    d.type === 'spike' ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"
                                                )}>
                                                    {d.type === 'spike' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                                                    {Math.abs(d.pctChange).toFixed(0)}%
                                                </div>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">
                                                    Peak Deviation
                                                </span>
                                            </div>
                                        </div>

                                        <div className={cn(
                                            "absolute -bottom-2 -right-2 opacity-[0.03]",
                                            d.type === 'spike' ? "text-red-500" : "text-blue-500"
                                        )}>
                                            {getMetricIcon(d.metric, "w-12 h-12")}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* PHASE 3: THE RECOVERY TAIL */}
                <Card className="border-l-4 border-l-blue-500 bg-card/50 overflow-hidden">
                    <CardHeader className="py-3 pb-2 border-b border-blue-500/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm font-semibold text-blue-500 uppercase tracking-widest">
                                <TrendingUp className="w-4 h-4" />
                                Phase 3: The Recovery Tail
                            </div>
                            <div className="flex gap-4 text-[10px] font-bold uppercase text-muted-foreground">
                                <div className="flex items-center gap-1.5" title="Days until symptoms hit baseline after you stopped logging 'Crash'">
                                    <span className="w-2 h-2 rounded-full bg-blue-400 opacity-60" />
                                    Subjective Tail: +{analysis.phase3?.avgSymptomRecoveryTail.toFixed(1)}d
                                </div>
                                <div className="flex items-center gap-1.5" title="Days until vitals (HRV/RHR) hit baseline after you stopped logging 'Crash'">
                                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                                    Biological Tail: +{analysis.phase3?.avgBiologicalRecoveryTail.toFixed(1)}d
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="space-y-4">
                            <div className="flex items-baseline justify-between mb-2">
                                <h3 className="text-xl font-black text-blue-600 dark:text-blue-400 leading-none uppercase tracking-tighter">
                                    {analysis.phase3?.avgBiologicalRecoveryTail > analysis.phase3?.avgSymptomRecoveryTail ? "Biological Lag" : "Fast Recovery"}
                                </h3>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-muted-foreground uppercase flex items-center justify-end gap-1.5">
                                        {analysis.phase3?.hysteresisGap > 1
                                            ? `Body lag: +${analysis.phase3.hysteresisGap.toFixed(1)}d after feeling better`
                                            : "Body resets alongside symptoms"}
                                        <TooltipProvider>
                                            <InfoTooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="w-3.5 h-3.5 opacity-50 hover:opacity-100 cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-[250px] text-[11px]">
                                                    <p className="font-bold mb-1">The Recovery Tail</p>
                                                    <p>Phase 3 measures the "invisible" period after you stopped logging your crash. It identifies which metrics take the longest to return to your 90-day normal baseline.</p>
                                                </TooltipContent>
                                            </InfoTooltip>
                                        </TooltipProvider>
                                    </p>
                                </div>
                            </div>

                            {analysis.phase3?.slowestRecoverers?.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {analysis.phase3.slowestRecoverers.map((metric: string) => (
                                        <div
                                            key={metric}
                                            className="bg-background/40 border border-blue-500/10 rounded-xl p-3 flex flex-col justify-between group hover:border-blue-500/30 transition-colors"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="p-1.5 rounded-lg bg-blue-500/5 text-blue-500">
                                                    {getMetricIcon(metric)}
                                                </div>
                                                <Badge variant="outline" className="text-[9px] font-bold border-blue-500/20 text-blue-600 dark:text-blue-400 uppercase">
                                                    Slowest
                                                </Badge>
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight truncate">
                                                    {getFriendlyName(metric)}
                                                </div>
                                                <div className="flex items-baseline gap-1 mt-0.5">
                                                    <span className="text-lg font-black text-foreground leading-none">
                                                        +{analysis.phase3.avgBiologicalRecoveryTail.toFixed(1)}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">days tail</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 4. Visualization: The Shape of the Crash */}
                <div className="pt-4">
                    <PSTHChart
                        data={analysis.aggregatedProfile || []}
                        phase2LoggedEnd={analysis.phase2?.avgLoggedDuration}
                        phase2PhysEnd={analysis.phase2?.avgPhysiologicalDuration}
                    />
                </div>
            </div>
            <p className="text-xs text-muted-foreground text-center pt-2 max-w-2xl mx-auto">
                * Analysis based on <strong>{analysis.episodeCount} crash episodes</strong> using Superposed Epoch Analysis (SEA).
            </p>
        </div>
    )
}
