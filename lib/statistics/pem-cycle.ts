export interface MetricData {
    date: string
    value: number
}

import { mean, standardDeviation } from 'simple-statistics'
import { startOfDay, endOfDay, parseISO } from 'date-fns'

// Helper for baseline stats
export function calculateBaselineStats(data: any[], metrics: string[]) {
    const stats: Record<string, { mean: number, std: number }> = {}

    metrics.forEach(key => {
        const values = data.map(d => {
            const val = d[key] ?? d.custom_metrics?.[key] ?? null
            const num = (typeof val === 'number') ? val : (val ? Number(val) : null)
            return (num !== null && !isNaN(num)) ? num : null
        }).filter((v): v is number => v !== null)

        if (values.length > 1) {
            stats[key] = {
                mean: mean(values),
                std: standardDeviation(values)
            }
        } else {
            // Check for non-numeric but boolean-like if it's 'Crash'
            if (key.toLowerCase() === 'crash') {
                stats[key] = { mean: 0, std: 1 } // Safe default for flags
            } else {
                stats[key] = { mean: 0, std: 0 }
            }
        }
    })
    return stats
}

export interface CycleEpoch {
    crashDate: string
    startIndex: number // Index in the original sorted data array
    data: {
        dayOffset: number // -7 to +7 (or +14) relative to crash
        date: string
        metrics: Record<string, number | null>
        zScores: Record<string, number | null>
    }[]
}

export interface CycleAnalysisResult {
    epochs: CycleEpoch[]
    aggregatedProfile: {
        dayOffset: number
        metrics: Record<string, { mean: number, std: number, n: number }>
    }[]
    findings: {
        preCrash: {
            delayedTriggerDetected: boolean
            cumulativeLoadDetected: boolean
            triggerLag: number
            confidence: number
            discoveries: {
                metric: string
                type: 'spike' | 'drop'
                leadDaysStart: number
                leadDaysEnd: number
                magnitude: number
                pctChange: number
            }[]
        }
        crashPhase: {
            type: 'Type A (Dip)' | 'Type B (Burnout)' | 'Mixed'
            avgDuration: number
            severityAUC: number
        }
        recovery: {
            avgRecoveryDays: number
            hysteresisDetected: boolean
        }
    }
}

const EPOCH_PRE_DAYS = 7
const EPOCH_POST_DAYS = 14

/**
 * Extracts event-aligned windows (Epochs) around each crash start date.
 */
export function extractEpochs(
    sortedData: any[],
    crashIndices: number[],
    metricsToAnalyze: string[]
): CycleEpoch[] {
    const epochs: CycleEpoch[] = []

    crashIndices.forEach(crashIdx => {
        const crashDate = sortedData[crashIdx].date
        const epochData = []

        // Extract window from -PRE to +POST
        for (let i = -EPOCH_PRE_DAYS; i <= EPOCH_POST_DAYS; i++) {
            const targetIdx = crashIdx + i
            if (targetIdx >= 0 && targetIdx < sortedData.length) {
                const row = sortedData[targetIdx]
                const metrics: Record<string, number | null> = {}

                metricsToAnalyze.forEach(key => {
                    const val = row[key] ?? row.custom_metrics?.[key] ?? null
                    const num = typeof val === 'number' ? val : (val ? Number(val) : null)

                    if (num !== null && !isNaN(num)) {
                        metrics[key] = num
                    } else if (val === '1' || val === 1 || val === true) {
                        metrics[key] = 1
                    } else if (val === '0' || val === 0 || val === false) {
                        metrics[key] = 0
                    } else {
                        metrics[key] = null
                    }
                })

                epochData.push({
                    dayOffset: i,
                    date: row.date,
                    metrics,
                    zScores: {}
                })
            }
        }

        if (epochData.length > 0) {
            epochs.push({
                crashDate,
                startIndex: crashIdx,
                data: epochData
            })
        }
    })

    return epochs
}

/**
 * Calculates Z-Scores
 */
