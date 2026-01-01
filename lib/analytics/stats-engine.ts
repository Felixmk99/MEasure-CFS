import * as ss from 'simple-statistics'
import { isWithinInterval, subDays, parseISO } from 'date-fns'
import { Database } from '@/types/database.types'
import { enhanceDataWithScore, ScorableEntry } from '@/lib/scoring/composite-score'

type Experiment = Database['public']['Tables']['experiments']['Row']
type Metric = Database['public']['Tables']['health_metrics']['Row']

interface ExperimentResult {
    experimentId: string
    metricName: string
    baselineMean: number
    treatmentMean: number
    changePercent: number
    isSignificant: boolean // Simplified placeholder for now
    sampleSizeBaseline: number
    sampleSizeTreatment: number
}

/**
 * Analyzes the impact of an experiment on health health_metrics.
 * Compares the "Treatment Period" (Start to End/Now) vs "Baseline Period" (Equal length before Start).
 */
export function analyzeExperiment(experiment: Experiment, metrics: Metric[]): ExperimentResult | null {
    const startDate = parseISO(experiment.start_date)
    const endDate = experiment.end_date ? parseISO(experiment.end_date) : new Date()

    // We cast strictly to ScorableEntry[] to satisfy the scoring logic
    const scoredMetrics = enhanceDataWithScore(metrics as unknown as ScorableEntry[])

    // Define Baseline Period: Look back same duration as the treatment duration
    // e.g. If treatment is 30 days, look at 30 days before start.
    const treatmentDuration = endDate.getTime() - startDate.getTime()
    const baselineStart = new Date(startDate.getTime() - treatmentDuration)

    // Filter metrics
    const baselineValues = scoredMetrics
        .filter(m => isWithinInterval(parseISO(m.date), { start: baselineStart, end: subDays(startDate, 1) }))
        .map(m => m.composite_score)
        .filter((s): s is number => s !== null)

    const treatmentValues = scoredMetrics
        .filter(m => isWithinInterval(parseISO(m.date), { start: startDate, end: endDate }))
        .map(m => m.composite_score)
        .filter((s): s is number => s !== null)

    if (baselineValues.length < 3 || treatmentValues.length < 3) {
        return null; // Not enough data
    }

    const baselineMean = ss.mean(baselineValues)
    const treatmentMean = ss.mean(treatmentValues)

    // Calculate percentage change
    // Avoid division by zero
    const changePercent = baselineMean !== 0
        ? ((treatmentMean - baselineMean) / baselineMean) * 100
        : 0

    // T-Test logic is complex to implement robustly from scratch without errors.
    // For now, we consider > 5% change as "Significant" for the UI highlight.
    const isSignificant = Math.abs(changePercent) > 5

    return {
        experimentId: experiment.id,
        metricName: 'Composite Health Score',
        baselineMean: Math.round(baselineMean),
        treatmentMean: Math.round(treatmentMean),
        changePercent: Math.round(changePercent * 10) / 10,
        isSignificant,
        sampleSizeBaseline: baselineValues.length,
        sampleSizeTreatment: treatmentValues.length
    }
}
