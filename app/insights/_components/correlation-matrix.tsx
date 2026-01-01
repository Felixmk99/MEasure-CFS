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

export function CorrelationMatrix({ correlations }: CorrelationMatrixProps) {
    // Extract unique labels for axes - checking both dimensions for completeness
    const allUniqueLabels = Array.from(new Set(correlations.flatMap(c => [c.metricA, c.metricB]))).sort()
    const labels = allUniqueLabels.slice(0, 10) // Limit to 10 for readability
    const isTruncated = allUniqueLabels.length > 10

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
                            Identifies same-day relationships between symptoms. Darker colors indicate stronger connections.
                        </CardDescription>
                    </div>
                    {isTruncated && (
                        <Badge variant="outline" className="text-[10px] bg-zinc-100/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800">
                            Showing {labels.length} of {allUniqueLabels.length} metrics
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <TooltipProvider delayDuration={200}>
                    <div className="overflow-x-auto p-4">
                        <div className="inline-grid gap-1" style={{
                            gridTemplateColumns: `auto repeat(${labels.length}, 1fr)`,
                            minWidth: '500px'
                        }}>
                            {/* Build lookup map for O(1) access */}
                            {(() => {
                                const corrMap = new Map<string, number>()
                                correlations.forEach(c => {
                                    if (c.lag === 0) {
                                        corrMap.set(`${c.metricA}:${c.metricB}`, c.coefficient)
                                        corrMap.set(`${c.metricB}:${c.metricA}`, c.coefficient)
                                    }
                                })

                                return (
                                    <>
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
                                                    const isMissing = coefficient === undefined || (rowLabel === colLabel && coefficient === 0) // Treat self-correlation as identity or missing if not computed
                                                    const r = coefficient ?? (rowLabel === colLabel ? 1 : 0)
                                                    const intensity = Math.abs(r)

                                                    return (
                                                        <Tooltip key={`${rowLabel}-${colLabel}`}>
                                                            <TooltipTrigger asChild>
                                                                <div
                                                                    className={cn(
                                                                        "aspect-square rounded-sm transition-all hover:scale-110 cursor-help",
                                                                        isMissing
                                                                            ? "bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/20 dark:border-zinc-700/20 opacity-30"
                                                                            : intensity < 0.2
                                                                                ? "bg-zinc-100 dark:bg-zinc-800"
                                                                                : r > 0 ? "bg-primary" : "bg-destructive"
                                                                    )}
                                                                    style={{
                                                                        opacity: isMissing ? 0.3 : (intensity < 0.2 ? 1 : intensity)
                                                                    }}
                                                                />
                                                            </TooltipTrigger>
                                                            <TooltipContent className="backdrop-blur-md bg-white/90 dark:bg-zinc-900/90 border-zinc-200 dark:border-zinc-800">
                                                                <p className="text-xs font-medium">{rowLabel.replaceAll('_', ' ')} vs {colLabel.replaceAll('_', ' ')}</p>
                                                                <p className="text-[10px] text-muted-foreground">
                                                                    {isMissing ? "Insufficient Data" : `Correlation: ${r.toFixed(2)}`}
                                                                </p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    )
                                                })}
                                            </React.Fragment>
                                        ))}
                                    </>
                                )
                            })()}
                        </div>
                    </div>
                </TooltipProvider>
            </CardContent>
        </Card>
    )
}
