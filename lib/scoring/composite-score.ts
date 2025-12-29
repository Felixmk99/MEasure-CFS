
export interface ScoreComponents {
    composite_score: number | null
    normalized_hrv: number | null
    normalized_rhr: number | null
    normalized_steps: number | null
}

export type ScorableEntry = {
    date: string
    hrv?: number | null
    resting_heart_rate?: number | null
    step_count?: number | null
    symptom_score?: number | null
    exertion_score?: number | null
    custom_metrics?: any
    [key: string]: any
}

export type NormalizationStats = {
    hrv: { min: number, max: number }
    rhr: { min: number, max: number }
    steps: { min: number, max: number }
}

/**
 * Extracts min/max values for all normalized metrics in a dataset.
 */
export function calculateMinMaxStats(data: ScorableEntry[]): NormalizationStats {
    const validHrv = data.map(d => d.hrv).filter(isNumber)
    const validRhr = data.map(d => d.resting_heart_rate).filter(isNumber)
    const validSteps = data.map(d => d.step_count).filter(isNumber)

    return {
        hrv: getMinMax(validHrv),
        rhr: getMinMax(validRhr),
        steps: getMinMax(validSteps)
    }
}

/**
 * Enhances a dataset with the unified Composite Score (Track-Me Score).
 */
export function enhanceDataWithScore<T extends ScorableEntry>(data: T[], sharedStats?: NormalizationStats): (T & ScoreComponents)[] {
    if (!data || data.length === 0) return []

    // 1. Calculate or use shared stats
    const stats = sharedStats || calculateMinMaxStats(data)

    // 2. Enhance Each Entry
    return data.map(entry => {
        const symptomSum = Number(entry.symptom_score) || 0
        const exertionSum = Number(entry.exertion_score) || 0

        let sleepScore = 0
        const sleepKey = findKey(entry.custom_metrics || {}, ['sleep', 'sleep_quality', 'sleep_score', 'quality_of_sleep'])
        if (sleepKey) {
            const val = entry.custom_metrics[sleepKey]
            if (isNumber(val)) sleepScore = val
        }

        const WEIGHT = 3
        const normSteps = normalize(entry.step_count, stats.steps.min, stats.steps.max) * WEIGHT
        const normRhr = normalize(entry.resting_heart_rate, stats.rhr.min, stats.rhr.max) * WEIGHT
        const normHrv = normalize(entry.hrv, stats.hrv.min, stats.hrv.max) * WEIGHT

        let composite = (symptomSum + normRhr + sleepScore) - (exertionSum + normSteps + normHrv)
        if (composite < 0) composite = 0

        return {
            ...entry,
            composite_score: composite,
            normalized_hrv: normHrv,
            normalized_rhr: normRhr,
            normalized_steps: normSteps
        }
    })
}

// Helpers
function isNumber(v: any): v is number {
    return typeof v === 'number' && !isNaN(v)
}

function getMinMax(values: number[]) {
    if (values.length === 0) return { min: 0, max: 1 } // Prevent div by zero
    const min = Math.min(...values)
    const max = Math.max(...values)
    return { min, max: min === max ? max + 1 : max } // Prevent div by zero if all values same
}

function normalize(val: number | null | undefined, min: number, max: number): number {
    if (val === null || val === undefined) return 0
    return (val - min) / (max - min)
}

function findKey(obj: any, candidates: string[]): string | null {
    if (!obj) return null
    const keys = Object.keys(obj)
    for (const c of candidates) {
        const found = keys.find(k => k.toLowerCase().replace(/_/g, ' ').includes(c.toLowerCase().replace(/_/g, ' '))) // fuzzy match?
        // Strict match first
        if (keys.find(k => k.toLowerCase() === c.toLowerCase())) return keys.find(k => k.toLowerCase() === c.toLowerCase())!
    }
    // Fuzzy fallback
    for (const c of candidates) {
        const found = keys.find(k => k.toLowerCase().includes(c.toLowerCase()))
        if (found) return found
    }
    return null
}

/**
 * Recalculates the composite score for a single day based on updated stats.
 * Uses hardcoded defaults if min/max stats aren't available, assuming "average" user range.
 */
export function calculateDailyCompositeScore(entry: ScorableEntry): number {
    const symptomSum = Number(entry.symptom_score) || 0
    const exertionSum = Number(entry.exertion_score) || 0

    let sleepScore = 0
    const sleepKey = findKey(entry.custom_metrics || {}, ['sleep', 'sleep_quality', 'sleep_score', 'quality_of_sleep'])
    if (sleepKey) {
        const val = entry.custom_metrics[sleepKey]
        if (isNumber(val)) sleepScore = val
    }

    // Default normalization ranges (approximations)
    // HRV: 10-100, RHR: 40-100, Steps: 0-10000
    // In a tailored system, we'd pass in the User's specific historical min/max here.
    const WEIGHT = 3
    const normSteps = normalize(entry.step_count, 0, 10000) * WEIGHT
    const normRhr = normalize(entry.resting_heart_rate, 40, 100) * WEIGHT
    const normHrv = normalize(entry.hrv, 10, 100) * WEIGHT

    let composite = (symptomSum + normRhr + sleepScore) - (exertionSum + normSteps + normHrv)
    if (composite < 0) composite = 0

    return Number(composite.toFixed(2))
}
