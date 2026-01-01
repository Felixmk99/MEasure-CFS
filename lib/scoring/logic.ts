export const EXERTION_METRICS = [
    "Cognitive Exertion",
    "Emotional Exertion",
    "Physical Exertion",
    "Social Exertion",
    // Short forms (legacy/alt):
    "Cognitive", "Emotional", "Physical", "Social",
    // Visible CSV specific:
    "Mentally demanding",
    "Emotionally stressful",
    "Physically active",
    "Socially demanding",
    "Work Exertion",
    // Bearable common categories:
    "Work", "Stress", "Video Calls", "Sociability level", "Activity level", "Social interaction"
]

// Metrics that should NEVER be summed into the Symptom Score
export const SYMPTOM_EXCLUSIONS = [
    // Metadata / Non-metrics
    'Menstrual Flow', 'Note', 'Tag',

    // Independent Scores/Metrics
    'Sleep', 'Sleep Duration', 'Sleep Quality',
    'Stability Score',
    'composite_score',
    'exertion_score',
    'symptom_score',
    'HRV', 'Resting HR', 'Steps', 'Step Count', 'Infection', // Standard metrics
    'Mood', 'Energy', 'Caffeine', 'Weather',

    // Lowercase variants safe-guard
    'hrv', 'resting_heart_rate', 'step_count', 'sleep', 'note', 'tag', 'infection',
    'mood', 'energy', 'caffeine', 'weather'
]

/**
 * Calculates the Total Exertion Score from a set of metrics.
 * Sums up any metric that matches the EXERTION_METRICS list.
 */
export function calculateExertionScore(metrics: Record<string, any> | null | undefined): number {
    if (!metrics) return 0
    let sum = 0

    Object.entries(metrics).forEach(([key, val]) => {
        const numVal = Number(val)
        if (isNaN(numVal)) return

        if (EXERTION_METRICS.includes(key)) {
            sum += numVal
        }
    })

    return sum
}

/**
 * Calculates the Total Symptom Score from a set of metrics.
 * Sums up ALL metrics EXCEPT those strictly excluded or identified as Exertion.
 */
export function calculateSymptomScore(metrics: Record<string, any> | null | undefined): number {
    if (!metrics) return 0
    let sum = 0

    Object.entries(metrics).forEach(([key, val]) => {
        const numVal = Number(val)
        if (isNaN(numVal)) return

        // 1. Skip Exertion metrics (they belong to Exertion Score)
        if (EXERTION_METRICS.includes(key)) return

        // 2. Skip Explicit Exclusions (Sleep, Metadata, other Scores)
        if (SYMPTOM_EXCLUSIONS.includes(key)) return

        // 3. Skip if key is in exclusions (case-insensitive check for safety?)
        // Currently exact match is preferred for performance, but let's check strict list first.
        // For safety, we can check lowercase if we want, but standard keys are reliable.

        sum += numVal
    })

    return sum
}

/**
 * Calculates the MEasure-CFS Composite Score.
 * Formula: Symptoms + Sleep - Exertion + RHR - HRV - NormalizedSteps
 * 
 * Note: Steps must be pre-normalized (0-1) before passing in.
 */
export function calculateCompositeScore(p: {
    symptomScore: number,
    exertionScore: number,
    sleepScore: number, // Raw Sleep Value (usually 0-10 or 0-100, but logic assumes unweighted addition)
    rhr: number,
    hrv: number,
    normalizedSteps: number
}): number {
    // Formula: Score = Symptoms + Sleep - Exertion + RHR - HRV - NormalizedSteps
    const score = p.symptomScore + p.sleepScore - p.exertionScore + p.rhr - p.hrv - p.normalizedSteps

    // Return formatted to 1 decimal place (as number)
    return Number(score.toFixed(1))
}