export function calculateZScores(
    epochs: CycleEpoch[],
    baselineStats: Record<string, { mean: number, std: number }>
): CycleEpoch[] {
    return epochs.map(epoch => {
        const newData = epoch.data.map(day => {
            const zScores: Record<string, number | null> = {}
            for (const [key, val] of Object.entries(day.metrics)) {
                if (val !== null && baselineStats[key]) {
                    const { mean: bMean, std: bStd } = baselineStats[key]
                    if (bStd > 0) {
                        zScores[key] = (val - bMean) / bStd
                    } else {
                        // Any increase from a zero-variance baseline is 2 sigma
                        zScores[key] = val > bMean ? 2 : 0
                    }
                } else {
                    zScores[key] = 0
                }
            }
            return { ...day, zScores }
        })
        return { ...epoch, data: newData }
    })
}

/**
 * Superposed Epoch Analysis (SEA)
 */
export function aggregateEpochs(epochs: CycleEpoch[], metrics: string[]) {
    const aggregation: Record<number, { count: number, sums: Record<string, number>, sqSums: Record<string, number> }> = {}

    for (let i = -EPOCH_PRE_DAYS; i <= EPOCH_POST_DAYS; i++) {
        aggregation[i] = { count: 0, sums: {}, sqSums: {} }
        metrics.forEach(m => {
            aggregation[i].sums[m] = 0
            aggregation[i].sqSums[m] = 0
        })
    }

    epochs.forEach(epoch => {
        epoch.data.forEach(day => {
            if (aggregation[day.dayOffset]) {
                const node = aggregation[day.dayOffset]
                metrics.forEach(m => {
                    const val = day.zScores[m]
                    if (val !== null && !isNaN(val)) {
                        node.sums[m] += val
                        node.sqSums[m] += (val * val)
                    }
                })
                node.count++
            }
        })
    })

    const result = []
    for (let i = -EPOCH_PRE_DAYS; i <= EPOCH_POST_DAYS; i++) {
        const node = aggregation[i]
        const metricsResult: Record<string, any> = {}

        metrics.forEach(m => {
            if (node.count > 0) {
                const meanVal = node.sums[m] / node.count
                const variance = (node.sqSums[m] / node.count) - (meanVal * meanVal)
                metricsResult[m] = {
                    mean: meanVal,
                    std: Math.sqrt(Math.max(0, variance)),
                    n: node.count
                }
            } else {
                metricsResult[m] = { mean: 0, std: 0, n: 0 }
            }
        })
        result.push({ dayOffset: i, metrics: metricsResult })
    }
    return result
}

/**
 * Phase 1 Analysis: Detect Triggers across ALL metrics
 */
