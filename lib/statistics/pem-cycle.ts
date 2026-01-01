import { mean, standardDeviation } from 'simple-statistics'
import { startOfDay, endOfDay, parseISO } from 'date-fns'

export interface HealthEntry {
    date: string;
    custom_metrics?: Record<string, number>;
    [key: string]: unknown;
}

// Helper for baseline stats
export function calculateBaselineStats(data: HealthEntry[], metrics: string[]) {
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
    sortedData: HealthEntry[],
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
        const metricsResult: Record<string, { mean: number, std: number, n: number }> = {}

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
 * Refined to include acute triggers (Day 0) and improved confidence scoring.
 */
export function analyzePreCrashPhase(aggregatedProfile: { dayOffset: number, metrics: Record<string, { mean: number, std: number, n: number }> }[], baselineStats: Record<string, { mean: number, std: number }>) {
    // We include day 0 for "Input" metrics (exertion, steps) because they can cause immediate crashes.
    // We exclude day 0 for "Output" metrics (symptoms) to avoid circular reasoning.
    const isInputMetric = (m: string) => {
        const lower = m.toLowerCase();
        return lower.includes('step') || lower.includes('exertion') || lower.includes('active') || lower.includes('stress') || lower.includes('work') || lower.includes('exercise');
    };

    const metrics = Object.keys(aggregatedProfile[0]?.metrics || {})
    const discoveries: { metric: string, type: 'spike' | 'drop', leadDaysStart: number, leadDaysEnd: number, magnitude: number, pctChange: number, isAcute?: boolean, classification?: string, isSynergy?: boolean }[] = []

    // 1. Global Deviation Scanner
    metrics.forEach(m => {
        if (m === 'Crash' || m === 'crash') return

        const profile = aggregatedProfile
            .filter(d => d.dayOffset < 0 || (d.dayOffset === 0 && isInputMetric(m)))
            .map(d => ({
                offset: d.dayOffset,
                zScore: d.metrics[m]?.mean || 0,
                n: d.metrics[m]?.n || 0
            })).sort((a, b) => a.offset - b.offset)

        // Find the window of significance (> 2.0 sigma)
        const significantDays = profile.filter(p => Math.abs(p.zScore) > 2.0)

        if (significantDays.length > 0) {
            const peak = [...significantDays].sort((a, b) => Math.abs(b.zScore) - Math.abs(a.zScore))[0]
            const startDay = significantDays[0].offset
            const endDay = significantDays[significantDays.length - 1].offset

            const bStats = baselineStats[m]
            let pctChange = 0
            if (bStats) {
                const denom = Math.abs(bStats.mean) < 1.0 ? 1.0 : Math.abs(bStats.mean)
                pctChange = (peak.zScore * bStats.std) / denom
            }

            // Refined Classification Logic for better user clarity
            let classification: 'Acute' | 'Lagged' | 'Historical' | 'Cumulative' = 'Historical'
            const windowSize = Math.abs(startDay - endDay) + 1

            if (peak.offset === 0) classification = 'Acute'
            else if (windowSize >= 3) classification = 'Cumulative'
            else if (peak.offset >= -2) classification = 'Lagged'

            discoveries.push({
                metric: m,
                type: peak.zScore > 0 ? 'spike' : 'drop',
                leadDaysStart: Math.abs(startDay),
                leadDaysEnd: Math.abs(endDay),
                magnitude: Math.abs(peak.zScore),
                pctChange: pctChange * 100,
                isAcute: peak.offset === 0,
                classification
            })
        }
    })

    // 2. Combinatorial Scanner (Pairs)
    const pairwiseDiscoveries: { metric: string, type: 'spike' | 'drop', leadDaysStart: number, leadDaysEnd: number, magnitude: number, pctChange: number, isAcute?: boolean, classification?: string, isSynergy?: boolean }[] = []
    const metricList = metrics.filter(m => m !== 'Crash' && m !== 'crash')

    for (let i = 0; i < metricList.length; i++) {
        for (let j = i + 1; j < metricList.length; j++) {
            const m1 = metricList[i]
            const m2 = metricList[j]

            const profile = aggregatedProfile
                .filter(d => d.dayOffset < 0 || (d.dayOffset === 0 && (isInputMetric(m1) || isInputMetric(m2))))
                .map(d => {
                    const z1 = d.metrics[m1]?.mean || 0
                    const z2 = d.metrics[m2]?.mean || 0
                    return {
                        offset: d.dayOffset,
                        z1, z2,
                        jointZ: (z1 + z2) / Math.sqrt(2)
                    }
                })

            const significantDays = profile.filter(p => Math.abs(p.jointZ) > 2.2)

            if (significantDays.length > 0) {
                const peak = [...significantDays].sort((a, b) => Math.abs(b.jointZ) - Math.abs(a.jointZ))[0]

                // SYNERGY CHECK: Only include if the combination is actually stronger than the components alone
                const maxIndividualZ = Math.max(Math.abs(peak.z1), Math.abs(peak.z2))
                if (Math.abs(peak.jointZ) < maxIndividualZ * 1.1) {
                    continue // Not synergistic enough, favors solo spikes instead
                }

                const startDay = significantDays[0].offset
                const endDay = significantDays[significantDays.length - 1].offset

                const b1 = baselineStats[m1]
                const b2 = baselineStats[m2]
                let avgPct = 0
                if (b1 && b2) {
                    const pct1 = (peak.z1 * b1.std) / (Math.abs(b1.mean) < 1.0 ? 1.0 : Math.abs(b1.mean))
                    const pct2 = (peak.z2 * b2.std) / (Math.abs(b2.mean) < 1.0 ? 1.0 : Math.abs(b2.mean))
                    avgPct = ((pct1 + pct2) / 2) * 100
                }

                const windowSize = Math.abs(startDay - endDay) + 1
                let classification: 'Acute' | 'Lagged' | 'Historical' | 'Cumulative' = 'Historical'
                if (peak.offset === 0) classification = 'Acute'
                else if (windowSize >= 3) classification = 'Cumulative'
                else if (peak.offset >= -2) classification = 'Lagged'

                pairwiseDiscoveries.push({
                    metric: `${m1} + ${m2}`,
                    type: peak.jointZ > 0 ? 'spike' : 'drop',
                    leadDaysStart: Math.abs(startDay),
                    leadDaysEnd: Math.abs(endDay),
                    magnitude: Math.abs(peak.jointZ),
                    pctChange: avgPct,
                    isAcute: peak.offset === 0,
                    classification,
                    isSynergy: true
                })
            }
        }
    }

    // 3. Redundancy & Correlation Filtering
    const allSorted = [...discoveries, ...pairwiseDiscoveries].sort((a, b) => b.magnitude - a.magnitude)
    const finalDiscoveries: typeof allSorted = []

    allSorted.forEach(candidate => {
        const isRedundant = finalDiscoveries.some(existing => {
            const cName = candidate.metric.toLowerCase()
            const eName = existing.metric.toLowerCase()

            // If they are exactly the same or highly correlated names
            if (cName === eName) return true
            if ((cName.includes('step') && eName.includes('active')) || (eName.includes('step') && cName.includes('active'))) return true

            // Refined overlap check: 
            // If A is a component of combo A+B.
            const isSubComponent = eName.includes(cName) || cName.includes(eName)
            if (isSubComponent) {
                // If the existing (stronger) discovery is only marginally better (< 20%), keep both.
                // Only hide the candidate if the existing is significantly stronger.
                const magDiff = existing.magnitude - candidate.magnitude
                if (magDiff > existing.magnitude * 0.2) {
                    return true // Candidate is redundant, existing is significantly stronger
                }
                return false // Keep both, they are both powerful and distinct enough or candidate is stronger
            }
            return false
        })
        if (!isRedundant) finalDiscoveries.push(candidate)
    })

    // 4. Cumulative Load & Confidence
    const preDashOnly = aggregatedProfile.filter(d => d.dayOffset < 0 && d.dayOffset >= -5)
    const exertionProfile = preDashOnly.map(d => d.metrics['exertion_score']?.mean || 0)
    const avgExertionPre = exertionProfile.length > 0 ? (exertionProfile.reduce((a, b) => a + b, 0) / exertionProfile.length) : 0

    const stepProfile = preDashOnly.map(d => d.metrics['step_count']?.mean || 0)
    const avgStepsPre = stepProfile.length > 0 ? (stepProfile.reduce((a, b) => a + b, 0) / stepProfile.length) : 0

    // Overall confidence formula: 
    // Higher n of episodes = Higher confidence (max at n=10)
    // Higher magnitude of strongest discovery = Higher confidence
    const maxN = aggregatedProfile[0]?.metrics['hrv']?.n || 1
    const nFactor = Math.min(1.0, maxN / 8)
    const magFactor = Math.min(1.0, (finalDiscoveries[0]?.magnitude || 0) / 4.0)
    const confidence = (nFactor * 0.4) + (magFactor * 0.6)

    return {
        delayedTriggerDetected: finalDiscoveries.some(d => !d.isAcute),
        cumulativeLoadDetected: avgExertionPre > 0.6 || avgStepsPre > 0.6,
        triggerLag: finalDiscoveries[0]?.leadDaysStart || 0,
        confidence,
        discoveries: finalDiscoveries.slice(0, 5)
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

        // 2. Scan from manualExitDay to find when each metric hits baseline (<= 1.0 sigma in strained direction)
        metrics.forEach(m => {
            let recoveryFound = false
            for (let i = manualExitDay; i <= 14; i++) {
                const day = epoch.data.find(d => d.dayOffset === i)
                if (!day) break

                const z = day.zScores[m]
                // Recovery is found when the metric is no longer in a "straining" state
                // We use a slightly more generous 1.0 threshold for "biological return"
                if (z === null || !isStrainingDeviation(m, z, 1.0)) {
                    recoveryStats[m] = i - manualExitDay
                    recoveryFound = true
                    break
                }
            }
            if (!recoveryFound) recoveryStats[m] = 14 - manualExitDay // Capped at end of window
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
 * Helper to determine if a Z-score deviation represents "Strain" 
 * (vs just random variance or a "good" shift like high HRV).
 */
function isStrainingDeviation(metric: string, z: number, threshold: number = 1.0): boolean {
    const lower = metric.toLowerCase();

    // HRV: Lower is stressed (< -threshold)
    if (lower === 'hrv') return z < -threshold;

    // RHR, Symptoms, Exertion, Composite: Higher is stressed (> threshold)
    if (lower.includes('heart_rate') || lower.includes('score') || lower.includes('exertion')) {
        return z > threshold;
    }

    // Default for custom symptoms: Higher is usually worse
    return z > threshold;
}

/**
 * Phase 2 Analysis: The Event (Impact & Duration)
 * Refined to account for metric polarity and precise lagged extensions.
 */
export function analyzeCrashPhase(epochs: CycleEpoch[], baselineStats: Record<string, { mean: number, std: number }>) {
    const metrics = Object.keys(baselineStats).filter(m => m !== 'Crash' && m !== 'crash')

    const episodes = epochs.map(epoch => {
        let loggedDuration = 0
        let physiologicalDuration = 0
        const peakMetrics: Record<string, number> = {}
        const extensionImpacts = new Set<string>()

        // 1. Calculate Durations
        for (let i = 0; i <= 14; i++) {
            const day = epoch.data.find(d => d.dayOffset === i)
            if (!day) break

            const isLabeled = day.metrics['Crash'] === 1 || day.metrics['crash'] === 1
            if (isLabeled) loggedDuration++

            // Phys. duration: Any metric in a "Straining" state (> 1.0 sigma in the bad direction)
            let isPhysStrained = false;
            for (const [m, z] of Object.entries(day.zScores)) {
                if (z !== null && isStrainingDeviation(m, z)) {
                    isPhysStrained = true;
                    // Keep track of what is extending the crash beyond the manual logs
                    if (!isLabeled && i > 0) {
                        extensionImpacts.add(m)
                    }
                }
            }

            if (isLabeled || isPhysStrained) {
                physiologicalDuration = i + 1; // Mark furthest day of stress
            }

            // Store peak deviations for this specific episode
            metrics.forEach(m => {
                const z = day.zScores[m] || 0
                if (Math.abs(z) > Math.abs(peakMetrics[m] || 0)) {
                    peakMetrics[m] = z
                }
            })

            // Break if we've left the "Straining" zone for 2 consecutive days (buffer)
            // to ensure we caught the whole tail
            if (i > 1 && !isLabeled && !isPhysStrained) {
                const nextDay = epoch.data.find(d => d.dayOffset === i + 1)
                const nextIsStrained = nextDay && Object.entries(nextDay.zScores).some(([m, z]) => z !== null && isStrainingDeviation(m, z))
                if (!nextIsStrained) break
            }
        }
        return { loggedDuration, physiologicalDuration, peakMetrics, extensionImpacts }
    })

    if (episodes.length === 0) return { type: 'Mixed', avgLoggedDuration: 0, avgPhysiologicalDuration: 0, discoveries: [] }

    const avgLogged = episodes.reduce((a, b) => a + b.loggedDuration, 0) / episodes.length
    const avgPhys = episodes.reduce((a, b) => a + b.physiologicalDuration, 0) / episodes.length

    // 2. Aggregate Discoveries (Solo metrics only)
    const discoveries: { metric: string, type: 'spike' | 'drop', magnitude: number, pctChange: number, leadDaysStart: number, leadDaysEnd: number }[] = []

    metrics.forEach(m => {
        const avgPeakZ = episodes.reduce((a, b) => a + (b.peakMetrics[m] || 0), 0) / episodes.length

        // Catch subtle but consistent shifts (1.3 sigma average peak)
        if (Math.abs(avgPeakZ) > 1.3) {
            const bStats = baselineStats[m]
            const denom = Math.abs(bStats.mean) < 1.0 ? 1.0 : Math.abs(bStats.mean)
            const pctChange = (avgPeakZ * bStats.std) / denom

            discoveries.push({
                metric: m,
                type: avgPeakZ > 0 ? 'spike' : 'drop',
                magnitude: Math.abs(avgPeakZ),
                pctChange: pctChange * 100,
                leadDaysStart: 0,
                leadDaysEnd: 0
            })
        }
    })

    // Apply redundancy filtering to Phase 2 discoveries
    const finalDiscoveries: typeof discoveries = []
    discoveries.sort((a, b) => b.magnitude - a.magnitude).forEach(candidate => {
        const isRedundant = finalDiscoveries.some(existing => {
            const cName = candidate.metric.toLowerCase()
            const eName = existing.metric.toLowerCase()
            return cName.includes(eName) || eName.includes(cName)
        })
        if (!isRedundant) finalDiscoveries.push(candidate)
    })

    // 3. Identify "Extending" Metrics
    // Metrics that consistently cause physiological stress after the 'Crash' label is removed
    const extensionCounts: Record<string, number> = {}
    episodes.forEach(ep => {
        ep.extensionImpacts.forEach(m => {
            extensionCounts[m] = (extensionCounts[m] || 0) + 1
        })
    })

    const extendingMetrics = Object.entries(extensionCounts)
        .filter(([, count]) => count >= episodes.length * 0.4) // Frequently seen
        .sort(([, a], [, b]) => b - a)
        .map(([m]) => m)

    let type: 'Acute Impact' | 'Sustained Episode' | 'Mixed' = 'Mixed'
    if (avgLogged < 3) type = 'Acute Impact'
    else if (avgLogged >= 3) type = 'Sustained Episode'

    return {
        type,
        avgLoggedDuration: avgLogged,
        avgPhysiologicalDuration: avgPhys,
        discoveries: finalDiscoveries.slice(0, 5),
        extendingMetrics: extendingMetrics.slice(0, 3)
    }
}
