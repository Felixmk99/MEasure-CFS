
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

/**
 * Enhances a dataset with the unified Composite Score (Track-Me Score).
 * 
 * Formula: (Symptom Sum) - (Exertion Sum) - (Norm. Steps) + (Norm. RHR) - (Norm. HRV) + (Sleep Score)
 * 
 * Normalization uses Min/Max of the specific dataset passed in.
 * Note: Symptom Sum includes all custom symptoms. Exertion Sum includes only the 4 core 
 * exertion categories (Cognitive, Emotional, Physical, Social) and excludes Stability Score.
 */
export function enhanceDataWithScore<T extends ScorableEntry>(data: T[]): (T & ScoreComponents)[] {
    if (!data || data.length === 0) return []

    // DEBUG: Check input sample
    if (Math.random() > 0.95) {
        console.log("Enhancing Data SAMPLE:", data[0])
    }

    // 1. Extract Arrays for Normalization
    const validHrv = data.map(d => d.hrv).filter(isNumber)
    const validRhr = data.map(d => d.resting_heart_rate).filter(isNumber)
    const validSteps = data.map(d => d.step_count).filter(isNumber)

    // 2. Calculate Min/Max
    const stats = {
        hrv: getMinMax(validHrv),
        rhr: getMinMax(validRhr),
        steps: getMinMax(validSteps)
    }

    // 3. Enhance Each Entry
    return data.map(entry => {
        // --- A. Base Scores ---
        // Treat null as 0 for sums to avoid breaking calculations
        // Logic: if current day has no score, it adds 0 to the total burden.
        const symptomSum = Number(entry.symptom_score) || 0
        const exertionSum = Number(entry.exertion_score) || 0

        // Extract Sleep Score (Usually "Sleep Quality" or "Sleep Score" in custom metrics)
        // User stated: "sleep is 0 to 4 like rest of Visible app trackers, so 4 is horrible sleep"
        // We look for common keys.
        let sleepScore = 0
        const sleepKey = findKey(entry.custom_metrics || {}, ['sleep', 'sleep_quality', 'sleep_score', 'quality_of_sleep'])
        if (sleepKey) {
            const val = entry.custom_metrics[sleepKey]
            if (isNumber(val)) sleepScore = val
        }

        // --- B. Normalized Factors ---
        // Weight: x3 for normalized factors to match previous logic?
        // Previous logic: ((val - min) / (max - min)) * 3
        // We will stick to the x3 weight unless user specifies otherwise, as it balances well with 0-10 symptom scales.
        const WEIGHT = 3

        const normSteps = normalize(entry.step_count, stats.steps.min, stats.steps.max) * WEIGHT
        const normRhr = normalize(entry.resting_heart_rate, stats.rhr.min, stats.rhr.max) * WEIGHT
        const normHrv = normalize(entry.hrv, stats.hrv.min, stats.hrv.max) * WEIGHT

        // --- C. Composite Calculation ---
        // Formula: (Sym - Exert - Steps) + (RHR - HRV) + Sleep
        // Grouped for clarity:
        // Bad Things (Add): Symptom Sum, Norm RHR, Sleep Score
        // Good Things (Subtract): Exertion Sum, Norm Steps, Norm HRV

        let composite = (symptomSum + normRhr + sleepScore) - (exertionSum + normSteps + normHrv)

        // Clamp to 0? Or allow negative?
        // Previous logic clamped to 0. 
        // With "Low is Good", negative might be "Super Good".
        // But usually "Score" implies symptom load.
        // Let's clamped at 0 for UI consistency unless directed otherwise.
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
