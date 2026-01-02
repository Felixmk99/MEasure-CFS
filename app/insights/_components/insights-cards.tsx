'use client'

import React from 'react'
import { CorrelationResult, ThresholdInsight } from '@/lib/stats/insights-logic'
import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Zap, Info, ShieldCheck, Timer, TrendingUp, TrendingDown, Calendar } from 'lucide-react'

interface InsightsCardsProps {
    correlations: CorrelationResult[]
    thresholds: ThresholdInsight[]
}

// Lag badge component
function LagBadge({ lag }: { lag: number }) {
    const badges = {
        0: { icon: '⚡', text: 'Today', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
        1: { icon: '📅', text: '+1 Day', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
        2: { icon: '📅', text: '+2 Days', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' }
    }

    const badge = badges[lag as keyof typeof badges] || badges[0]

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
            <span>{badge.icon}</span>
            <span>{badge.text}</span>
        </span>
    )
}

export function InsightsCards({ correlations, thresholds }: InsightsCardsProps) {
    // Group correlations by lag and sort by strength
    const sortByStrength = (a: CorrelationResult, b: CorrelationResult) =>
        Math.abs(b.coefficient) - Math.abs(a.coefficient)

    const lag0 = correlations
        .filter(c => c.lag === 0 && Math.abs(c.coefficient) > 0.5)
        .sort(sortByStrength)
        .slice(0, 4)

    const lag1 = correlations
        .filter(c => c.lag === 1 && Math.abs(c.coefficient) > 0.4)
        .sort(sortByStrength)
        .slice(0, 6)

    const lag2 = correlations
        .filter(c => c.lag === 2 && Math.abs(c.coefficient) > 0.4)
        .sort(sortByStrength)
        .slice(0, 6)

    const renderCorrelationCard = (c: CorrelationResult, i: number, baseDelay: number) => {
        const isNegativeImpact = c.coefficient > 0 && (c.metricB.includes('symptom') || c.metricB.includes('fatigue'));
        const isPositiveImpact = c.coefficient < 0 && (c.metricB.includes('symptom') || c.metricB.includes('fatigue'));
        const bgGradient = isNegativeImpact
            ? 'from-red-50 to-white dark:from-red-950/20 dark:to-zinc-900 border-l-red-500'
            : isPositiveImpact
                ? 'from-green-50 to-white dark:from-green-950/20 dark:to-zinc-900 border-l-green-500'
                : c.lag === 0
                    ? 'from-indigo-50 to-white dark:from-indigo-950/20 dark:to-zinc-900 border-l-indigo-500'
                    : 'from-blue-50 to-white dark:from-blue-950/20 dark:to-zinc-900 border-l-blue-500';
        const iconBg = isNegativeImpact
            ? 'bg-red-100 dark:bg-red-900/30 text-red-600'
            : isPositiveImpact
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                : c.lag === 0
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600';

        const Icon = c.lag === 0 ? Zap : Timer;
        const title = isNegativeImpact
            ? (c.lag === 0 ? 'Direct Impact' : 'High Impact Warning')
            : isPositiveImpact
                ? (c.lag === 0 ? 'Helpful Connection' : 'Helpful Pattern')
                : (c.lag === 0 ? 'Direct Connection' : 'Hidden Lag Warning');

        return (
            <motion.div
                key={`correlation-${c.lag}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: baseDelay + i * 0.1 }}
            >
                <Card className={`h-full border-none shadow-lg bg-gradient-to-br ${bgGradient} border-l-4`}>
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-lg ${iconBg}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
                                            {title}
                                        </h3>
                                        {c.coefficient > 0 ? (
                                            <TrendingUp className={`w-4 h-4 ${isNegativeImpact ? 'text-red-500' : isPositiveImpact ? 'text-green-500' : 'text-blue-500'}`} />
                                        ) : (
                                            <TrendingDown className={`w-4 h-4 ${isNegativeImpact ? 'text-red-500' : isPositiveImpact ? 'text-green-500' : 'text-blue-500'}`} />
                                        )}
                                    </div>
                                    <LagBadge lag={c.lag} />
                                </div>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed whitespace-pre-line">
                                    {c.description}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        );
    };

    let currentDelay = 0;

    return (
        <div className="space-y-8">
            {/* Threshold Insights (Safe Zones) */}
            {thresholds.length > 0 && (
                <section>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        Safe Zones
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    </div>
                </section>
            )}

            {(() => { currentDelay = thresholds.length * 0.1; return null; })()}

            {/* Same Day Effects */}
            {lag0.length > 0 && (
                <section>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-indigo-600" />
                        Same Day Effects
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lag0.map((c, i) => renderCorrelationCard(c, i, currentDelay))}
                    </div>
                </section>
            )}

            {(() => { currentDelay += lag0.length * 0.1; return null; })()}

            {/* Next Day Effects */}
            {lag1.length > 0 && (
                <section>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        Next Day Effects
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lag1.map((c, i) => renderCorrelationCard(c, i, currentDelay))}
                    </div>
                </section>
            )}

            {(() => { currentDelay += lag1.length * 0.1; return null; })()}

            {/* 2-Day Delayed Effects */}
            {lag2.length > 0 && (
                <section>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-indigo-600" />
                        2-Day Delayed Effects
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lag2.map((c, i) => renderCorrelationCard(c, i, currentDelay))}
                    </div>
                </section>
            )}

            {thresholds.length === 0 && lag0.length === 0 && lag1.length === 0 && lag2.length === 0 && (
                <div className="col-span-full py-12 text-center text-muted-foreground bg-zinc-50 dark:bg-zinc-900/30 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                    <Info className="w-8 h-8 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Keep tracking your symptoms to unlock biological insights.</p>
                </div>
            )}
        </div>
    )
}
