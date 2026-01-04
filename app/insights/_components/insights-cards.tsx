'use client'

import React from 'react'
import { CorrelationResult, ThresholdInsight } from '@/lib/stats/insights-logic'
import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Zap, Info, ShieldCheck, Timer, TrendingUp, TrendingDown, Calendar } from 'lucide-react'
import { useLanguage } from '@/components/providers/language-provider'

interface InsightsCardsProps {
    correlations: CorrelationResult[]
    thresholds: ThresholdInsight[]
}

// Helper for rounding/formatting numbers
function formatNumber(value: number): string {
    if (value >= 1000) return Math.round(value).toLocaleString();
    if (value >= 10) return Math.round(value).toString();
    return value.toFixed(1);
}

// Lag badge component
function LagBadge({ lag }: { lag: number }) {
    const { t } = useLanguage()
    const badges = {
        0: { icon: '⚡', text: t('insights.patterns.cards.today'), color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
        1: { icon: '📅', text: t('insights.patterns.cards.plus_1_day'), color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
        2: { icon: '📅', text: t('insights.patterns.cards.plus_2_days'), color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' }
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
    const { t } = useLanguage()

    const tMetric = (key: string) => {
        const normalizedKey = key.toLowerCase().replaceAll('_', ' ');
        const dictionaryKey = `metrics.${key.toLowerCase()}` as string;
        const translated = t(dictionaryKey);
        if (translated !== dictionaryKey) return translated;

        const normalizedDictionaryKey = `metrics.${normalizedKey}` as string;
        const normTranslated = t(normalizedDictionaryKey);
        if (normTranslated !== normalizedDictionaryKey) return normTranslated;

        return normalizedKey;
    }

    const formatDescription = (c: CorrelationResult) => {
        const emoji = c.isGood ? '✅' : '⚠️';
        const action = c.isGood ? t('insights.logic.keep') : t('insights.logic.watch');
        const thresholdType = t('insights.logic.above'); // Currently logic always uses 'above' for median

        const metricAName = tMetric(c.metricA);
        const metricBName = tMetric(c.metricB);

        const direction = c.coefficient < 0 ? t('insights.logic.reduces') : t('insights.logic.increases');

        const recommendation = `${emoji} ${action} ${metricAName} ${thresholdType} ${formatNumber(c.medianA)}`;
        const impact = `${direction} ${metricBName} ${t('insights.logic.by')} ${Math.round(c.percentChange)}% (${t('insights.logic.from')} ${formatNumber(c.typicalValue)} ${t('insights.logic.to')} ${formatNumber(c.improvedValue)})`;

        return `${recommendation}\n→ ${impact}`;
    }

    const formatThresholdDescription = (ti: ThresholdInsight) => {
        return t('insights.logic.threshold_desc', {
            limit: formatNumber(ti.safeZoneLimit),
            metric: tMetric(ti.metric),
            impact: tMetric(ti.impactMetric)
        });
    }

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
        const isNegativeImpact = c.coefficient > 0 && (c.metricB.toLowerCase().includes('symptom') || c.metricB.toLowerCase().includes('fatigue'));
        const isPositiveImpact = c.coefficient < 0 && (c.metricB.toLowerCase().includes('symptom') || c.metricB.toLowerCase().includes('fatigue'));
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
        const titleKey = isNegativeImpact
            ? (c.lag === 0 ? 'insights.patterns.cards.impact.direct' : 'insights.patterns.cards.impact.high_warning')
            : isPositiveImpact
                ? (c.lag === 0 ? 'insights.patterns.cards.impact.helpful_connection' : 'insights.patterns.cards.impact.helpful_pattern')
                : (c.lag === 0 ? 'insights.patterns.cards.impact.direct_connection' : 'insights.patterns.cards.impact.hidden_lag');

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
                                            {t(titleKey as string)}
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
                                    {formatDescription(c)}
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
                        {t('insights.patterns.safe_zones')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {thresholds.map((ti, i) => (
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
                                                <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{t('insights.patterns.safe_zone_detected')}</h3>
                                                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                                                    {formatThresholdDescription(ti)}
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
                        {t('insights.patterns.same_day')}
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
                        {t('insights.patterns.next_day')}
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
                        {t('insights.patterns.two_day')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lag2.map((c, i) => renderCorrelationCard(c, i, currentDelay))}
                    </div>
                </section>
            )}

            {thresholds.length === 0 && lag0.length === 0 && lag1.length === 0 && lag2.length === 0 && (
                <div className="col-span-full py-12 text-center text-muted-foreground bg-zinc-50 dark:bg-zinc-900/30 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                    <Info className="w-8 h-8 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">{t('insights.patterns.insufficient_data')}</p>
                </div>
            )}
        </div>
    )
}
