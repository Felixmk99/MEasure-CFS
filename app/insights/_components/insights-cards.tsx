'use client'

import React from 'react'
import { CorrelationResult, ThresholdInsight } from '@/lib/stats/insights-logic'
import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Zap, Info, ShieldCheck, Timer, TrendingUp, TrendingDown, Calendar } from 'lucide-react'
import { useLanguage } from '@/components/providers/language-provider'

import { useMetricTranslation } from '@/lib/i18n/helpers'

interface InsightsCardsProps {
    correlations: CorrelationResult[]
    thresholds: ThresholdInsight[]
}

// Helper for rounding/formatting numbers
function formatNumber(value: number, locale: string): string {
    if (value >= 1000) return Math.round(value).toLocaleString(locale);
    if (value >= 10) return Math.round(value).toString();
    return value.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}



export function InsightsCards({ correlations, thresholds }: InsightsCardsProps) {
    const { t, locale } = useLanguage()
    const tMetric = useMetricTranslation()

    const formatDescription = (c: CorrelationResult) => {
        const emoji = c.isGood ? '✅' : '⚠️';

        const metricAName = tMetric(c.metricA);
        const metricBName = tMetric(c.metricB);

        const direction = c.coefficient < 0 ? t('insights.logic.reduces') : t('insights.logic.increases');

        // Recommendation: "{metric} > {value}"
        const recommendation = `${emoji} ${t('insights.logic.recommendation_pattern', {
            metric: metricAName,
            value: formatNumber(c.medianA, locale)
        })}`;

        const impact = `${direction} ${metricBName} ${t('insights.logic.by')} ${Math.round(c.percentChange)}% (${t('insights.logic.from')} ${formatNumber(c.typicalValue, locale)} ${t('insights.logic.to')} ${formatNumber(c.improvedValue, locale)})`;

        const stats = `(${t('experiments.impact.p_value')}: ${c.pValue.toFixed(3)}, N=${c.sampleSize})`;

        return `${recommendation}\n→ ${impact}\n${stats}`;
    }

    const formatThresholdDescription = (ti: ThresholdInsight) => {
        return t('insights.logic.threshold_desc', {
            limit: formatNumber(ti.safeZoneLimit, locale),
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
        const bgGradient = c.isGood
            ? 'from-green-50 to-white dark:from-green-950/20 dark:to-zinc-900 border-l-green-500'
            : 'from-red-50 to-white dark:from-red-950/20 dark:to-zinc-900 border-l-red-500';
        const iconBg = c.isGood
            ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
            : 'bg-red-100 dark:bg-red-900/30 text-red-600';

        const Icon = c.lag === 0 ? Zap : Timer;
        const titleKey = c.isGood
            ? (c.lag === 0 ? 'insights.patterns.cards.impact.helpful_connection' : 'insights.patterns.cards.impact.helpful_pattern')
            : (c.lag === 0 ? 'insights.patterns.cards.impact.direct' : 'insights.patterns.cards.impact.high_warning');

        return (
            <motion.div
                key={`correlation-${c.lag}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: baseDelay + i * 0.1 }}
            >
                <Card className={`h-full border-none shadow-lg bg-gradient-to-br ${bgGradient} border-l-4`}>
                    <CardContent className="p-4 sm:pt-6">
                        <div className="flex items-start gap-3 sm:gap-4">
                            <div className={`p-1.5 sm:p-2 rounded-lg ${iconBg} shrink-0`}>
                                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4 mb-2">
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 min-w-0">
                                        <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                                            {t(titleKey as string)}
                                        </h3>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {c.pValue < 0.05 && (
                                                <div className="px-1.5 py-0.5 rounded text-[10px] bg-primary/10 text-primary font-bold uppercase tracking-wider">
                                                    {t('experiments.impact.high_confidence')}
                                                </div>
                                            )}
                                            {(() => {
                                                const trendColor = c.isGood ? 'text-green-500' : 'text-red-500';
                                                return c.coefficient > 0 ? (
                                                    <TrendingUp className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${trendColor}`} />
                                                ) : (
                                                    <TrendingDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${trendColor}`} />
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed whitespace-pre-line break-words">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
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
