'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus, Info, Heart, Activity, Target, Moon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { ExperimentImpact } from "@/lib/statistics/experiment-analysis"
import { useLanguage } from "@/components/providers/language-provider"
import { useMetricTranslation } from "@/lib/i18n/helpers"

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

export function ExperimentImpactResults({ impacts }: ExperimentImpactProps) {
    const { t } = useLanguage()
    const tMetric = useMetricTranslation()

    if (impacts.length === 0) {
        return (
            <div className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-lg text-xs text-muted-foreground italic">
                <Info className="w-3.5 h-3.5" />
                {t('experiments.impact.insufficient')}
            </div>
        )
    }

    // 1. Filter: Only show significant results (p < 0.05)
    const relevantImpacts = impacts.filter(i => i.pValue < 0.05);

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
                                                    "text-[9px] font-bold uppercase py-0 px-1.5 h-4 border-transparent shadow-sm",
                                                    isPositive && "bg-green-500/10 text-green-600",
                                                    isNegative && "bg-red-500/10 text-red-600",
                                                    isNeutral && "bg-zinc-500/10 text-zinc-500",
                                                    sigColor
                                                )}>
                                                    {sigLabel}
                                                </Badge>
                                                {impact.effectSize && impact.effectSize !== 'not_significant' && (
                                                    <div className="flex items-center gap-1 group/effect cursor-help mt-1">
                                                        <span className={cn(
                                                            "text-[8px] font-black uppercase tracking-tighter transition-all px-1.5 py-0.5 rounded-md",
                                                            "bg-zinc-100/50 dark:bg-zinc-800/50 text-muted-foreground group-hover/effect:bg-primary/10 group-hover/effect:text-primary"
                                                        )}>
                                                            {t(`experiments.impact.effect_sizes.${impact.effectSize}`)}
                                                        </span>
                                                        <Info className="w-2.5 h-2.5 text-muted-foreground/40 group-hover/effect:text-primary transition-colors" />
                                                    </div>
                                                )}
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="p-4 w-56 space-y-3 bg-white/95 dark:bg-zinc-950 backdrop-blur-md border shadow-xl">
                                            <div className="space-y-1.5">
                                                <p className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                                                    <Target className="w-3.5 h-3.5 text-primary" />
                                                    {t('experiments.impact.statistical_profile')}
                                                </p>
                                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] bg-zinc-50/50 dark:bg-zinc-900/50 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800">
                                                    <span className="text-muted-foreground font-medium">{t('experiments.impact.p_value')}:</span>
                                                    <span className="font-mono font-bold text-right">{impact.pValue.toFixed(4)}</span>
                                                    <span className="text-muted-foreground font-medium">{t('experiments.impact.z_score_label')}:</span>
                                                    <span className="font-mono font-bold text-right">{impact.tStat?.toFixed(2) ?? 'N/A'}</span>
                                                    <span className="text-muted-foreground font-medium">{t('experiments.impact.deg_freedom')}:</span>
                                                    <span className="font-mono font-bold text-right">{impact.df || 'N/A'}</span>
                                                </div>
                                            </div>
                                            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-2.5">
                                                {impact.pValue < 0.05 ? (
                                                    <div className="flex gap-2">
                                                        <div className="w-1 h-auto bg-green-500 rounded-full" />
                                                        <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">{t('experiments.impact.high_confidence_desc')}</p>
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <div className="w-1 h-auto bg-amber-500 rounded-full" />
                                                        <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">{t('experiments.impact.trend_desc')}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>

                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight truncate">
                                    {tMetric(impact.metric)}
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
