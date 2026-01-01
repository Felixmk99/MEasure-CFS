'use client'

import React from 'react'
import { CorrelationResult } from '@/lib/stats/insights-logic'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface CorrelationMatrixProps {
    correlations: CorrelationResult[]
}

export function CorrelationMatrix({ correlations }: CorrelationMatrixProps) {
    // Extract unique labels for axes
    const labels = Array.from(new Set(correlations.map(c => c.metricA))).sort().slice(0, 10) // Limit to 10 for readability

    if (labels.length === 0) return null

    return (
        <Card className="overflow-hidden border-none shadow-xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl">
            <CardHeader>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500 bg-clip-text text-transparent">
                    Symptom Correlation Heatmap
                </CardTitle>
                <CardDescription>
                    Identifies which symptoms typically occur together. Darker colors indicate stronger relationships.
                </CardDescription>
            </CardHeader>
            <CardContent>
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
                                    // Handle symmetry just in case, though usually both are generated
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
                                                const r = corrMap.get(`${rowLabel}:${colLabel}`) ?? 0
                                                const intensity = Math.abs(r)

                                                return (
                                                    <TooltipProvider key={`${rowLabel}-${colLabel}`}>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <div
                                                                    className={cn(
                                                                        "aspect-square rounded-sm transition-all hover:scale-110 cursor-help",
                                                                        intensity < 0.2
                                                                            ? "bg-zinc-100 dark:bg-zinc-800"
                                                                            : r > 0 ? "bg-primary" : "bg-destructive"
                                                                    )}
                                                                    style={{ opacity: intensity < 0.2 ? 1 : intensity }}
                                                                />
                                                            </TooltipTrigger>
                                                            <TooltipContent className="backdrop-blur-md bg-white/90 dark:bg-zinc-900/90 border-zinc-200 dark:border-zinc-800">
                                                                <p className="text-xs font-medium">{rowLabel.replaceAll('_', ' ')} vs {colLabel.replaceAll('_', ' ')}</p>
                                                                <p className="text-[10px] text-muted-foreground">Correlation: {r.toFixed(2)}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                )
                                            })}
                                        </React.Fragment>
                                    ))}
                                </>
                            )
                        })()}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
