import { HealthEntry, calculateBaselineStats, extractEpochs, calculateZScores, aggregateEpochs, analyzePreCrashPhase } from '@/lib/statistics/pem-cycle'
import { subDays, addDays, isAfter, startOfDay, parseISO, isWithinInterval } from 'date-fns'

export interface PEMDangerStatus {
    status: 'danger' | 'stable' | 'needs_data'
    level: number // 0-100
    matchedTriggers: {
        metric: string
        type: string
        leadDaysStart: number
        magnitude: number
        currentZ: number
        isPersonal: boolean
        description?: string
        descriptionKey?: string
        descriptionParams?: Record<string, string>
    }[]
    biometrics?: {
        key: string
        label: string
        zScore: number
        status: 'optimal' | 'normal' | 'strained'
    }[]
    insufficientDataReason?: 'no_history' | 'no_recent_data' | 'no_crashes'
}

/**
 * Calculates the current PEM danger level based on historical triggers.
 */
export function calculateCurrentPEMDanger(data: HealthEntry[]): PEMDangerStatus {
    if (!data || data.length < 10) {
        return { status: 'needs_data', level: 0, matchedTriggers: [], insufficientDataReason: 'no_history' }
    }

    // 1. Sort data
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // 2. Check for recent data (last 7 days from today)
    const today = startOfDay(new Date())
    const sevenDaysAgo = subDays(today, 7)
    const recentData = sortedData.filter(d => {
        const date = parseISO(d.date)
        return isWithinInterval(date, { start: sevenDaysAgo, end: today })
    })

    if (recentData.length === 0) {
        return { status: 'needs_data', level: 0, matchedTriggers: [], insufficientDataReason: 'no_recent_data' }
    }

    // 3. Identify Metrics to analyze
    const allMetrics = new Set<string>()
    sortedData.forEach(d => {
        Object.keys(d).forEach(k => {
            if (k !== 'date' && k !== 'id' && k !== 'user_id' && k !== 'custom_metrics' && typeof d[k] === 'number') allMetrics.add(k)
        })
        if (d.custom_metrics) {
            Object.keys(d.custom_metrics).forEach(k => {
                if (typeof d.custom_metrics?.[k] === 'number') allMetrics.add(k)
            })
        }
    })
    const metricsToAnalyze = Array.from(allMetrics).filter(m => m !== 'Crash' && m !== 'crash')

    // 4. Calculate Baseline from ALL history
    const baselineStats = calculateBaselineStats(sortedData, metricsToAnalyze)

    // 5. Find historical crashes
    const crashIndices = sortedData
        .map((d, i) => {
            const isCrash =
                d.crash === 1 || d.crash === '1' || d.crash === true ||
                d.custom_metrics?.Crash === 1 || d.custom_metrics?.Crash === '1' || d.custom_metrics?.Crash === true ||
                d.custom_metrics?.crash === 1 || d.custom_metrics?.crash === '1' || d.custom_metrics?.crash === true
            return isCrash ? i : -1
        })
        .filter(i => i !== -1)

    // Filter to only 'start' of crash episodes (first day of a streak)
    const crashStarts = crashIndices.filter((idx, i) => i === 0 || idx > crashIndices[i - 1] + 1)

    // 6. Extract Triggers (Phase 1 Logic)
    // Note: If no crashes are found, we can't identify personal triggers,
    // but we can still detect general risk levels via cumulative load below.
    const epochs = extractEpochs(sortedData, crashStarts, metricsToAnalyze)
    const zEpochs = calculateZScores(epochs, baselineStats)
    const aggregated = aggregateEpochs(zEpochs, metricsToAnalyze)
    const { discoveries } = analyzePreCrashPhase(aggregated, baselineStats)

    const matchedTriggers: PEMDangerStatus['matchedTriggers'] = []
    const seenTriggers = new Set<string>()
    let maxLevel = 0

    recentData.forEach(day => {
        const dayDate = parseISO(day.date)

        discoveries.forEach(tr => {
            // Support composite metrics (e.g., "Steps + Work")
            const subMetrics = tr.metric.split(' + ')
            let currentZ = 0

            if (subMetrics.length > 1) {
                // Synergistic trigger
                const z1 = getZScore(day, subMetrics[0], baselineStats)
                const z2 = getZScore(day, subMetrics[1], baselineStats)
                currentZ = (z1 + z2) / Math.sqrt(2)
            } else {
                currentZ = getZScore(day, tr.metric, baselineStats)
            }

            // If current Z-score is significant and matches historical trigger polarity
            const threshold = tr.magnitude * 0.75 // 75% of historical peak magnitude
            if (Math.abs(currentZ) >= threshold && ((tr.type === 'spike' && currentZ > 0) || (tr.type === 'drop' && currentZ < 0))) {
                // Check if the "impact day" (day + leadDays) is in the future or today
                const impactDay = addDays(dayDate, Math.abs(tr.leadDaysStart))
                if (!isAfter(today, impactDay)) {
                    const triggerKey = `${tr.metric}-${tr.type}`
                    if (seenTriggers.has(triggerKey)) return
                    seenTriggers.add(triggerKey)

                    matchedTriggers.push({
                        metric: tr.metric,
                        type: tr.classification || 'Trigger',
                        leadDaysStart: tr.leadDaysStart,
                        magnitude: tr.magnitude,
                        currentZ,
                        isPersonal: true,
                        descriptionKey: 'navbar.pem_status.matches_personal_desc'
                    })
                    // Scoring: 50 base if matched + extra based on how close Z is to historical peak
                    const score = Math.min(100, 50 + (Math.abs(currentZ) / tr.magnitude) * 50)
                    if (score > maxLevel) maxLevel = score
                }
            }
        })
    })

    // 8. Generic "Cumulative Load" check
    const avgExertion = recentData.reduce((acc, d) => acc + getZScore(d, 'exertion_score', baselineStats), 0) / recentData.length
    const avgSteps = recentData.reduce((acc, d) => acc + getZScore(d, 'step_count', baselineStats), 0) / recentData.length

    /**
     * Generic "Cumulative Load" check.
     * Threshold: 0.8 Z-score (~25% increase over mean if std=1).
     * We use a sensitive threshold (0.8 instead of 1.0 or 2.0) because cumulative
     * burden often builds up subtly before a major PEM crash.
     */
    const checkCumulative = (val: number, key: string, label: string) => {
        if (val > 0.8) {
            const loadScore = Math.min(100, 40 + (val - 0.8) * 20)
            maxLevel = Math.max(maxLevel, loadScore)
            matchedTriggers.push({
                metric: key,
                type: 'Cumulative Load',
                leadDaysStart: 0,
                magnitude: 1.0,
                currentZ: val,
                isPersonal: false,
                descriptionKey: 'navbar.pem_status.matches_general_desc',
                descriptionParams: { label }
            })
        }
    }

    checkCumulative(avgExertion, 'exertion_score', 'exertion')
    checkCumulative(avgSteps, 'step_count', 'activity')

    // 9. Status & Cleanup
    const isDanger = maxLevel >= 50

    // Calculate Biometrics for "All Clear" reassurance
    const latestDay = recentData[recentData.length - 1]
    const biometrics: PEMDangerStatus['biometrics'] = [
        { key: 'hrv', label: 'HRV', zScore: getZScore(latestDay, 'hrv', baselineStats) },
        { key: 'resting_heart_rate', label: 'Resting HR', zScore: getZScore(latestDay, 'resting_heart_rate', baselineStats) },
        { key: 'step_count', label: 'Steps', zScore: getZScore(latestDay, 'step_count', baselineStats) }
    ].map(b => {
        let status: 'optimal' | 'normal' | 'strained' = 'normal'
        const z = b.zScore
        if (b.key === 'hrv') {
            if (z > 0.5) status = 'optimal'
            else if (z < -1.0) status = 'strained'
        } else {
            // For PEM patients: 
            // - RHR: Lower heart rate indicates better cardiovascular recovery.
            // - Steps: Lower activity (within baseline) reduces crash risk via pacing.
            if (z < -0.5) status = 'optimal'
            else if (z > 1.0) status = 'strained'
        }
        return { ...b, status }
    })

    return {
        status: isDanger ? 'danger' : 'stable',
        level: maxLevel,
        matchedTriggers: isDanger ? matchedTriggers.slice(0, 3) : [],
        biometrics
    }
}

function getZScore(entry: HealthEntry, key: string, baselineStats: Record<string, { mean: number, std: number }>): number {
    const val = entry[key] ?? entry.custom_metrics?.[key] ?? null
    const num = typeof val === 'number' ? val : (val ? Number(val) : null)
    if (num === null || isNaN(num) || !baselineStats[key]) return 0

    const { mean, std } = baselineStats[key]
    return std > 0 ? (num - mean) / std : (num > mean ? 2 : 0)
}