export function analyzePreCrashPhase(aggregatedProfile: any[], baselineStats: Record<string, { mean: number, std: number }>) {
    const preDashData = aggregatedProfile.filter(d => d.dayOffset < 0)
    const metrics = Object.keys(aggregatedProfile[0]?.metrics || {})
    const discoveries: { metric: string, type: 'spike' | 'drop', leadDaysStart: number, leadDaysEnd: number, magnitude: number, pctChange: number }[] = []

    // 1. Global Deviation Scanner: Look at EVERY metric for significant pre-crash movement
    metrics.forEach(m => {
        if (m === 'Crash' || m === 'crash') return

        const profile = preDashData.map(d => ({
            offset: d.dayOffset, // -7 to -1
            zScore: d.metrics[m]?.mean || 0
        })).sort((a, b) => a.offset - b.offset) // -7, -6, ..., -1

        // Look for acute anomalies (Z-score > 2.0 or < -2.0)
        // Find the full window of significance
        const significantDays = profile.filter(p => Math.abs(p.zScore) > 2.0)

        if (significantDays.length > 0) {
            const peak = [...significantDays].sort((a, b) => Math.abs(b.zScore) - Math.abs(a.zScore))[0]
            const startDay = significantDays[0].offset
            const endDay = significantDays[significantDays.length - 1].offset

            // Calculate roughly raw percentage change from Z-score
            // val = z * std + mean
            // pct = (val - mean) / mean = (z * std) / mean
            const bStats = baselineStats[m]
            let pctChange = 0
            if (bStats) {
                // Use a safe denominator (min 1.0) to prevent "explosive" percentages
                // on metrics that typically have low baseline means (like symptoms)
                const denom = Math.abs(bStats.mean) < 1.0 ? 1.0 : Math.abs(bStats.mean)
                pctChange = (peak.zScore * bStats.std) / denom
            }

            discoveries.push({
                metric: m,
                type: peak.zScore > 0 ? 'spike' : 'drop',
                leadDaysStart: Math.abs(startDay),
                leadDaysEnd: Math.abs(endDay),
                magnitude: Math.abs(peak.zScore),
                pctChange: pctChange * 100
            })
        }
    })

    // 2. Combinatorial Scanner: Look for PAIRS of metrics that are significant together
    const pairwiseDiscoveries: typeof discoveries = []
    const metricList = metrics.filter(m => m !== 'Crash' && m !== 'crash')

    for (let i = 0; i < metricList.length; i++) {
        for (let j = i + 1; j < metricList.length; j++) {
            const m1 = metricList[i]
            const m2 = metricList[j]

            const profile = preDashData.map(d => {
                const z1 = d.metrics[m1]?.mean || 0
                const z2 = d.metrics[m2]?.mean || 0
                // Combine Z-scores. Sum of Z-scores normalized.
                // If they both go same way, it amplifies.
                return {
                    offset: d.dayOffset,
                    z1,
                    z2,
                    jointZ: (z1 + z2) / Math.sqrt(2)
                }
            })

            // Find window where combined impact is significant (> 2.0)
            // AND ensure it's "synergistic" (joint Z is stronger than individual Zs on average)
            const significantDays = profile.filter(p => Math.abs(p.jointZ) > 2.2)

            if (significantDays.length > 0) {
                const peak = [...significantDays].sort((a, b) => Math.abs(b.jointZ) - Math.abs(a.jointZ))[0]

                // Only include if neither component was already a top solo discovery 
                // OR if the combination is significantly more powerful.
                const startDay = significantDays[0].offset
                const endDay = significantDays[significantDays.length - 1].offset

                // Average Pct Change (Aggregated impact)
                const b1 = baselineStats[m1]
                const b2 = baselineStats[m2]
                let avgPct = 0
                if (b1 && b2) {
                    const pct1 = (peak.z1 * b1.std) / (Math.abs(b1.mean) < 1.0 ? 1.0 : Math.abs(b1.mean))
                    const pct2 = (peak.z2 * b2.std) / (Math.abs(b2.mean) < 1.0 ? 1.0 : Math.abs(b2.mean))
                    avgPct = ((pct1 + pct2) / 2) * 100
                }

                pairwiseDiscoveries.push({
                    metric: `${m1} + ${m2}`,
                    type: peak.jointZ > 0 ? 'spike' : 'drop',
                    leadDaysStart: Math.abs(startDay),
                    leadDaysEnd: Math.abs(endDay),
                    magnitude: Math.abs(peak.jointZ),
                    pctChange: avgPct
                })
            }
        }
    }

    // Merge and filter discoveries
    // Prioritize combinations if they are very strong (> 2.5) 
    // Otherwise prioritize solo spikes if they are extreme.
    const allDiscoveries = [...discoveries, ...pairwiseDiscoveries]
        .sort((a, b) => b.magnitude - a.magnitude)
        .slice(0, 5) // Increase to 5 to show more "advanced" findings if they exist

    // 3. Specific Known Pattern Checks (Exertion Spike)
    const exertionSpike = allDiscoveries.find(d => d.metric.includes('exertion_score') && d.type === 'spike')
    const cumulativeAvg = preDashData.filter(d => d.dayOffset >= -5).reduce((a, b) => a + (b.metrics['exertion_score']?.mean || 0), 0) / 5

    return {
        delayedTriggerDetected: !!exertionSpike,
        cumulativeLoadDetected: cumulativeAvg > 0.5,
        triggerLag: exertionSpike ? exertionSpike.leadDaysStart : (cumulativeAvg > 0.5 ? -1 : 0),
        confidence: exertionSpike ? 0.8 : (cumulativeAvg > 0.5 ? 0.6 : 0),
        discoveries: allDiscoveries
    }
}

