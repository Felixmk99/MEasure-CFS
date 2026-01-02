'use client'

import React from 'react'
import { CorrelationResult } from '@/lib/stats/insights-logic'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

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

function getStrengthLabel(intensity: number) {
    if (intensity > 0.7) return 'Strong'
    if (intensity > 0.5) return 'Moderate'
    if (intensity > 0.3) return 'Weak'
    return 'Very Weak'
}

export function CorrelationMatrix({ correlations }: CorrelationMatrixProps) {
    // Extract unique labels and filter to only show metrics with significant correlations
    const allUniqueLabels = Array.from(new Set(correlations.flatMap(c => [c.metricA, c.metricB]))).sort()

    // Filter to only show metrics that have at least one correlation > 0.3
    const significantLabels = allUniqueLabels.filter(metric => {
        return correlations.some(c =>
            (c.metricA === metric || c.metricB === metric) &&
            c.lag === 0 &&
            Math.abs(c.coefficient) > 0.3
        )
    })

    const labels = significantLabels.slice(0, 10) // Limit to 10 for readability
    const isTruncated = significantLabels.length > 10

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
                            Symptom Correlation Heatmap <span className="text-xs font-normal text-muted-foreground ml-2">(Lag = 0)</span>
                        </CardTitle>
                        <CardDescription>
                            Identifies same-day relationships between symptoms. Green = positive correlation, Red = negative correlation.
                        </CardDescription>
                    </div>
                    {isTruncated && (
                        <Badge variant="outline" className="text-[10px] bg-zinc-100/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800">
                            Showing {labels.length} of {significantLabels.length} metrics
                        </Badge>
                    )}
                </div>

                {/* Color Legend */}
                <div className="mt-4 flex items-center gap-4 text-xs">
                    <span className="text-muted-foreground font-medium">Legend:</span>
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Strong Negative</span>
                        <div className="flex gap-0.5">
                            <div className="w-4 h-4 bg-red-600 rounded-sm" />
                            <div className="w-4 h-4 bg-red-400 rounded-sm" />
                            <div className="w-4 h-4 bg-gray-100 dark:bg-gray-800 rounded-sm" />
                            <div className="w-4 h-4 bg-green-400 rounded-sm" />
                            <div className="w-4 h-4 bg-green-600 rounded-sm" />
                        </div>
                        <span className="text-muted-foreground">Strong Positive</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <TooltipProvider delayDuration={200}>
                    <div className="overflow-x-auto p-4">
                        <div className="inline-grid gap-1" style={{
                            gridTemplateColumns: `auto repeat(${labels.length}, 1fr)`,
                            minWidth: '500px'
                        }}>
                            {/* Header Row */}
                            <div />
                            {labels.map(l => (
                                <div key={l} className="text-[10px] md:text-xs font-medium text-muted-foreground rotate-45 h-20 flex items-end pb-2 px-1 truncate max-w-20">
                                    {l.replaceAll('_', ' ')}
                                </div>
                            ))}

                            {/* Rows */}
                            {labels.map(rowLabel => (
                                <React.Fragment key={rowLabel}>
                                    <div className="text-[10px] md:text-xs font-medium text-muted-foreground flex items-center pr-2 truncate max-w-24">
                                        {rowLabel.replaceAll('_', ' ')}
                                    </div>
                                    {labels.map(colLabel => {
                                        const coefficient = corrMap.get(`${rowLabel}:${colLabel}`)
                                        const isDiagonal = rowLabel === colLabel
                                        const isMissing = coefficient === undefined && !isDiagonal
                                        const r = coefficient ?? (isDiagonal ? 1 : 0)
                                        const intensity = Math.abs(r)

                                        return (
                                            <Tooltip key={`${rowLabel}-${colLabel}`}>
                                                <TooltipTrigger asChild>
                                                    <div
                                                        className={cn(
                                                            "aspect-square rounded-sm transition-all hover:scale-110 cursor-help",
                                                            isMissing
                                                                ? "bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/20 dark:border-zinc-700/20"
                                                                : getCorrelationColor(r, intensity)
                                                        )}
                                                        style={{
                                                            opacity: isMissing ? 0.3 : (intensity < 0.2 ? 0.5 : 1)
                                                        }}
                                                    />
                                                </TooltipTrigger>
                                                <TooltipContent className="backdrop-blur-md bg-white/90 dark:bg-zinc-900/90 border-zinc-200 dark:border-zinc-800">
                                                    <p className="text-xs font-medium">{rowLabel.replaceAll('_', ' ')} vs {colLabel.replaceAll('_', ' ')}</p>
                                                    {isMissing ? (
                                                        <p className="text-[10px] text-muted-foreground">Insufficient Data</p>
                                                    ) : (
                                                        <>
                                                            <p className="text-[10px] text-muted-foreground">
                                                                Correlation: {r.toFixed(2)} ({getStrengthLabel(intensity)})
                                                            </p>
                                                            <p className="text-[10px] text-muted-foreground">
                                                                {r > 0 ? 'Positive' : r < 0 ? 'Negative' : 'Neutral'} relationship
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
