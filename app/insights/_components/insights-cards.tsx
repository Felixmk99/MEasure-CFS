'use client'

import React from 'react'
import { CorrelationResult, ThresholdInsight } from '@/lib/stats/insights-logic'
import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Zap, Info, ShieldCheck, Timer, TrendingUp, TrendingDown } from 'lucide-react'

interface InsightsCardsProps {
    correlations: CorrelationResult[]
    thresholds: ThresholdInsight[]
}

export function InsightsCards({ correlations, thresholds }: InsightsCardsProps) {
    // Filter for particularly interesting correlations (strong or lagged)
    const significantLags = correlations.filter(c => c.lag > 0 && Math.abs(c.coefficient) > 0.5).slice(0, 3)
    const strongSimultaneous = correlations.filter(c => c.lag === 0 && Math.abs(c.coefficient) > 0.7).slice(0, 2)

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Threshold Insights (Safe Zones) */}
            {thresholds.map((t, i) => (
                <motion.div
                    key={`threshold-${i}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                >
                    <Card className="h-full border-none shadow-lg bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-zinc-900 border-l-4 border-l-emerald-500">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Safe Zone Detected</h3>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                                        {t.description}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}

            {/* Lag Insights */}
            {significantLags.map((c, i) => {
                const isNegativeImpact = c.coefficient > 0 && (c.metricB.includes('symptom') || c.metricB.includes('fatigue'));
                const isPositiveImpact = c.coefficient < 0 && (c.metricB.includes('symptom') || c.metricB.includes('fatigue'));
                const bgGradient = isNegativeImpact
                    ? 'from-red-50 to-white dark:from-red-950/20 dark:to-zinc-900 border-l-red-500'
                    : isPositiveImpact
                        ? 'from-green-50 to-white dark:from-green-950/20 dark:to-zinc-900 border-l-green-500'
                        : 'from-blue-50 to-white dark:from-blue-950/20 dark:to-zinc-900 border-l-blue-500';
                const iconBg = isNegativeImpact
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600'
                    : isPositiveImpact
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600';

                return (
                    <motion.div
                        key={`lag-${i}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (thresholds.length + i) * 0.1 }}
                    >
                        <Card className={`h-full border-none shadow-lg bg-gradient-to-br ${bgGradient} border-l-4`}>
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className={`p-2 rounded-lg ${iconBg}`}>
                                        <Timer className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
                                                {isNegativeImpact ? 'High Impact Warning' : isPositiveImpact ? 'Helpful Pattern' : 'Hidden Lag Warning'}
                                            </h3>
                                            {c.impactDirection === 'positive' ? (
                                                <TrendingUp className="w-4 h-4 text-red-500" />
                                            ) : (
                                                <TrendingDown className="w-4 h-4 text-green-500" />
                                            )}
                                        </div>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                                            {c.description}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                );
            })}

            {/* Strong Patterns */}
            {strongSimultaneous.map((c, i) => {
                const isNegativeImpact = c.coefficient > 0 && (c.metricB.includes('symptom') || c.metricB.includes('fatigue'));
                const isPositiveImpact = c.coefficient < 0 && (c.metricB.includes('symptom') || c.metricB.includes('fatigue'));
                const bgGradient = isNegativeImpact
                    ? 'from-red-50 to-white dark:from-red-950/20 dark:to-zinc-900 border-l-red-500'
                    : isPositiveImpact
                        ? 'from-green-50 to-white dark:from-green-950/20 dark:to-zinc-900 border-l-green-500'
                        : 'from-indigo-50 to-white dark:from-indigo-950/20 dark:to-zinc-900 border-l-indigo-500';
                const iconBg = isNegativeImpact
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600'
                    : isPositiveImpact
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                        : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600';

                return (
                    <motion.div
                        key={`pattern-${i}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (thresholds.length + significantLags.length + i) * 0.1 }}
                    >
                        <Card className={`h-full border-none shadow-lg bg-gradient-to-br ${bgGradient} border-l-4`}>
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className={`p-2 rounded-lg ${iconBg}`}>
                                        <Zap className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
                                                {isNegativeImpact ? 'Direct Impact' : isPositiveImpact ? 'Helpful Connection' : 'Direct Connection'}
                                            </h3>
                                            {c.impactDirection === 'positive' ? (
                                                <TrendingUp className="w-4 h-4 text-red-500" />
                                            ) : (
                                                <TrendingDown className="w-4 h-4 text-green-500" />
                                            )}
                                        </div>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                                            {c.description}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                );
            })}

            {thresholds.length === 0 && significantLags.length === 0 && strongSimultaneous.length === 0 && (
                <div className="col-span-full py-12 text-center text-muted-foreground bg-zinc-50 dark:bg-zinc-900/30 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                    <Info className="w-8 h-8 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Keep tracking your symptoms to unlock biological insights.</p>
                </div>
            )}
        </div>
    )
}
