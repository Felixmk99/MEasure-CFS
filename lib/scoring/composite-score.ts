import { calculateSymptomScore, calculateExertionScore, calculateCompositeScore } from "@/lib/scoring/logic";

export interface ScoreComponents {
    composite_score: number | null
    normalized_hrv: number | null
    normalized_rhr: number | null
    normalized_steps: number | null
    normalized_exertion: number | null
    normalized_sleep: number | null
}

export type ScorableEntry = {
    id?: string
    date: string
    hrv?: number | null
    resting_heart_rate?: number | null
    step_count?: number | null
    symptom_score?: number | null
    exertion_score?: number | null
    custom_metrics?: Record<string, unknown>
    [key: string]: unknown
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
 * Score = Symptoms + Sleep - Exertion + RHR - HRV - NormalizedSteps
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
        // DYNAMIC CALCULATION: Do not trust DB 'symptom_score'/ 'exertion_score' as they may be outdated.
        // We recalculate sums from custom_metrics strictly using the Centralized Logic.
        const symptomSum = calculateSymptomScore(entry.custom_metrics)
        const exertionSum = calculateExertionScore(entry.custom_metrics)
        const sleepVal = Number(entry.custom_metrics?.['Sleep']) || 0

        // Calculate Generalized Factors
        // Steps Normalization: User requested 0-1 scale
        const rawNormSteps = normalize(entry.step_count, stats.steps.min, stats.steps.max)
        const normSteps = Number(rawNormSteps.toFixed(2)) // Scale 0-1

        const normRhr = normalize(entry.resting_heart_rate, stats.rhr.min, stats.rhr.max)
        const normHrv = normalize(entry.hrv, stats.hrv.min, stats.hrv.max)
        const normExertion = normalize(exertionSum, stats.exertion.min, stats.exertion.max)
        const normSleep = normalize(sleepVal, stats.sleep.min, stats.sleep.max)

        // MEasure-CFS Score Calculation (User Defined Strict Formula) via Logic Module
        const rhr = Number(entry.resting_heart_rate) || 0
        const hrv = Number(entry.hrv) || 0

        const composite = calculateCompositeScore({
            symptomScore: symptomSum,
            exertionScore: exertionSum,
            sleepScore: sleepVal,
            rhr,
            hrv,
            normalizedSteps: normSteps
        })

        return {
            ...entry,
            // OVERRIDE with dynamically calculated strict sums to fix dashboard graph
            symptom_score: symptomSum,
            exertion_score: exertionSum,

            composite_score: composite, // MEasure-CFS Score
            normalized_hrv: Number(normHrv.toFixed(2)),
            normalized_rhr: Number(normRhr.toFixed(2)),
            normalized_steps: normSteps, // Now 0-1 scale
            normalized_exertion: Number(normExertion.toFixed(2)),
            normalized_sleep: Number(normSleep.toFixed(2))
        }
    })
}

// Helpers
function isNumber(v: unknown): v is number {
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