/**
 * Phase 3 Analysis: The Recovery Tail (Post-Logging Phase)
 * Analyzes the period AFTER the user stops logging 'Crash' but BEFORE metrics hit baseline.
 */
export function analyzeRecoveryPhase(epochs: CycleEpoch[], baselineStats: Record<string, { mean: number, std: number }>) {
    const metrics = Object.keys(baselineStats).filter(m => m !== 'Crash' && m !== 'crash')

    const episodes = epochs.map(epoch => {
        // 1. Find when the user STOPPED logging 'Crash'
        let manualExitDay = 0
        for (let i = 0; i <= 14; i++) {
            const day = epoch.data.find(d => d.dayOffset === i)
            if (!day) break
            const isLabeled = day.metrics['Crash'] === 1 || day.metrics['crash'] === 1
            if (isLabeled) {
                manualExitDay = i + 1
            } else if (i > manualExitDay && manualExitDay > 0) {
                // We've found the stretch where they aren't logging anymore
                break
            }
        }

        const recoveryStats: Record<string, number> = {}

        // 2. Scan from manualExitDay to find when each metric hits baseline (< 0.5 sigma)
        metrics.forEach(m => {
            let recoveryFound = false
            for (let i = manualExitDay; i <= 14; i++) {
                const day = epoch.data.find(d => d.dayOffset === i)
                if (!day) break

                const z = Math.abs(day.zScores[m] || 0)
                if (z < 0.5) {
                    recoveryStats[m] = i - manualExitDay
                    recoveryFound = true
                    break
                }
            }
            if (!recoveryFound) recoveryStats[m] = 14 - manualExitDay // Capped
        })

        return { manualExitDay, recoveryStats }
    })

    if (episodes.length === 0) return null

    // Aggregate average recovery days per metric
    const metricAverages: Record<string, number> = {}
    metrics.forEach(m => {
        const avg = episodes.reduce((a, b) => a + b.recoveryStats[m], 0) / episodes.length
        metricAverages[m] = avg
    })

    // Group into Subjective (Symptoms) vs Biological (Vitals)
    const vitalMetrics = ['hrv', 'resting_heart_rate']
    const symptomMetrics = ['composite_score', 'symptom_score', 'Pain', 'Fatigue', 'Brain Fog'] // common ones

    // Actually, let's use a heuristic for symptom metrics in custom_metrics
    const isSymptom = (m: string) => {
        const lower = m.toLowerCase()
        return symptomMetrics.some(s => lower.includes(s.toLowerCase())) || ['composite_score'].includes(m)
    }

    const avgSymptomTail = metrics.filter(isSymptom).reduce((a, m) => a + metricAverages[m], 0) / (metrics.filter(isSymptom).length || 1)
    const avgVitalTail = metrics.filter(m => vitalMetrics.includes(m)).reduce((a, m) => a + metricAverages[m], 0) / (vitalMetrics.length || 1)

    // Identify slow metrics
    const slowest = Object.entries(metricAverages)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .filter(([, val]) => val > 0.5) // Only if it actually takes time
        .map(([m]) => m)

    return {
        avgSymptomRecoveryTail: avgSymptomTail,
        avgBiologicalRecoveryTail: avgVitalTail,
        hysteresisGap: Math.max(0, avgVitalTail - avgSymptomTail),
        slowestRecoverers: slowest
    }
}

/**
 * Phase 2 Analysis: The Event (Impact & Duration)
 */
