'use client'

import React from 'react'
import { CorrelationResult } from '@/lib/stats/insights-logic'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/components/providers/language-provider'

interface CorrelationMatrixProps {
    correlations: CorrelationResult[]
}

// Helper function to get color for correlation
function getCorrelationColor(coefficient: number, intensity: number) {
    if (coefficient > 0) {
        // Positive correlation - GREEN
        if (intensity > 0.7) return 'bg-green-600'
        if (intensity > 0.5) return 'bg-green-500'
        if (intensity > 0.3) return 'bg-green-400'
        return 'bg-green-200'
    } else if (coefficient < 0) {
        // Negative correlation - RED
        if (intensity > 0.7) return 'bg-red-600'
        if (intensity > 0.5) return 'bg-red-500'
        if (intensity > 0.3) return 'bg-red-400'
        return 'bg-red-200'
    }
    return 'bg-gray-100 dark:bg-gray-800'
}

export function CorrelationMatrix({ correlations }: CorrelationMatrixProps) {
    const { t } = useLanguage()

    const tMetric = (key: string) => {
        const strictKey = key.toLowerCase();
        const dictionaryKey = `common.metric_labels.${strictKey}` as string;
        const translated = t(dictionaryKey);
        if (translated !== dictionaryKey && translated) return translated;

        const snakeKey = strictKey.replace(/ /g, '_');
        const snakeDictKey = `common.metric_labels.${snakeKey}` as string;
        const snakeTranslated = t(snakeDictKey);
        if (snakeTranslated !== snakeDictKey && snakeTranslated) return snakeTranslated;

        return strictKey.replaceAll('_', ' ');
    }

    const getStrengthLabel = (intensity: number) => {
        if (intensity > 0.7) return t('insights.clusters.heatmap.strength.strong')
        if (intensity > 0.5) return t('insights.clusters.heatmap.strength.moderate')
        if (intensity > 0.3) return t('insights.clusters.heatmap.strength.weak')
        return t('insights.clusters.heatmap.strength.very_weak')
    }

    // Extract unique labels and filter to only show metrics with significant correlations
    const allUniqueLabels = Array.from(new Set(correlations.flatMap(c => [c.metricA, c.metricB]))).sort()

    // Filter to only show metrics that have at least one correlation > 0.3 OR are key metrics
    const significantLabels = allUniqueLabels.filter(metric => {
        const isKeyMetric = ['symptom_score', 'exertion_score', 'adjusted_score'].includes(metric.toLowerCase())
        if (isKeyMetric) return true

        return correlations.some(c =>
            (c.metricA === metric || c.metricB === metric) &&
            c.metricA !== c.metricB && // Exclude self-correlation
            c.lag === 0 &&
            Math.abs(c.coefficient) > 0.35 // Slightly increased threshold for relevance
        )
    })

    const MAX_DISPLAY_METRICS = 15
    const labels = significantLabels.slice(0, MAX_DISPLAY_METRICS)
    const isTruncated = significantLabels.length > MAX_DISPLAY_METRICS

    // Build lookup map for O(1) access
    const corrMap = React.useMemo(() => {
        const map = new Map<string, number>()
        correlations.forEach(c => {
            if (c.lag === 0) {
                map.set(`${c.metricA}:${c.metricB}`, c.coefficient)
                map.set(`${c.metricB}:${c.metricA}`, c.coefficient)
            }
        })
        return map
    }, [correlations])

    if (labels.length === 0) return null

    return (
        <Card className="overflow-hidden border-none shadow-xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500 bg-clip-text text-transparent">
                            {t('insights.clusters.heatmap.title')} <span className="text-xs font-normal text-muted-foreground ml-2">{t('insights.clusters.heatmap.lag_zero')}</span>
                        </CardTitle>
                        <CardDescription>
                            {t('insights.clusters.heatmap.desc')}
                        </CardDescription>
                    </div>
                    {isTruncated && (
                        <Badge variant="outline" className="text-[10px] bg-zinc-100/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800">
                            {t('insights.clusters.heatmap.showing', { count: labels.length, total: significantLabels.length })}
                        </Badge>
                    )}
                </div>

                {/* Color Legend */}
                <div className="mt-4 flex items-center gap-4 text-xs">
                    <span className="text-muted-foreground font-medium">{t('insights.clusters.heatmap.legend')}</span>
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{t('insights.clusters.heatmap.strong_negative')}</span>
                        <div className="flex gap-0.5">
                            <div className="w-4 h-4 bg-red-600 rounded-sm" />
                            <div className="w-4 h-4 bg-red-400 rounded-sm" />
                            <div className="w-4 h-4 bg-gray-100 dark:bg-gray-800 rounded-sm" />
                            <div className="w-4 h-4 bg-green-400 rounded-sm" />
                            <div className="w-4 h-4 bg-green-600 rounded-sm" />
                        </div>
                        <span className="text-muted-foreground">{t('insights.clusters.heatmap.strong_positive')}</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <TooltipProvider delayDuration={200}>
                    <div className="w-full overflow-x-auto p-2 md:p-6 flex justify-center">
                        <div className="grid gap-[1px] w-fit" style={{
                            gridTemplateColumns: `auto repeat(${labels.length}, minmax(28px, 48px))`,
                        }}>
                            {/* Header Row */}
                            <div />
                            {labels.map(l => (
                                <div key={l} className="relative h-[120px] w-full">
                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 origin-bottom-left rotate-45 transform w-[140px]">
                                        <span className="text-xs font-medium text-foreground truncate block w-full px-1">
                                            {tMetric(l)}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {/* Rows */}
                            {labels.map(rowLabel => (
                                <React.Fragment key={rowLabel}>
                                    <div className="text-[9px] sm:text-[10px] font-medium text-muted-foreground flex items-center justify-end pr-3 truncate text-right leading-tight py-0.5">
                                        {tMetric(rowLabel)}
                                    </div>
                                    {labels.map(colLabel => {
                                        const coefficient = corrMap.get(`${rowLabel}:${colLabel}`)
                                        const isDiagonal = rowLabel === colLabel
                                        const isMissing = (coefficient === undefined && !isDiagonal) || isDiagonal
                                        const r = coefficient ?? 0
                                        const intensity = Math.abs(r)

                                        return (
                                            <Tooltip key={`${rowLabel}-${colLabel}`}>
                                                <TooltipTrigger asChild>
                                                    <div
                                                        className={cn(
                                                            "aspect-square rounded-[1px] transition-all hover:scale-110 relative z-0 hover:z-10",
                                                            isMissing
                                                                ? "bg-zinc-50 dark:bg-zinc-900"
                                                                : getCorrelationColor(r, intensity)
                                                        )}
                                                        style={{
                                                            opacity: isMissing ? 0.3 : (intensity < 0.2 ? 0.5 : 1),
                                                            cursor: isMissing ? 'default' : 'help'
                                                        }}
                                                    />
                                                </TooltipTrigger>
                                                <TooltipContent className="backdrop-blur-md bg-white/90 dark:bg-zinc-900/90 border-zinc-200 dark:border-zinc-800">
                                                    <p className="text-xs font-medium">{tMetric(rowLabel)} vs {tMetric(colLabel)}</p>
                                                    {isMissing ? (
                                                        <p className="text-[10px] text-muted-foreground">{t('insights.clusters.heatmap.insufficient')}</p>
                                                    ) : (
                                                        <>
                                                            <p className="text-[10px] text-muted-foreground">
                                                                {t('insights.clusters.heatmap.correlation')}: {r.toFixed(2)} ({getStrengthLabel(intensity)})
                                                            </p>
                                                            <p className="text-[10px] text-muted-foreground">
                                                                {r > 0 ? t('insights.clusters.heatmap.relation.positive') : r < 0 ? t('insights.clusters.heatmap.relation.negative') : t('insights.clusters.heatmap.relation.neutral')} {t('insights.clusters.heatmap.relation.suffix')}
                                                            </p>
                                                        </>
                                                    )}
                                                </TooltipContent>
                                            </Tooltip>
                                        )
                                    })}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </TooltipProvider>
            </CardContent>
        </Card>
    )
}
