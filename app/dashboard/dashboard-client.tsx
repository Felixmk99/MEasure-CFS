'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
    ResponsiveContainer,
    ComposedChart,
    Area,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceArea,
    ReferenceLine
} from 'recharts'
import { Activity, TrendingUp, TrendingDown, Minus, Info } from "lucide-react"
import { format, subDays, parseISO } from "date-fns"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from "@/components/ui/switch"
import Link from 'next/link'
import { Label } from "@/components/ui/label"
import { linearRegression, linearRegressionLine } from 'simple-statistics'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { differenceInDays, startOfDay, endOfDay } from "date-fns"
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import { Tooltip as InfoTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type TimeRange = '7d' | '30d' | '3m' | '1y' | 'all' | 'custom'

interface MetricConfig {
    label: string
    color: string
    domain: [number | 'auto' | 'dataMin' | 'dataMax', number | 'auto' | 'dataMin' | 'dataMax']
    unit: string
    invert: boolean
    description: string
    better: string
}

import { enhanceDataWithScore, ExertionPreference } from "@/lib/scoring/composite-score"

interface DashboardReviewProps {
    data: ({ date: string, custom_metrics?: Record<string, unknown> } & Record<string, unknown>)[]
    exertionPreference?: ExertionPreference
}

// ... imports

import { useUser } from "@/components/providers/user-provider"
import { useLanguage } from "@/components/providers/language-provider"
import { PEMAnalysis } from "@/components/dashboard/pem-analysis"
import { getMetricRegistryConfig } from "@/lib/metrics/registry"

export default function DashboardClient({ data: initialData, exertionPreference: initialPreference }: DashboardReviewProps) {
    const { t } = useLanguage()
    const { profile } = useUser()

    // Use Context preference if available (reactive), fallback to Server Prop, then default
    const exertionPreference = profile?.exertion_preference ?? initialPreference ?? 'desirable'

    // -- 0a. Source Detection (Check if Visible data exists: HRV or RHR) --
    const hasVisibleData = useMemo(() => {
        return initialData.some(d => (d.hrv !== undefined && d.hrv !== null) || (d.resting_heart_rate !== undefined && d.resting_heart_rate !== null));
    }, [initialData]);

    const [timeRange, setTimeRange] = useState<TimeRange>('30d')
    const [selectedMetrics, setSelectedMetrics] = useState<string[]>(hasVisibleData ? ['adjusted_score'] : ['symptom_score'])
    const [isCompareMode, setIsCompareMode] = useState(false)
    const [showTrend, setShowTrend] = useState(false)
    const [showCrashes, setShowCrashes] = useState(false)
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subDays(new Date(), 30),
        to: new Date(),
    })

    // 0. Calculate Visible Range separate from Data Processing
    const visibleRange = useMemo(() => {
        const now = new Date()
        let start = subDays(now, 30)
        let end = now

        if (timeRange === '7d') start = subDays(now, 7)
        if (timeRange === '30d') start = subDays(now, 30)
        if (timeRange === '3m') start = subDays(now, 90)
        if (timeRange === '1y') start = subDays(now, 365)
        if (timeRange === 'all') start = subDays(now, 365 * 5)

        if (timeRange === 'custom' && dateRange?.from) {
            start = startOfDay(dateRange.from)
            end = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from)
        }
        return { start, end }
    }, [timeRange, dateRange])

    // -- 1. Process Data (Score all data once for stable history) --
    const enhancedInitialData = useMemo(() => {
        if (!initialData || initialData.length === 0) return []

        // Enhance with Centralized Score using all-time history for stable normalization
        const enhanced = enhanceDataWithScore(initialData, undefined, exertionPreference)

        return enhanced.map(d => ({
            ...d,
            ...(d.custom_metrics || {}),
            // UI Mapping (Ensuring fields are always available for comparison)
            adjusted_score: Number(d.composite_score) || 0, // Maps MEasure-CFS Score to UI 'Adjusted Score'
            symptom_score: Number(d.symptom_score) || 0,    // Maps DB Symptom Score to UI 'Symptom Score'
            exertion_score: Number(d.exertion_score) || 0,
            step_count: d.step_count, // Explicitly include steps for checks
            step_factor: d.normalized_steps || 0,
            formattedDate: format(parseISO(d.date), 'MMM d')
        }))
    }, [initialData, exertionPreference])

    // -- 1b. Time Filtering for Charts --
    const processedData = useMemo(() => {
        if (enhancedInitialData.length === 0) return []

        const { start, end } = visibleRange

        return enhancedInitialData
            .filter(item => {
                const itemDate = startOfDay(parseISO(item.date))
                const s = startOfDay(start)
                const e = endOfDay(end)
                return itemDate >= s && (timeRange === 'custom' ? itemDate <= e : true)
            })
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }, [enhancedInitialData, visibleRange, timeRange])

    // -- Helper for Metric Translations (Matches Insights Logic) --
    const tMetric = useCallback((key: string) => {
        // 1. Try direct lookup (e.g. "step_count")
        const strictKey = key.toLowerCase();
        const dictionaryKey = `common.metric_labels.${strictKey}` as string;
        const translated = t(dictionaryKey);
        if (translated !== dictionaryKey && translated) return translated;

        // 2. Try normalized lookup (e.g. "Step count" -> "step_count")
        const snakeKey = strictKey.replace(/ /g, '_');
        const snakeDictKey = `common.metric_labels.${snakeKey}` as string;
        const snakeTranslated = t(snakeDictKey);
        if (snakeTranslated !== snakeDictKey && snakeTranslated) return snakeTranslated;

        // Fallback: just return formatted text
        return strictKey.replaceAll('_', ' ');
    }, [t])

    // -- 2a. Extract Dynamic Metrics --
    const availableMetrics = useMemo(() => {
        const dynamicKeys = new Set<string>()
        processedData.forEach(d => {
            if (d.custom_metrics) {
                Object.keys(d.custom_metrics).forEach(k => dynamicKeys.add(k))
            }
        })

        const dynamicOptions = Array.from(dynamicKeys).sort()
        const defaults = [
            ...(hasVisibleData ? [{ value: 'adjusted_score', label: tMetric('adjusted_score') }] : []),
            { value: 'symptom_score', label: tMetric('symptom_score') },
            { value: 'exertion_score', label: tMetric('exertion_score') },
            { value: 'step_factor', label: tMetric('step_factor') },
            ...(hasVisibleData ? [{ value: 'hrv', label: tMetric('hrv') }] : []),
            ...(hasVisibleData ? [{ value: 'resting_heart_rate', label: tMetric('resting_heart_rate') }] : []),
            { value: 'step_count', label: tMetric('step_count') }
        ]
        const allOptions = [...defaults]
        dynamicOptions.forEach(key => {
            if (key === 'Crash') return // Skip Crash, use toggle instead
            if (!allOptions.find(o => o.value === key)) {
                allOptions.push({ value: key, label: tMetric(key) })
            }
        })
        return allOptions
    }, [processedData, hasVisibleData, tMetric])

    // -- 2b. Helper to get Config for ANY metric --
    const getValue = useCallback((d: Record<string, unknown>, key: string): number | null => {
        // Check top-level (like adjusted_score, step_count)
        if (d[key] !== undefined && typeof d[key] === 'number') return d[key] as number
        // Check custom_metrics (like composite_score)
        const customMetrics = d.custom_metrics as Record<string, unknown> | undefined
        if (customMetrics && customMetrics[key] !== undefined) {
            const val = customMetrics[key]
            return typeof val === 'number' ? val : null
        }
        return null
    }, [])

    const getTrendStrategy = useCallback((range: TimeRange, start?: Date, end?: Date) => {
        if (range === 'custom' && start && end) {
            const days = Math.abs(differenceInDays(end, start))
            if (days >= 90) return { strategy: 'moving_average' as const, maWindow: 7 }
            if (days >= 28) return { strategy: 'moving_average' as const, maWindow: 5 }
            return { strategy: 'regression' as const, maWindow: 3 }
        }
        if (['30d'].includes(range)) return { strategy: 'moving_average' as const, maWindow: 5 }
        if (['3m'].includes(range)) return { strategy: 'moving_average' as const, maWindow: 7 }
        if (range === '1y') return { strategy: 'moving_average' as const, maWindow: 14 }
        if (range === 'all') return { strategy: 'moving_average' as const, maWindow: 30 }
        return { strategy: 'regression' as const, maWindow: 3 }
    }, [])



    const getMetricConfig = useCallback((key: string): MetricConfig => {
        const registry = getMetricRegistryConfig(key);
        const invert = registry.direction === 'lower';

        // Use tMetric for the label to ensure consistency
        // If registry provides a label, try to translate it, otherwise translate the key
        const labelKey = registry.label || key;
        const localizedLabel = tMetric(labelKey);

        // Base config from registry
        const config: MetricConfig = {
            label: localizedLabel,
            color: registry.color || '#8b5cf6',
            domain: (key.includes('score') || key.includes('hrv') || key.includes('heart')) ? ['auto', 'dataMax'] : [0, 'dataMax'],
            unit: registry.unit || '',
            invert: invert,
            description: '',
            better: invert ? t('dashboard.metrics.composite_score.better') : t('dashboard.metrics.hrv.better')
        };

        // Specific overrides for descriptions/better text (keeping keys stable)
        switch (key) {
            case 'adjusted_score':
                config.description = t('dashboard.metrics.adjusted_score.description');
                config.better = t('dashboard.metrics.adjusted_score.better');
                break;
            case 'symptom_score':
                config.description = t('dashboard.metrics.composite_score.description');
                config.better = t('dashboard.metrics.composite_score.better');
                break;
            case 'hrv':
                config.description = t('dashboard.metrics.hrv.description');
                config.better = t('dashboard.metrics.hrv.better');
                break;
            case 'resting_heart_rate':
                config.description = t('dashboard.metrics.resting_heart_rate.description');
                config.better = t('dashboard.metrics.resting_heart_rate.better');
                break;
            case 'step_count':
                config.description = t('dashboard.metrics.step_count.description');
                config.better = t('dashboard.metrics.step_count.better');
                break;
            case 'exertion_score':
                config.description = t('dashboard.metrics.exertion_score.description');
                config.better = t('dashboard.metrics.exertion_score.better');
                break;
            case 'Sleep':
            case 'sleep':
            case 'Sleep Score':
            case 'Sleep Quality':
                config.description = t('dashboard.metrics.sleep.description');
                config.better = t('dashboard.metrics.sleep.better');
                break;
        }

        return config;
    }, [t, tMetric])

    // -- 1b. Enhanced Chart Data (Trend Line) --
    // Only calculate trend for the PRIMARY metric to avoid clutter
    const chartData = useMemo(() => {
        const data = [...processedData]
        // DEBUG: Check what the first item has for adjusted_score


        if (!showTrend || data.length < 2 || selectedMetrics.length === 0) return data


        const trendsByIndex = new Map<number, Record<string, number>>()

        selectedMetrics.forEach(metric => {
            // Determine Trend Type Strategy (Sync with Shared Logic)
            const { strategy, maWindow } = getTrendStrategy(timeRange, visibleRange.start, visibleRange.end)

            if (strategy === 'regression') {
                // LINEAR REGRESSION (Viewport only)
                const points: { t: number, v: number, i: number }[] = []
                data.forEach((d, i) => {
                    const val = getValue(d, metric)
                    if (typeof val === 'number' && !isNaN(val)) {
                        points.push({ t: new Date(d.date).getTime(), v: val, i })
                    }
                })

                if (points.length < 2) return

                const regressionPoints = points.map(p => [p.t, p.v])
                const regression = linearRegression(regressionPoints)
                const predict = linearRegressionLine(regression)

                data.forEach((d, i) => {
                    const val = predict(new Date(d.date).getTime())
                    if (!trendsByIndex.has(i)) trendsByIndex.set(i, {})
                    trendsByIndex.get(i)![`trend_${metric}`] = val
                })
            } else {
                // MOVING AVERAGE (Use Full History for Warmup)
                // 1. We need the full history sorted ascending
                // initialData is typically sorted by DB default, but let's ensure safety or find relevant partial slice
                // Actually, initialData contains everything. 
                // We need to calculate MA for every day in 'data' (processedData), using 'initialData' lookback.

                // Optimization: Create a quick lookup or sorted array from initialData
                // Note: 'processedData' has computed fields (adjusted_score) that might NOT be in 'initialData'.
                // We must ensure we can compute the value from initialData dynamically if it's missing.
                // Re-using the logic from Step 1 (Adjusted Score calculation) might be duplicated code.
                // A simpler way: 'initialData' generally has the same structure if we just computed adjusted_score for it?
                // Wait, 'processedData' IS 'initialData' + filtering + computed fields. 
                // We should probably compute adjusted_score for ALL initialData once to make this easier? 
                // BUT: 'step normalization' relies on the viewport (min/max steps of current view).
                // Using Viewport Normalization for Global MA is tricky. 
                // User Rule: "Track-ME Score = Symptom - Steps".
                // If we use Global MA, we should probably use Global Normalization or Local Normalization?
                // The user sees Local Normalization in the graph. The MA should probably smooth the LOCAL values.
                // IF we smooth local values, we get the "lag" at the start. 
                // SOLUTION: Backfill logic. 
                // Using the first available point to padded the start is a common trick.
                // OR: Just accept the lag for MA?
                // User said: "not starred all the way on the left" was a complaint before.
                // But now they asked for MA specifically. MA inherently has lag.
                // Better approach: Calculate MA on `data` (processedData). For the first N points (where MA is partial), 
                // strictly use a smaller window or fall back to the raw value or a partial average.

                // Let's implement Partial Moving Average for the start of the series to avoid Null gaps.

                const validPoints = data.map((d, i) => ({
                    val: getValue(d, metric),
                    date: d.date,
                    index: i
                })).filter(p => typeof p.val === 'number' && !isNaN(p.val))

                validPoints.forEach((p, idx) => {
                    // Determine window for this point
                    // We want: Average of [p.val, and previous (maWindow - 1) points]
                    const startIdx = Math.max(0, idx - maWindow + 1)
                    const windowSlice = validPoints.slice(startIdx, idx + 1)

                    if (windowSlice.length === 0) return

                    const sum = windowSlice.reduce((acc, curr) => acc + (curr.val as number), 0)
                    const avg = sum / windowSlice.length

                    if (!trendsByIndex.has(p.index)) trendsByIndex.set(p.index, {})
                    trendsByIndex.get(p.index)![`trend_${metric}`] = avg
                })
            }
        })

        return data.map((d, i) => ({
            ...d,
            ...trendsByIndex.get(i)
        }))
    }, [processedData, showTrend, selectedMetrics, timeRange, getValue, getTrendStrategy, visibleRange])

    // -- 3. Calculate Stats for ALL selected metrics --
    const multiStats = useMemo(() => {
        if (!initialData || initialData.length === 0) return []

        return selectedMetrics.map(metric => {
            const config = getMetricConfig(metric)

            // 1. Current Period Data (Using helper to ensure consistent key lookup)
            const currentPoints = processedData
                .map(d => ({
                    val: getValue(d, metric),
                    t: new Date(d.date).getTime()
                }))
                .filter(p => typeof p.val === 'number' && !isNaN(p.val)) as { val: number, t: number }[]

            const currentValues = currentPoints.map(p => p.val)
            const currentAvg = currentValues.length > 0 ? currentValues.reduce((a, b) => a + b, 0) / currentValues.length : 0

            // 2. Previous Period Data Setup
            let prevStart: Date
            let prevEnd: Date

            const { start: cStart, end: cEnd } = visibleRange

            if (timeRange === 'all') {
                prevEnd = subDays(cStart, 1)
                prevStart = new Date(0)
            } else {
                const duration = differenceInDays(cEnd, cStart) + 1
                prevEnd = subDays(cStart, 1)
                prevStart = subDays(cStart, duration)
            }

            const pStart = startOfDay(prevStart)
            const pEnd = endOfDay(prevEnd)

            const prevData = enhancedInitialData.filter(item => {
                const d = parseISO(item.date)
                return d >= pStart && d <= pEnd
            })

            const prevValues = prevData
                .map(d => getValue(d, metric))
                .filter((v): v is number => typeof v === 'number' && !isNaN(v))

            // 3. Calculate "Period Change" (Alignment: Use same strategy as visual chart)
            let periodTrendPct = 0
            let periodTrendStatus = 'stable'

            if (currentPoints.length >= 2) {
                // ALWAYS use Linear Regression for the Trend Badge ("Overall Trend")
                // This aligns better with user perception (Slope) than comparing Moving Average endpoints.
                const dataPoints = currentPoints.map(p => [p.t, p.val])
                const regression = linearRegression(dataPoints)
                const predict = linearRegressionLine(regression)
                const startVal = predict(visibleRange.start.getTime())
                const endVal = predict(visibleRange.end.getTime())

                // Use midpoint for symmetric percentage change
                const midpoint = (Math.abs(startVal) + Math.abs(endVal)) / 2
                const denominator = Math.max(midpoint, 0.5)
                periodTrendPct = ((endVal - startVal) / denominator) * 100

                // Removed legacy Moving Average endpoint comparison (caused confusion with outliers)

                if (Math.abs(periodTrendPct) < 1) periodTrendStatus = 'stable'
                else if (periodTrendPct > 0) periodTrendStatus = config.invert ? 'worsening' : 'improving'
                else periodTrendStatus = config.invert ? 'improving' : 'worsening'
            }

            // 4. Calculate "Comparison Change" (Current Avg vs Previous Avg)
            let compareTrendPct = 0
            let compareTrendStatus = 'insufficient_data'

            if (prevValues.length > 0 && currentValues.length > 0) {
                const trendPrevAvg = prevValues.reduce((a, b) => a + b, 0) / prevValues.length
                const trendCurrAvg = currentValues.reduce((a, b) => a + b, 0) / currentValues.length

                // vs Prev also uses midpoint for symmetry and zero-safety
                const midpoint = (Math.abs(trendPrevAvg) + Math.abs(trendCurrAvg)) / 2
                const denominator = Math.max(midpoint, 0.5)
                const diff = trendCurrAvg - trendPrevAvg
                compareTrendPct = (diff / denominator) * 100

                if (Math.abs(compareTrendPct) < 1) compareTrendStatus = 'stable'
                else if (compareTrendPct > 0) compareTrendStatus = config.invert ? 'worsening' : 'improving'
                else compareTrendStatus = config.invert ? 'improving' : 'worsening'
            }

            // 5. Crash Analysis (PEM)
            const crashCount = processedData.filter(d => d.custom_metrics?.Crash === 1 || d.custom_metrics?.Crash === "1").length
            const prevCrashCount = prevData.filter(d => d.custom_metrics?.Crash === 1 || d.custom_metrics?.Crash === "1").length

            return {
                key: metric,
                label: config.label,
                unit: config.unit,
                avg: currentAvg,
                periodTrendPct,
                periodTrendStatus,
                compareTrendPct,
                compareTrendStatus,
                crashCount,
                prevCrashCount
            }
        })
    }, [processedData, enhancedInitialData, initialData, selectedMetrics, timeRange, visibleRange, getMetricConfig, getValue])


    // ... UI Render ...
    // Header: Map multiStats to Badges
    // Chart: Map selectedMetrics to Area/Line

    // -- 4. Mock Data Generator (Visualization Only) --


    return (
        <div className="space-y-6">

            {/* Header Area - Sticky Navigation */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 sticky top-14 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-3 -mx-4 px-4 border-b border-border/50 mb-2 transition-all">
                <div className="bg-muted/30 p-1 rounded-lg flex items-center gap-1 w-full sm:w-auto overflow-x-auto no-scrollbar">
                    {(['7d', '30d', '3m', '1y', 'all'] as TimeRange[]).map((r) => {
                        const rangeMap: Record<string, string> = { '7d': 'd7', '30d': 'd30', '3m': 'm3', '1y': 'y1', 'all': 'all' }
                        const labelKey = 'dashboard.time_ranges.' + rangeMap[r]
                        return (
                            <button
                                key={r}
                                onClick={() => setTimeRange(r)}
                                className={cn(
                                    "px-4 py-1.5 rounded-md text-xs font-medium transition-all",
                                    timeRange === r
                                        ? "bg-white dark:bg-zinc-800 text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {t(labelKey)}
                            </button>
                        )
                    })}

                    <div className="w-px h-4 bg-border mx-1" />

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "h-7 text-xs font-medium px-2 rounded-md transition-all hover:bg-background/50",
                                    timeRange === 'custom'
                                        ? "bg-white dark:bg-zinc-800 text-foreground shadow-sm hover:bg-white dark:hover:bg-zinc-800"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                                {dateRange?.from ? (
                                    dateRange.to ? (
                                        <>{format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}</>
                                    ) : (
                                        format(dateRange.from, "LLL dd, y")
                                    )
                                ) : (
                                    <span>{t('common.custom')}</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={dateRange?.from}
                                selected={dateRange}
                                onSelect={(range, day) => {
                                    // Start a new range if one is already selected
                                    const nextRange = (dateRange?.from && dateRange?.to)
                                        ? { from: day, to: undefined }
                                        : range

                                    setDateRange(nextRange)
                                    if (nextRange?.from) setTimeRange('custom')
                                }}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>





                </div>
            </div>



            {/* Main Chart Card */}
            <Card className="border-border/50 shadow-sm relative overflow-hidden">
                <CardHeader className="flex flex-col sm:flex-row items-start justify-between pb-2 gap-4 sm:gap-0">
                    <div className="flex flex-col gap-4 w-full">
                        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                            {multiStats.map((stat, index) => (
                                <div key={stat.key} className="space-y-1">
                                    <div className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2" style={{ color: getMetricConfig(stat.key).color }}>
                                        {stat.label}
                                        {getMetricConfig(stat.key).description && (
                                            <TooltipProvider>
                                                <InfoTooltip>
                                                    <TooltipTrigger asChild>
                                                        <Info className="h-3 w-3 opacity-50 hover:opacity-100 cursor-help transition-opacity" />
                                                    </TooltipTrigger>
                                                    <TooltipContent className="max-w-[200px] text-xs">
                                                        <p className="font-semibold mb-1">{t('dashboard.metrics.about')} {stat.label}</p>
                                                        <p className="mb-2">{getMetricConfig(stat.key).description}</p>
                                                        <p className="font-medium text-muted-foreground">{getMetricConfig(stat.key).better}</p>
                                                    </TooltipContent>
                                                </InfoTooltip>
                                            </TooltipProvider>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {stat.periodTrendStatus !== 'stable' && stat.periodTrendStatus !== 'insufficient_data' && (
                                            <span className={cn(
                                                "text-lg sm:text-lg md:text-2xl font-black uppercase tracking-tight mr-2 transition-all animate-in fade-in slide-in-from-left-4 duration-700",
                                                stat.periodTrendStatus === 'improving'
                                                    ? "text-emerald-600 dark:text-emerald-400"
                                                    : "text-rose-600 dark:text-rose-400"
                                            )}>
                                                {t(`dashboard.status.${stat.periodTrendStatus}`)}
                                            </span>
                                        )}
                                        <span className="text-2xl font-bold tracking-tight mr-2">
                                            {stat.avg.toFixed(1)}
                                        </span>

                                        <div className="flex items-center gap-2 mt-1 sm:mt-0">
                                            {/* Badge 1: Period Trend (Visible Range) */}
                                            <Badge variant="outline" className={cn(
                                                "px-1.5 py-0 md:px-2.5 md:py-0.5 min-h-[22px]",
                                                stat.periodTrendStatus === 'improving' && "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30",
                                                stat.periodTrendStatus === 'worsening' && "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-900/30",
                                                stat.periodTrendStatus === 'stable' && "bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800"
                                            )}>
                                                <span className="hidden sm:inline text-xs mr-1 opacity-70">Trend:</span>
                                                {stat.periodTrendStatus === 'stable' && <Minus className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1" />}
                                                {stat.periodTrendStatus !== 'stable' && stat.periodTrendPct > 0 && <TrendingUp className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1" />}
                                                {stat.periodTrendStatus !== 'stable' && stat.periodTrendPct < 0 && <TrendingDown className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1" />}
                                                <span className="text-xs font-medium">{Math.abs(stat.periodTrendPct).toFixed(0)}%</span>
                                            </Badge>

                                            {/* Badge 2: Comparison Trend (vs Previous) */}
                                            <Badge variant="outline" className={cn(
                                                "px-1.5 py-0 md:px-2.5 md:py-0.5 min-h-[22px]",
                                                stat.compareTrendStatus === 'improving' && "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30",
                                                stat.compareTrendStatus === 'worsening' && "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-900/30",
                                                stat.compareTrendStatus === 'stable' && "bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800",
                                                stat.compareTrendStatus === 'insufficient_data' && "bg-zinc-100 text-zinc-400 border-zinc-200 dark:bg-zinc-800/50 dark:text-zinc-500"
                                            )}>
                                                <span className="hidden sm:inline text-xs mr-1 opacity-70">vs Prev:</span>
                                                {stat.compareTrendStatus === 'insufficient_data' ? (
                                                    <span className="text-xs">N/A</span>
                                                ) : (
                                                    <>
                                                        {stat.compareTrendStatus === 'stable' && <Minus className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1" />}
                                                        {stat.compareTrendStatus !== 'stable' && stat.compareTrendPct > 0 && <TrendingUp className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1" />}
                                                        {stat.compareTrendStatus !== 'stable' && stat.compareTrendPct < 0 && <TrendingDown className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1" />}
                                                        <span className="text-xs font-medium">{Math.abs(stat.compareTrendPct).toFixed(0)}%</span>
                                                    </>
                                                )}
                                            </Badge>

                                            {/* PEM STATS - ADDED ALONGSIDE */}
                                            {showCrashes && index === 0 && (
                                                <>
                                                    <div className="hidden sm:block w-px h-6 bg-border mx-1" /> {/* Divider */}

                                                    <Badge variant="outline" className={cn(
                                                        "border-zinc-300 bg-zinc-50 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700",
                                                        stat.crashCount > 0 && "border-zinc-950 bg-zinc-900 text-white dark:bg-white dark:text-black dark:border-white"
                                                    )}>
                                                        <Activity className="w-3 h-3 mr-1" />
                                                        {stat.crashCount} PEM
                                                    </Badge>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>


                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="pem-mode"
                                    checked={showCrashes}
                                    onCheckedChange={setShowCrashes}
                                />
                                <Label htmlFor="pem-mode" className="text-xs text-muted-foreground">{t('dashboard.pem_mode')}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="compare-mode"
                                    checked={isCompareMode}
                                    onCheckedChange={(checked) => {
                                        setIsCompareMode(checked)
                                        // If turning off compare mode, enforce single selection
                                        if (!checked && selectedMetrics.length > 1) {
                                            setSelectedMetrics([selectedMetrics[0]])
                                        }
                                    }}
                                />
                                <Label htmlFor="compare-mode" className="text-xs text-muted-foreground">{t('dashboard.compare_mode')}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch id="trend-mode" checked={showTrend} onCheckedChange={setShowTrend} />
                                <Label htmlFor="trend-mode" className="text-xs text-muted-foreground">{t('dashboard.trend_mode')}</Label>
                            </div>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 text-xs w-[140px] sm:w-[200px] justify-between">
                                    <span className="truncate">
                                        {selectedMetrics.length === 1
                                            ? getMetricConfig(selectedMetrics[0]).label
                                            : (selectedMetrics.length + " " + t('dashboard.metrics_selected'))
                                        }
                                    </span>
                                    <ChevronDown className="h-3 w-3 opacity-50 flex-shrink-0" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[200px] max-h-[300px] overflow-y-auto">
                                <DropdownMenuLabel>{isCompareMode ? t('dashboard.metrics_dropdown') : t('dashboard.select_placeholder')}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {availableMetrics.map((m) => {
                                    const isSelected = selectedMetrics.includes(m.value)
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={m.value}
                                            checked={isSelected}
                                            onCheckedChange={(checked) => {
                                                if (isCompareMode) {
                                                    // Multi-select Mode (Max 2)
                                                    if (checked) {
                                                        if (selectedMetrics.length < 2) {
                                                            setSelectedMetrics([...selectedMetrics, m.value])
                                                        }
                                                    } else {
                                                        if (selectedMetrics.length > 1) {
                                                            setSelectedMetrics(selectedMetrics.filter(id => id !== m.value))
                                                        }
                                                    }
                                                } else {
                                                    // Single-select Mode
                                                    if (checked) {
                                                        // Replace current selection with new one
                                                        setSelectedMetrics([m.value])
                                                    }
                                                }
                                            }}
                                        >
                                            {m.label}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>

                <CardContent className="h-[300px] md:h-[400px] w-full px-2 md:px-6 pt-4 relative">
                    {/* Step Data Warning Overlay - Only show if specifically looking for steps and they are totally missing */}
                    {selectedMetrics.includes('step_count') &&
                        selectedMetrics.length === 1 &&
                        processedData.length > 0 &&
                        processedData.every(d => !d.step_count) && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-zinc-950/50 backdrop-blur-[1px] rounded-b-xl">
                                <div className="bg-background border border-border shadow-lg rounded-xl p-6 max-w-sm text-center">
                                    <div className="mx-auto w-12 h-12 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-footprints"><path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 11 3.8 11 8c0 2.85-2.92 5.5-3.8 7.18L7 16z" /><path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 13 7.8 13 12c0 2.85 2.92 5.5 3.8 7.18L17 20z" /></svg>
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2">No Step Data Found</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Upload your Apple Health data to see your daily steps and adjusted health score.
                                    </p>
                                    <Button asChild size="sm">
                                        <Link href="/upload">Upload Data</Link>
                                    </Button>
                                </div>
                            </div>
                        )}

                    {/* General No Data Message */}
                    {processedData.length === 0 && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-[1px]">
                            <div className="text-center space-y-2">
                                <p className="text-muted-foreground font-medium">{t('dashboard.status.insufficient_data')}</p>
                                <Button asChild variant="outline" size="sm">
                                    <Link href="/upload">{t('navbar.upload_data')}</Link>
                                </Button>
                            </div>
                        </div>
                    )}

                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                            <defs>
                                {selectedMetrics.map((metric) => {
                                    const config = getMetricConfig(metric)
                                    // Sanitize ID for SVG (no spaces allowed)
                                    const safeId = metric.replace(/\s+/g, '-')
                                    return (
                                        <linearGradient key={metric} id={'colorMetric-' + safeId} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={config.color} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={config.color} stopOpacity={0.0} />
                                        </linearGradient>
                                    )
                                })}
                            </defs>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.1} />

                            <XAxis
                                dataKey="date"
                                tickFormatter={(str) => format(parseISO(str), 'MMM d')}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#888' }}
                                minTickGap={30}
                            />


                            {/* Dynamic Y Axes */}
                            {selectedMetrics.map((metric, index) => {
                                const config = getMetricConfig(metric)
                                return (
                                    <YAxis
                                        key={metric}
                                        yAxisId={metric}
                                        orientation={index === 0 ? 'left' : 'right'}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#888' }}
                                        domain={config.domain as [number | 'auto' | 'dataMin' | 'dataMax', number | 'auto' | 'dataMin' | 'dataMax']}
                                        reversed={false}
                                        width={40}
                                        hide={index > 1}
                                    />
                                )
                            })}

                            <Tooltip
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-zinc-900 text-white text-xs p-3 rounded-lg shadow-xl border border-zinc-800">
                                                <p className="font-semibold mb-2">{label ? format(parseISO(label as string), 'EEE, MMM d') : ''}</p>
                                                <div className="flex flex-col gap-1">
                                                    {payload.map((p) => {
                                                        // Filter out Trend line from tooltip if needed or keep it
                                                        if (String(p.dataKey).startsWith('trend_')) {
                                                            const metricKey = String(p.dataKey).replace('trend_', '')
                                                            return (
                                                                <div key={p.dataKey} className="flex items-center gap-2 text-muted-foreground pt-1 border-t border-zinc-800 mt-1">
                                                                    <span>Trend ({getMetricConfig(metricKey).label}): <span className="font-bold">{Number(p.value).toFixed(1)}</span></span>
                                                                </div>
                                                            )
                                                        }
                                                        // Find config
                                                        // p.dataKey might be the metric key or accessing nested
                                                        // We can deduce from fill/stroke or just match selectedMetrics
                                                        // p.name usually holds dataKey
                                                        return (
                                                            <div key={p.name} className="flex items-center gap-2">
                                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                                                                <span>
                                                                    {getMetricConfig(p.name).label}: <span className="font-bold">{Number(p.value).toFixed(1)}{getMetricConfig(p.name).unit}</span>
                                                                </span>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />

                            {/* Render Metrics */}
                            {selectedMetrics.map((metric, index) => {
                                const config = getMetricConfig(metric)
                                // Primary = Area. Others = Line.
                                if (index === 0) {
                                    return (
                                        <Area
                                            key={metric}
                                            type="monotone"
                                            dataKey={metric}
                                            stroke={config.color}
                                            fill={`url(#colorMetric-${metric.replace(/\s+/g, '-')})`}
                                            strokeWidth={2}
                                            strokeOpacity={showTrend ? 0.2 : 1}
                                            fillOpacity={showTrend ? 0.3 : 0.6}
                                            activeDot={{ r: 6 }}
                                            yAxisId={metric}
                                        />
                                    )
                                } else {
                                    return (
                                        <Line
                                            key={metric}
                                            type="monotone"
                                            dataKey={metric}
                                            stroke={config.color}
                                            strokeWidth={2}
                                            strokeOpacity={showTrend ? 0.2 : 1}
                                            dot={false}
                                            activeDot={{ r: 6 }}
                                            yAxisId={metric}
                                        />
                                    )
                                }
                            })}

                            {/* Crash Episode Visualization (Overlay + Boundary Lines) */}
                            {(() => {
                                const episodes: { start: string, end: string }[] = []
                                let currentEpisode: { start: string, end: string } | null = null

                                chartData.forEach((d, i) => {
                                    const isCrash = d.custom_metrics?.Crash == 1 || d.custom_metrics?.crash == 1
                                    if (isCrash) {
                                        if (!currentEpisode) currentEpisode = { start: d.date, end: d.date }
                                        else currentEpisode.end = d.date
                                    } else {
                                        if (currentEpisode) {
                                            episodes.push(currentEpisode)
                                            currentEpisode = null
                                        }
                                    }
                                    if (i === chartData.length - 1 && currentEpisode) episodes.push(currentEpisode)
                                })

                                if (!showCrashes) return null

                                return episodes.map((ep, idx) => (
                                    <React.Fragment key={`ep-${idx}`}>
                                        {/* Semi-transparent Overlay */}
                                        <ReferenceArea
                                            x1={ep.start}
                                            x2={ep.end}
                                            fill="#000"
                                            fillOpacity={0.15}
                                            stroke="none"
                                            yAxisId={selectedMetrics[0]}
                                        />
                                        {/* Boundary Lines */}
                                        <ReferenceLine x={ep.start} stroke="#000" strokeWidth={1} opacity={0.5} yAxisId={selectedMetrics[0]} />
                                        <ReferenceLine x={ep.end} stroke="#000" strokeWidth={1} opacity={0.5} yAxisId={selectedMetrics[0]} />
                                    </React.Fragment>
                                ))
                            })()}

                            {/* Render Trend Lines */}
                            {showTrend && selectedMetrics.map(metric => (
                                <Line
                                    key={`trend_${metric}`}
                                    dataKey={`trend_${metric}`}
                                    stroke={getMetricConfig(metric).color}
                                    strokeWidth={3}
                                    strokeDasharray="5 5"
                                    dot={false}
                                    opacity={1}
                                    yAxisId={metric}
                                    isAnimationActive={false}
                                />
                            ))}

                        </ComposedChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* PEM (Crash) Trigger Analysis */}
            <div className="mt-12 space-y-6">
                <div className="flex items-center gap-3 border-b border-border/50 pb-3">
                    <Activity className="w-6 h-6 text-rose-600 dark:text-rose-500" />
                    <h3 className="text-2xl font-black uppercase tracking-tight text-foreground">
                        {t('dashboard.pem_insights_title')}
                    </h3>
                </div>
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <PEMAnalysis data={initialData} filterRange={visibleRange} />
                </div>
            </div>



        </div>
    )
}


