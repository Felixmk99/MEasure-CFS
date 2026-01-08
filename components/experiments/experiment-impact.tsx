'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus, Info, Heart, Activity, Target, Moon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { ExperimentImpact } from "@/lib/statistics/experiment-analysis"
import { useLanguage } from "@/components/providers/language-provider"
import { getMetricRegistryConfig } from "@/lib/metrics/registry"

interface ExperimentImpactProps {
    impacts: ExperimentImpact[]
}

export const getMetricIcon = (metric: string) => {
    const m = metric.toLowerCase();
    if (m.includes('hrv')) return <Heart className="w-3.5 h-3.5" />
    if (m.includes('heart') || m.includes('rhr')) return <Heart className="w-3.5 h-3.5" />
    if (m.includes('symptom') || m.includes('score')) return <Activity className="w-3.5 h-3.5" />
    if (m.includes('step')) return <TrendingUp className="w-3.5 h-3.5" />
    if (m.includes('exertion')) return <Target className="w-3.5 h-3.5" />
    if (m.includes('sleep')) return <Moon className="w-3.5 h-3.5" />
    return <Activity className="w-3.5 h-3.5" />
}

export const getFriendlyName = (metric: string, t: (key: string) => string) => {
    const m = metric.toLowerCase();
    const registry = getMetricRegistryConfig(metric);

    // Try to find in dashboard config first
    if (m === 'hrv') return t('dashboard.metrics.hrv.label');
    if (m === 'resting_heart_rate' || m === 'rhr') return t('dashboard.metrics.resting_heart_rate.label');
    if (m === 'symptom_score') return t('dashboard.metrics.composite_score.label');
    if (m === 'composite_score') return t('dashboard.metrics.adjusted_score.label');

    // Check for explicit dictionary match
    const dashLabel = t(`dashboard.metrics.${m}.label`)
    if (dashLabel && !dashLabel.includes('dashboard.metrics')) return dashLabel

    // Use registry label if it differs from the metric ID (indicating a rename)
    if (registry.label && registry.label !== metric) return registry.label;

    // Fallback: Title Case
    return metric
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export function ExperimentImpactResults({ impacts }: ExperimentImpactProps) {
    const { t } = useLanguage()

    if (impacts.length === 0) {
        return (
            <div className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg text-xs text-muted-foreground italic">
                <Info className="w-3.5 h-3.5" />
                {t('experiments.impact.insufficient')}
            </div>
        )
    }

    // 1. Filter: Only show significant or likely trends (p < 0.15)
    const relevantImpacts = impacts.filter(i => i.pValue < 0.15);

    if (relevantImpacts.length === 0) {
        return (
            <div className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg text-xs text-muted-foreground italic">
                <Info className="w-3.5 h-3.5" />
                {t('experiments.impact.no_significant')}
            </div>
        )
    }

    const sortedImpacts = [...relevantImpacts].sort((a, b) => {
        // Sort by absolute magnitude of change descending
        return Math.abs(b.percentChange) - Math.abs(a.percentChange);
    });

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {sortedImpacts.map((impact) => {
                const isPositive = impact.significance === 'positive'
                const isNegative = impact.significance === 'negative'
                const isNeutral = impact.significance === 'neutral'

                // Statistical significance labels
                let sigLabel = t(`experiments.impact.significance.neutral`)
                if (impact.pValue < 0.05) {
                    sigLabel = t(`experiments.impact.significance.significant`) || "Significant"
                } else if (impact.pValue < 0.15) {
                    sigLabel = t(`experiments.impact.significance.trend`) || "Trend"
                }

                const sigColor = impact.pValue < 0.05 ? "opacity-100" : "opacity-70"

                return (
                    <Card key={impact.metric} className={cn(
                        "bg-background/40 border transition-colors relative overflow-hidden",
                        isPositive && "border-green-500/20 hover:border-green-500/40",
                        isNegative && "border-red-500/20 hover:border-red-500/40",
                        isNeutral && "border-zinc-500/10 hover:border-zinc-500/20"
                    )}>
                        <CardContent className="p-3">
                            <div className="flex items-center justify-between mb-2">
                                <div className={cn(
                                    "p-1.5 rounded-lg",
                                    isPositive && "bg-green-500/10 text-green-600",
                                    isNegative && "bg-red-500/10 text-red-600",
                                    isNeutral && "bg-zinc-500/10 text-zinc-600"
                                )}>
                                    {getMetricIcon(impact.metric)}
                                </div>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex flex-col items-end gap-1">
                                                <Badge variant="outline" className={cn(
                                                    "text-[9px] font-bold uppercase py-0 px-1.5 h-4 border-transparent",
                                                    isPositive && "bg-green-500/10 text-green-600",
                                                    isNegative && "bg-red-500/10 text-red-600",
                                                    isNeutral && "bg-zinc-500/10 text-zinc-500",
                                                    sigColor
                                                )}>
                                                    {sigLabel}
                                                </Badge>
                                                {impact.effectSize && impact.effectSize !== 'not_significant' && (
                                                    <span className="text-[7px] font-black uppercase text-muted-foreground/50 tracking-tighter">
                                                        {impact.effectSize} Effect
                                                    </span>
                                                )}
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="p-3 space-y-2">
                                            <div className="space-y-1">
                                                <p className="text-xs font-bold">Statistical Profile</p>
                                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                                                    <span className="text-muted-foreground">P-Value:</span>
                                                    <span className="font-mono">{impact.pValue.toFixed(4)}</span>
                                                    <span className="text-muted-foreground">Effect Size (d):</span>
                                                    <span className="font-mono">{impact.zScoreShift.toFixed(2)}</span>
                                                    <span className="text-muted-foreground">Deg. Freedom:</span>
                                                    <span className="font-mono">{impact.df || 'N/A'}</span>
                                                </div>
                                            </div>
                                            <div className="border-t pt-2 mt-2">
                                                {impact.pValue < 0.05 ? (
                                                    <p className="text-[10px] opacity-70 leading-relaxed font-medium">{t('experiments.impact.high_confidence_desc')}</p>
                                                ) : impact.pValue < 0.15 ? (
                                                    <p className="text-[10px] opacity-70 leading-relaxed font-medium">{t('experiments.impact.trend_desc')}</p>
                                                ) : (
                                                    <p className="text-[10px] opacity-70 leading-relaxed font-medium">{t('experiments.impact.not_significant_desc')}</p>
                                                )}
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>

                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight truncate">
                                    {getFriendlyName(impact.metric, t)}
                                </p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-sm font-black text-foreground leading-none">
                                        {impact.percentChange > 0 ? '+' : ''}{impact.percentChange.toFixed(1)}
                                    </span>
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase">%</span>
                                </div>
                            </div>

                            {/* Signal Indicator */}
                            <div className={cn(
                                "absolute bottom-1 right-1 opacity-20",
                                "text-muted-foreground", // Default
                                isPositive && "text-green-500",
                                isNegative && "text-red-500",
                                isNeutral && "text-zinc-500"
                            )}>
                                {isPositive ? <TrendingUp className="w-3 h-3" /> : isNegative ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
