
export interface ScoreComponents {
    composite_score: number | null
    normalized_hrv: number | null
    normalized_rhr: number | null
    normalized_steps: number | null
    normalized_exertion: number | null
    normalized_sleep: number | null
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
    exertion: { min: number, max: number }
    sleep: { min: number, max: number }
}

/**
 * Extracts min/max values for all normalized metrics in a dataset.
 */
export function calculateMinMaxStats(data: ScorableEntry[]): NormalizationStats {
    const validHrv = data.map(d => d.hrv).filter(isNumber)
    const validRhr = data.map(d => d.resting_heart_rate).filter(isNumber)
    const validSteps = data.map(d => d.step_count).filter(isNumber)
    const validExertion = data.map(d => d.exertion_score).filter(isNumber)

    // Sleep is strictly identified by the key "Sleep"
    const validSleep = data.map(d => d.custom_metrics?.['Sleep']).filter(isNumber)

    return {
        hrv: getMinMax(validHrv), // HRV Natural variation
        rhr: getMinMax(validRhr), // RHR Natural variation
        steps: getMinMax(validSteps, true), // Force Min 0
        exertion: getMinMax(validExertion, true), // Force Min 0
        sleep: getMinMax(validSleep, true) // Force Min 0 (or 0-100 usually)
    }
}

/**
 * Enhances a dataset with the unified Composite Score (MEasure-CFS Score).
 * 
 * Formula (Strain/Risk Index):
 * Score = Symptoms + (NormRHR * 3) + (NormSteps * 3) + (NormExertion * 3) - (NormHRV * 3) - (NormSleep * 3)
 * 
 * Result:
 * - High Score = High Strain/Symptoms (Bad)
 * - Low Score = Low Strain/Recovery (Good)
 * 
 * Note: Dashboard usually Inverts this for display if "Higher is Better" is desired, 
 * or displays as "Symptom Load" (Lower is Better).
 * Currently Dashboard config matches "Lower is Better" (Invert: True).
 */
export function enhanceDataWithScore<T extends ScorableEntry>(data: T[], sharedStats?: NormalizationStats): (T & ScoreComponents)[] {
    if (!data || data.length === 0) return []

    // 1. Calculate or use shared stats
    const stats = sharedStats || calculateMinMaxStats(data)

    // 2. Enhance Each Entry
    return data.map(entry => {
        const symptomSum = Number(entry.symptom_score) || 0
        const exertionSum = Number(entry.exertion_score) || 0

        // Extract Sleep (Strict "Sleep" key)
        let sleepVal = 0
        if (entry.custom_metrics?.['Sleep']) {
            const val = entry.custom_metrics['Sleep']
            if (isNumber(val)) sleepVal = val
        }

        const WEIGHT = 3

        // Calculate Generalized Factors (0-1 Scale * Weight)
        const normSteps = normalize(entry.step_count, stats.steps.min, stats.steps.max) * WEIGHT
        const normRhr = normalize(entry.resting_heart_rate, stats.rhr.min, stats.rhr.max) * WEIGHT
        const normHrv = normalize(entry.hrv, stats.hrv.min, stats.hrv.max) * WEIGHT
        const normExertion = normalize(exertionSum, stats.exertion.min, stats.exertion.max) * WEIGHT
        const normSleep = normalize(sleepVal, stats.sleep.min, stats.sleep.max) * WEIGHT

        // MEasure-CFS Score Calculation:
        // Base: Symptom Sum
        // Add Stressors: RHR (High=Bad), Steps (Activity=Risk), Exertion (Load=Risk)
        // Subtract Recovery: HRV (High=Good), Sleep (High=Good)
        let composite = (symptomSum + normRhr + normSteps + normExertion) - (normHrv + normSleep)

        if (composite < 0) composite = 0

        return {
            ...entry,
            composite_score: Number(composite.toFixed(1)), // MEasure-CFS Score
            normalized_hrv: Number(normHrv.toFixed(2)),
            normalized_rhr: Number(normRhr.toFixed(2)),
            normalized_steps: Number(normSteps.toFixed(2)),
            normalized_exertion: Number(normExertion.toFixed(2)),
            normalized_sleep: Number(normSleep.toFixed(2))
        }
    })
}

// Helpers
function isNumber(v: any): v is number {
    return typeof v === 'number' && !isNaN(v)
}

function getMinMax(values: number[], forceZeroMin = false) {
    if (values.length === 0) return { min: 0, max: 1 } // Default range
    const min = forceZeroMin ? 0 : Math.min(...values)
    const max = Math.max(...values)
    return { min, max: min === max ? max + 1 : max } // Prevent div by zero
}

function normalize(val: number | null | undefined, min: number, max: number): number {
    if (val === null || val === undefined) return 0
    return (val - min) / (max - min)
}

function findKey(obj: any, candidates: string[]): string | null {
    if (!obj) return null
    const keys = Object.keys(obj)
    // Precise match first
    for (const c of candidates) {
        if (keys.find(k => k.toLowerCase() === c.toLowerCase())) return keys.find(k => k.toLowerCase() === c.toLowerCase())!
    }
    // Fuzzy match
    for (const c of candidates) {
        const found = keys.find(k => k.toLowerCase().replace(/_/g, ' ').includes(c.toLowerCase().replace(/_/g, ' ')))
        if (found) return found
    }
    return null
}

