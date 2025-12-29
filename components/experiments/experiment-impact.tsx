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
    if (m === 'composite_score') return "MEasure-CFS Score"

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

    const priority = ['composite_score', 'hrv', 'resting_heart_rate', 'symptom_score'];

    // 1. Filter: Only show significant (p < 0.05)
    const relevantImpacts = impacts.filter(i => i.pValue < 0.05);

    if (relevantImpacts.length === 0) {
        return (
            <div className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg text-xs text-muted-foreground italic">
                <Info className="w-3.5 h-3.5" />
                No statistically significant impacts detected for this experiment yet.
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
                } else if (impact.pValue < 0.20) {
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
                                            <Badge variant="outline" className={cn(
                                                "text-[9px] font-bold uppercase",
                                                isPositive && "border-green-500/20 text-green-600",
                                                isNegative && "border-red-500/20 text-red-600",
                                                isNeutral && "border-zinc-500/20 text-zinc-500",
                                                sigColor
                                            )}>
                                                {sigLabel}
                                            </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">
                                            <p className="text-xs">p-value: {impact.pValue.toFixed(3)}</p>
                                            {impact.pValue < 0.05 ? (
                                                <p className="text-[10px] opacity-70">Highly likely to be a real effect (95% confidence).</p>
                                            ) : impact.pValue < 0.20 ? (
                                                <p className="text-[10px] opacity-70">Suggested trend, but more data may be needed.</p>
                                            ) : (
                                                <p className="text-[10px] opacity-70">Not statistically significant.</p>
                                            )}
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
