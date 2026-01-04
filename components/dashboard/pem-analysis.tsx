'use client'

import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUp, ArrowDown, Activity, Footprints, Heart, Info, TrendingUp, Target } from "lucide-react"
import { parseISO, startOfDay, endOfDay } from "date-fns"
import { calculateBaselineStats, extractEpochs, calculateZScores, aggregateEpochs, analyzePreCrashPhase, analyzeRecoveryPhase, analyzeCrashPhase } from "@/lib/statistics/pem-cycle"
import { Tooltip as InfoTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/components/providers/language-provider"

import { ScorableEntry } from '@/lib/scoring/composite-score'

interface PEMAnalysisProps {
    data: ScorableEntry[]
    filterRange?: { start: Date, end: Date } | null
}

interface CycleAnalysisResult {
    noCrashes: boolean
    filterApplied: boolean
    episodeCount?: number
    phase1?: ReturnType<typeof analyzePreCrashPhase>
    phase2?: ReturnType<typeof analyzeCrashPhase>
    phase3?: ReturnType<typeof analyzeRecoveryPhase>
}

interface Discovery {
    metric: string;
    type: 'spike' | 'drop';
    magnitude: number;
    pctChange: number;
    leadDaysStart?: number;
    leadDaysEnd?: number;
    isAcute?: boolean;
    classification?: string;
    isSynergy?: boolean;
}

const getClassificationLabel = (classification: string | undefined, isAcute: boolean | undefined, t: (key: string) => string): string => {
    if (!classification) {
        return isAcute
            ? t('insights.pem_analysis.classifications.acute')
            : t('insights.pem_analysis.classifications.cumulative')
    }
    const map: Record<string, string> = {
        'Acute': 'insights.pem_analysis.classifications.acute',
        'Lagged': 'insights.pem_analysis.classifications.lagged',
        'Historical': 'insights.pem_analysis.classifications.historical',
        'Cumulative': 'insights.pem_analysis.classifications.cumulative'
    }
    return t(map[classification] || map['Cumulative'])
}

const getClassificationDesc = (classification: string | undefined, isAcute: boolean | undefined, t: (key: string) => string): string => {
    if (!classification) {
        return isAcute
            ? t('insights.pem_analysis.classifications.onset_desc')
            : t('insights.pem_analysis.classifications.pre_onset_desc')
    }
    const map: Record<string, string> = {
        'Acute': 'insights.pem_analysis.classifications.acute_desc',
        'Lagged': 'insights.pem_analysis.classifications.lagged_desc',
        'Historical': 'insights.pem_analysis.classifications.historical_desc',
        'Cumulative': 'insights.pem_analysis.classifications.cumulative_desc'
    }
    return t(map[classification] || map['Cumulative'])
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

        // Try to find in common.metric_labels
        const label = t(`common.metric_labels.${key}`)
        if (label !== `common.metric_labels.${key}`) return label

        if (process.env.NODE_ENV === 'development') {
            console.warn(`Translation missing for metric: ${key}`)
        }

        // Try to find in dashboard.metrics (complex object)
        const complexLabel = t(`dashboard.metrics.${key}.label`)
        if (complexLabel !== `dashboard.metrics.${key}.label`) return complexLabel

        // Fallback: Capitalize
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
                        {t('insights.pem_analysis.no_clusters.title')}
                    </CardTitle>
                    <CardDescription>
                        {analysis?.filterApplied
                            ? t('insights.pem_analysis.no_clusters.desc')
                            : t('insights.pem_analysis.no_clusters.desc_short')}
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
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm font-semibold text-orange-500 uppercase tracking-widest">
                                <TrendingUp className="w-4 h-4" />
                                {t('insights.pem_analysis.phase1.title')}
                            </div>
                            <div className="flex items-center gap-3">
                                {analysis.phase1?.cumulativeLoadDetected && (
                                    <Badge variant="outline" className="text-[10px] bg-orange-500/10 border-orange-500/20 text-orange-600">
                                        {t('insights.pem_analysis.phase1.cumulative')}
                                    </Badge>
                                )}
                                <div className="flex items-center gap-1.5" title="Statistical confidence based on consistency across episodes">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{t('insights.pem_analysis.phase1.confidence')}</span>
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "w-2.5 h-1 rounded-full",
                                                    (analysis.phase1?.confidence || 0) * 5 >= i
                                                        ? "bg-orange-500"
                                                        : "bg-orange-200 dark:bg-orange-950"
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="space-y-4">
                            {analysis.phase1?.discoveries && analysis.phase1.discoveries.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {analysis.phase1.discoveries.map((d: Discovery) => (
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
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <div className={cn(
                                                        "p-1.5 rounded-lg shrink-0",
                                                        d.type === 'spike' ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                                                    )}>
                                                        {getMetricIcon(d.metric, "w-3.5 h-3.5")}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-xs font-bold truncate leading-tight">
                                                            {getFriendlyName(d.metric)}
                                                        </span>
                                                        {d.isSynergy && (
                                                            <span className="text-[8px] font-medium text-purple-500 flex items-center gap-0.5 uppercase tracking-tighter">
                                                                <Target className="w-2 h-2" /> {t('insights.pem_analysis.discovery.synergy')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <TooltipProvider>
                                                    <InfoTooltip>
                                                        <TooltipTrigger asChild>
                                                            <Badge variant="outline" className={cn(
                                                                "text-[9px] font-black border-transparent uppercase px-1.5 py-0 cursor-help",
                                                                d.classification === 'Acute' && "bg-red-500/10 text-red-600",
                                                                d.classification === 'Lagged' && "bg-orange-500/10 text-orange-600",
                                                                d.classification === 'Historical' && "bg-zinc-500/10 text-zinc-600",
                                                                d.classification === 'Cumulative' && "bg-amber-500/10 text-amber-600",
                                                                !d.classification && d.isAcute && "bg-red-500/10 text-red-600",
                                                                !d.classification && !d.isAcute && "bg-orange-500/10 text-orange-600"
                                                            )}>
                                                                {getClassificationLabel(d.classification, d.isAcute, t)}
                                                            </Badge>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-[200px] text-[10px]">
                                                            {getClassificationDesc(d.classification, d.isAcute, t)}
                                                        </TooltipContent>
                                                    </InfoTooltip>
                                                </TooltipProvider>
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
                                                        {d.type === 'spike' ? t('insights.pem_analysis.discovery.increase') : t('insights.pem_analysis.discovery.decrease')}
                                                    </span>
                                                </div>

                                                {/* Timeframe Pill */}
                                                <div className="bg-background/80 dark:bg-zinc-900/80 backdrop-blur px-2 py-1 rounded text-[10px] font-bold border border-border/50 shadow-sm">
                                                    {d.leadDaysStart === 0 && d.leadDaysEnd === 0 ? (
                                                        <span>{t('insights.pem_analysis.discovery.onset')}</span>
                                                    ) : d.leadDaysStart === d.leadDaysEnd ? (
                                                        <span>{t('insights.pem_analysis.discovery.day_before', { day: d.leadDaysStart?.toString() || '0' })}</span>
                                                    ) : (
                                                        <span>{t('insights.pem_analysis.discovery.days_before', { start: d.leadDaysStart?.toString() || '0', end: d.leadDaysEnd?.toString() || '' })}</span>
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
                                        {t('insights.pem_analysis.phase1.no_pattern')}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {t('insights.pem_analysis.phase1.no_pattern_desc')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* PHASE 2: THE EVENT (Impact Profile) */}
                <Card className="border-l-4 border-l-red-500 bg-card/50 overflow-hidden">
                    <CardHeader className="py-3 pb-2 border-b border-red-500/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm font-semibold text-red-500 uppercase tracking-widest">
                                <Target className="w-4 h-4" />
                                {t('insights.pem_analysis.phase2.title')}
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-100/50 dark:bg-red-900/20 text-[10px] font-bold uppercase text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-900/30">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                    {t('insights.pem_analysis.phase2.logged', { val: analysis.phase2?.avgLoggedDuration.toFixed(1) || '0' })}
                                </div>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-600/10 dark:bg-red-900/40 text-[10px] font-bold uppercase text-red-700 dark:text-red-400 border border-red-300/50 dark:border-red-900/50" title="Window where biomarkers deviate > 1.0 sigma from normal">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                                    {t('insights.pem_analysis.phase2.physiological', { val: analysis.phase2?.avgPhysiologicalDuration.toFixed(1) || '0' })}
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="space-y-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-2xl font-black text-red-600 dark:text-red-500 leading-none uppercase tracking-tighter">
                                        {analysis.phase2?.type || t('common.unknown')}
                                    </h3>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-70">
                                        {t('insights.pem_analysis.phase2.classification')}
                                    </p>
                                </div>

                                <div className="flex flex-col items-end text-right min-w-[200px]">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={cn(
                                            "text-xs font-black uppercase tracking-tight",
                                            (analysis.phase2?.avgPhysiologicalDuration ?? 0) > (analysis.phase2?.avgLoggedDuration ?? 0) ? "text-red-600 dark:text-red-400" : "text-emerald-600"
                                        )}>
                                            {(analysis.phase2?.avgPhysiologicalDuration ?? 0) > (analysis.phase2?.avgLoggedDuration ?? 0)
                                                ? t('insights.pem_analysis.phase2.persists', { val: ((analysis.phase2?.avgPhysiologicalDuration ?? 0) - (analysis.phase2?.avgLoggedDuration ?? 0)).toFixed(1) })
                                                : t('insights.pem_analysis.phase2.recovered')}
                                        </span>
                                        <TooltipProvider>
                                            <InfoTooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="w-3.5 h-3.5 opacity-40 hover:opacity-100 cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-[250px] text-[11px]">
                                                    <p className="font-bold mb-1">{t('insights.pem_analysis.phase2.bio_stress_title')}</p>
                                                    <p>{t('insights.pem_analysis.phase2.bio_stress_desc')}</p>
                                                </TooltipContent>
                                            </InfoTooltip>
                                        </TooltipProvider>
                                    </div>

                                    {(analysis.phase2?.extendingMetrics?.length ?? 0) > 0 && (
                                        <div className="flex flex-wrap justify-end gap-1">
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase mr-1 mt-0.5">{t('insights.pem_analysis.phase2.extended_by')}</span>
                                            {analysis.phase2?.extendingMetrics?.map((m: string) => (
                                                <Badge
                                                    key={m}
                                                    variant="outline"
                                                    className="text-[9px] h-4 font-bold border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400 px-1 py-0"
                                                >
                                                    {getFriendlyName(m)}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {analysis.phase2?.discoveries?.map((d: Discovery) => (
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
                                                    {t('insights.pem_analysis.phase2.peak_deviation')}
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
                                {t('insights.pem_analysis.phase3.title')}
                            </div>
                            <div className="flex gap-4 text-[10px] font-bold uppercase text-muted-foreground">
                                <div className="flex items-center gap-1.5" title="The period where you were actively logging a crash.">
                                    <span className="w-2 h-2 rounded-full bg-blue-400 opacity-60" />
                                    {t('insights.pem_analysis.phase3.subjective', { val: analysis.phase3?.avgSymptomRecoveryTail.toFixed(1) || '0' })}
                                </div>
                                <div className="flex items-center gap-1.5" title="The period where your body remained in a strained state.">
                                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                                    {t('insights.pem_analysis.phase3.biological', { val: analysis.phase3?.avgBiologicalRecoveryTail.toFixed(1) || '0' })}
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="space-y-4">
                            <div className="flex items-baseline justify-between mb-2">
                                <h3 className="text-xl font-black text-blue-600 dark:text-blue-400 leading-none uppercase tracking-tighter">
                                    {(analysis.phase3?.avgBiologicalRecoveryTail ?? 0) > (analysis.phase3?.avgSymptomRecoveryTail ?? 0) ? t('insights.pem_analysis.phase3.lag') : t('insights.pem_analysis.phase3.fast')}
                                </h3>
                                <div className="text-right">
                                    <div className="text-xs font-bold text-muted-foreground uppercase flex items-center justify-end gap-1.5">
                                        {(analysis.phase3?.hysteresisGap ?? 0) > 1
                                            ? t('insights.pem_analysis.phase3.body_lag', { val: analysis.phase3?.hysteresisGap?.toFixed(1) || '0' })
                                            : t('insights.pem_analysis.phase3.body_reset')}
                                        <TooltipProvider>
                                            <InfoTooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="w-3.5 h-3.5 opacity-50 hover:opacity-100 cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-[250px] text-[11px]">
                                                    <p className="font-bold mb-1">{t('insights.pem_analysis.phase3.hysteresis_title')}</p>
                                                    <p>{t('insights.pem_analysis.phase3.hysteresis_desc')}</p>
                                                </TooltipContent>
                                            </InfoTooltip>
                                        </TooltipProvider>
                                    </div>
                                </div>
                            </div>

                            {(analysis.phase3?.slowestRecoverers?.length ?? 0) > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {analysis.phase3?.slowestRecoverers?.map((m: string) => (
                                        <div key={m} className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-900/30 rounded-xl p-3 relative group">
                                            <div className="absolute top-3 right-3">
                                                <Badge variant="outline" className="text-[8px] font-black border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 uppercase px-1.5 py-0">
                                                    {t('insights.pem_analysis.phase3.slowest')}
                                                </Badge>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5">
                                                    <TooltipProvider>
                                                        <InfoTooltip>
                                                            <TooltipTrigger asChild>
                                                                <div className="p-1.5 bg-white dark:bg-zinc-900 border border-blue-100 dark:border-blue-800 rounded-lg shadow-sm cursor-help">
                                                                    <Info className="w-3 h-3 text-blue-500" />
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="max-w-[200px] text-[10px]">
                                                                <p>This metric takes an average of {analysis.phase3?.avgBiologicalRecoveryTail?.toFixed(1)} days to return to your normal range after a crash starts.</p>
                                                            </TooltipContent>
                                                        </InfoTooltip>
                                                    </TooltipProvider>
                                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{getFriendlyName(m)}</span>
                                                </div>
                                                <span className="text-xl font-black text-blue-700 dark:text-blue-500 tracking-tighter">
                                                    +{analysis.phase3?.avgBiologicalRecoveryTail?.toFixed(1)} <span className="text-[10px] uppercase text-blue-500/60 font-bold ml-1">{t('insights.pem_analysis.phase3.days_tail')}</span>
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

            </div>
            <p className="text-xs text-muted-foreground text-center pt-2 max-w-2xl mx-auto">
                {t('insights.pem_analysis.footer', { count: analysis.episodeCount?.toString() || '0' })
                    .split(/\*\*(.*?)\*\*/)
                    .map((part, i) => i % 2 === 1 ? <strong key={i} className="font-bold">{part}</strong> : part)}
            </p>
        </div>
    )
}