export function analyzeCrashPhase(epochs: CycleEpoch[], baselineStats: Record<string, { mean: number, std: number }>) {
    const metrics = Object.keys(baselineStats).filter(m => m !== 'Crash' && m !== 'crash')

    const episodes = epochs.map(epoch => {
        let loggedDuration = 0
        let physiologicalDuration = 0
        const peakMetrics: Record<string, number> = {}

        // 1. Calculate Durations
        for (let i = 0; i <= 14; i++) {
            const day = epoch.data.find(d => d.dayOffset === i)
            if (!day) break

            const isLabeled = day.metrics['Crash'] === 1 || day.metrics['crash'] === 1
            if (isLabeled) loggedDuration++

            // Phys. duration: Any metric > 1.0 sigma (stressed) or user label
            const isPhysStressed = Object.values(day.zScores).some(z => z !== null && Math.abs(z) > 1.0)
            if (isLabeled || isPhysStressed) physiologicalDuration++

            // Store peak deviations for this specific episode
            metrics.forEach(m => {
                const z = day.zScores[m] || 0
                if (Math.abs(z) > Math.abs(peakMetrics[m] || 0)) {
                    peakMetrics[m] = z
                }
            })

            // Break if we've left the crash zone (no label and no stress for a buffer day)
            if (i > 0 && !isLabeled && !isPhysStressed) {
                // Check next day for bounce back?
                const nextDay = epoch.data.find(d => d.dayOffset === i + 1)
                if (!nextDay || (!nextDay.metrics['Crash'] && !Object.values(nextDay.zScores).some(z => z !== null && Math.abs(z) > 1.0))) {
                    break
                }
            }
        }
        return { loggedDuration, physiologicalDuration, peakMetrics }
    })

    if (episodes.length === 0) return { type: 'Mixed', avgLoggedDuration: 0, avgPhysiologicalDuration: 0, discoveries: [] }

    const avgLogged = episodes.reduce((a, b) => a + b.loggedDuration, 0) / episodes.length
    const avgPhys = episodes.reduce((a, b) => a + b.physiologicalDuration, 0) / episodes.length

    // 2. Aggregate Discoveries (Solo metrics only)
    const discoveries: any[] = []

    metrics.forEach(m => {
        const avgPeakZ = episodes.reduce((a, b) => a + (b.peakMetrics[m] || 0), 0) / episodes.length

        // Lower threshold slightly to catch subtle but consistent shifts (like Resting HR)
        if (Math.abs(avgPeakZ) > 1.3) {
            const bStats = baselineStats[m]
            const denom = Math.abs(bStats.mean) < 1.0 ? 1.0 : Math.abs(bStats.mean)
            const pctChange = (avgPeakZ * bStats.std) / denom

            discoveries.push({
                metric: m,
                type: avgPeakZ > 0 ? 'spike' : 'drop',
                magnitude: Math.abs(avgPeakZ),
                pctChange: pctChange * 100
            })
        }
    })

    // 3. Identify "Extending" Metrics (Physiological vs Logged)
    // Find metrics that frequently stay > 1.0 sigma after the logged 'Crash' field is false
    const extendingMetrics: string[] = []
    if (avgPhys > avgLogged) {
        metrics.forEach(m => {
            let extensionCount = 0
            episodes.forEach(ep => {
                // We'll use a simpler heuristic: if peakZ is high and it's a slow-recovery metric
                if (Math.abs(ep.peakMetrics[m]) > 1.5) extensionCount++
            })
            if (extensionCount > episodes.length * 0.5) {
                extendingMetrics.push(m)
            }
        })
    }

    let type: 'Dip (Short Episode)' | 'Burnout (Long Episode)' | 'Mixed' = 'Mixed'
    if (avgLogged < 3) type = 'Dip (Short Episode)'
    else if (avgLogged >= 3) type = 'Burnout (Long Episode)'

    return {
        type,
        avgLoggedDuration: avgLogged,
        avgPhysiologicalDuration: avgPhys,
        discoveries: discoveries.sort((a, b) => b.magnitude - a.magnitude).slice(0, 5),
        extendingMetrics: extendingMetrics.slice(0, 3)
    }
}
