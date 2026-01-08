import * as ss from 'simple-statistics';
import { EXERTION_METRICS } from '@/lib/scoring/logic';
import { tDistributionCDF } from '@/lib/statistics/experiment-analysis';
import { getMetricRegistryConfig } from '@/lib/metrics/registry';

export interface InsightMetric {
    date: string;
    custom_metrics?: Record<string, number>;
    // Allow dynamic metric names but constrain to expected types
    [key: string]: string | number | Record<string, number> | undefined;
}

export interface CorrelationResult {
    metricA: string;
    metricB: string;
    coefficient: number; // -1 to 1
    lag: number; // Days shift
    impactDirection: 'positive' | 'negative' | 'neutral';
    impactStrength: 'strong' | 'moderate' | 'weak';
    medianA: number;  // Median value of metric A for concrete thresholds
    medianB: number;  // Median value of metric B for concrete thresholds
    percentChange: number;  // Percentage change in metric B
    typicalValue: number;  // Typical value of metric B (when A is low)
    improvedValue: number;  // Improved value of metric B (when A is high)
    isGood: boolean;       // Whether this is a positive health pattern
    pValue: number;        // Statistical significance
    sampleSize: number;    // Number of matched pairs (N)
}

export interface ThresholdInsight {
    metric: string;
    impactMetric: string;
    safeZoneLimit: number;
}

/**
 * Calculates correlation between all pairs of metrics.
 * Surfaces leading and lagging indicators using a window of 0-2 days.
 */
// Minimum data points required for statistical significance
const MIN_DATA_POINTS = 10;

export function calculateAdvancedCorrelations(data: InsightMetric[]): CorrelationResult[] {
    if (data.length < MIN_DATA_POINTS) return [];

    const metrics = extractAvailableMetrics(data);
    const results: CorrelationResult[] = [];

    // Sort data by date for lagged analysis
    const sortedData = [...data].sort((a, b) => a.date.localeCompare(b.date));

    metrics.forEach((metricA, indexA) => {
        metrics.forEach((metricB, indexB) => {
            if (metricA === metricB) return;

            // Lags 0, 1, 2
            [0, 1, 2].forEach(lag => {
                // IMPORTANT: Symmetry filter only applies to Lag 0.
                // Lag 0: corr(A,B) == corr(B,A). 
                // Lag > 0: corr(At, Bt+1) != corr(Bt, At+1). It is directional.
                if (lag === 0 && indexB <= indexA) return;

                const pair = getAlignedPairs(sortedData, metricA, metricB, lag);
                if (pair.a.length < 5) return;

                try {
                    const coefficient = ss.sampleCorrelation(pair.a, pair.b);

                    // --- ADVANCED RIGOR: P-Value Calculation ---
                    // n = pair.a.length. df = n - 2 (standard for correlation)
                    const n = pair.a.length;
                    const df = n - 2;
                    let pValue = 1;

                    if (df > 0) {
                        // Formula: t = r * sqrt( (n-2) / (1-r^2) )
                        const rSquared = coefficient * coefficient;
                        const invRSquared = 1 - rSquared;

                        if (invRSquared <= EPS) {
                            pValue = 0; // Perfect or near-perfect correlation (r=1 or r=-1)
                        } else {
                            // Clamp denominator to EPS and verify finiteness
                            const tStat = coefficient * Math.sqrt(df / Math.max(invRSquared, EPS));
                            if (isFinite(tStat)) {
                                pValue = 2 * (1 - tDistributionCDF(Math.abs(tStat), df));
                            } else {
                                pValue = 0; // Treat as perfect if t is infinite
                            }
                        }
                    }

                    // Exertion Check: Match exact metric names (case-insensitive) to avoid false positives like "Physical_recovery_score"
                    const isExertionEffect = EXERTION_METRICS.some(e => metricB.toLowerCase() === e.toLowerCase());
                    if (isExertionEffect) return;

                    // matrix needs lag=0. insights need p < 0.15 (likely trend)
                    if (lag === 0 || pValue < 0.15) {
                        const medianA = calculateMedian(pair.a);
                        const medianB = calculateMedian(pair.b);
                        const stats = calculatePercentageChange(sortedData, metricA, metricB, medianA, lag);

                        results.push({
                            metricA,
                            metricB,
                            coefficient,
                            lag,
                            impactDirection: coefficient > 0.1 ? 'positive' : coefficient < -0.1 ? 'negative' : 'neutral',
                            impactStrength: Math.abs(coefficient) > 0.7 ? 'strong' : Math.abs(coefficient) > 0.5 ? 'moderate' : 'weak',
                            medianA,
                            medianB,
                            percentChange: stats.percentChange,
                            typicalValue: stats.typicalValue,
                            improvedValue: stats.improvedValue,
                            isGood: isGoodPattern(metricB, coefficient),
                            pValue,
                            sampleSize: n
                        });
                    }
                } catch {
                    // Skip if variance is 0
                }
            });
        });
    });

    // Sort by strength
    return results.sort((a, b) => Math.abs(b.coefficient) - Math.abs(a.coefficient));
}

/**
 * Detects 'Safe Zones' where a metric (like steps) significantly increases symptom load.
 */
// Threshold multiplier for detecting significant symptom increases (50% increase)
const SIGNIFICANT_INCREASE_THRESHOLD = 1.5;

export function detectThresholds(
    data: InsightMetric[],
    impactMetric: string = 'symptom_score',
    triggerMetrics: string[] = ['step_count', 'Physical Exertion', 'Cognitive Exertion', 'Work']
): ThresholdInsight[] {
    if (data.length < MIN_DATA_POINTS) return [];
    const metrics = triggerMetrics;
    const insights: ThresholdInsight[] = [];

    metrics.forEach(m => {
        const pairs = data
            .map(d => ({
                x: getValue(d, m) ?? NaN,
                y: getValue(d, impactMetric) ?? NaN
            }))
            .filter(p => !isNaN(p.x) && !isNaN(p.y));

        if (pairs.length < 10) return;

        // Simplified threshold detection: Look for the point where average Y increases significantly
        pairs.sort((a, b) => a.x - b.x);

        // Divide into 4 buckets and check Mean shift
        const bucketSize = Math.floor(pairs.length / 4);
        const means = [];
        for (let i = 0; i < 4; i++) {
            const end = i === 3 ? pairs.length : (i + 1) * bucketSize;
            const slice = pairs.slice(i * bucketSize, end);
            means.push(ss.mean(slice.map(s => s.y)));
        }

        // If bucket 3 or 4 mean is > 50% higher than bucket 1
        if (means[2] > means[0] * SIGNIFICANT_INCREASE_THRESHOLD || means[3] > means[0] * SIGNIFICANT_INCREASE_THRESHOLD) {
            const thresholdIndex = means[2] > means[0] * SIGNIFICANT_INCREASE_THRESHOLD ? bucketSize * 2 : bucketSize * 3;
            const limit = pairs[thresholdIndex].x;

            insights.push({
                metric: m,
                impactMetric,
                safeZoneLimit: limit
            });
        }
    });

    return insights;
}

const RECOVERY_MIN_DAYS = 14;
const RECOVERY_SPIKE_THRESHOLD = 1.5;
const RECOVERY_WINDOW_DAYS = 7;
const RECOVERY_MAX_CAP = 8;
const RECOVERY_MIN_SAMPLES = 2;
const RECOVERY_CONFIDENCE_SAMPLE_COUNT = 5; // 5 samples = 100% confidence
const EPS = 1e-12; // Epsilon for numerical stability

/**
 * Calculates typical recovery velocity from exertion spikes.
 * @experimental Analyzes how many days it takes for symptoms to return to baseline after an exertion spike.
 */
export function calculateRecoveryVelocity(data: InsightMetric[]): { exertionMetric: string, outcomeMetric: string, recoveryDays: number, confidence: number }[] {
    if (data.length < RECOVERY_MIN_DAYS) return [];

    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const exertionMetrics = extractAvailableMetrics(data).filter(m =>
        EXERTION_METRICS.some(e => m.toLowerCase() === e.toLowerCase()) || m === 'step_count'
    );
    const outcomeMetrics = ['symptom_score', 'hrv', 'adjusted_score'].filter(m => extractAvailableMetrics(data).includes(m));

    const results: { exertionMetric: string, outcomeMetric: string, recoveryDays: number, confidence: number }[] = [];

    exertionMetrics.forEach(exM => {
        const values = sortedData.map(d => getValue(d, exM)).filter((v): v is number => v !== null);
        if (values.length < 10) return;

        const mean = ss.mean(values);
        const stdDev = ss.standardDeviation(values);
        const spikeThreshold = mean + RECOVERY_SPIKE_THRESHOLD * stdDev;

        outcomeMetrics.forEach(outM => {
            const recoveryTimes: number[] = [];

            for (let i = 1; i < sortedData.length - RECOVERY_WINDOW_DAYS; i++) {
                const currentEx = getValue(sortedData[i], exM);
                const prevOut = getValue(sortedData[i - 1], outM);

                if (currentEx !== null && currentEx > spikeThreshold && prevOut !== null) {
                    // We found a spike! Now track recovery.
                    // Baseline is the outcome value the day BEFORE the spike.
                    let recovered = false;
                    const registry = getMetricRegistryConfig(outM);
                    const higherIsBetter = registry.direction === 'higher';

                    for (let day = 1; day <= RECOVERY_WINDOW_DAYS; day++) {
                        const futureOut = getValue(sortedData[i + day], outM);
                        if (futureOut === null) continue;

                        // Use registry direction to decide recovery
                        const hasRecovered = higherIsBetter ? futureOut >= prevOut : futureOut <= prevOut;

                        if (hasRecovered) {
                            recoveryTimes.push(day);
                            recovered = true;
                            break;
                        }
                    }
                    if (!recovered) recoveryTimes.push(RECOVERY_MAX_CAP); // Cap for "more than a week"
                }
            }

            if (recoveryTimes.length >= RECOVERY_MIN_SAMPLES) {
                results.push({
                    exertionMetric: exM,
                    outcomeMetric: outM,
                    recoveryDays: ss.mean(recoveryTimes),
                    confidence: Math.min(recoveryTimes.length / RECOVERY_CONFIDENCE_SAMPLE_COUNT, 1) // Confidence based on sample size
                });
            }
        });
    });

    return results;
}

// Helpers
// Non-metric fields to exclude from analysis
const PROVIDER_FIELDS = ['symptom_provider', 'step_provider'] as const;

function extractAvailableMetrics(data: InsightMetric[]): string[] {
    const keys = new Set<string>();
    data.forEach(d => {
        Object.keys(d).forEach(k => {
            // Exclude normalized metrics, date, and custom_metrics container
            if (k !== 'date' &&
                k !== 'custom_metrics' &&
                k !== 'Funcap Score' &&
                !k.toLowerCase().includes('normalized') &&
                typeof d[k] === 'number') {
                keys.add(k);
            }
        });
        if (d.custom_metrics) {
            Object.keys(d.custom_metrics).forEach(k => {
                // Exclude normalized custom metrics
                if (!k.toLowerCase().includes('normalized') &&
                    k !== 'Funcap Score' &&
                    typeof d.custom_metrics?.[k] === 'number') { // Redundant !isNaN removed
                    keys.add(k);
                }
            });
        }
    });
    return Array.from(keys).filter(k => !PROVIDER_FIELDS.includes(k as typeof PROVIDER_FIELDS[number]));
}

function getAlignedPairs(data: InsightMetric[], keyA: string, keyB: string, lag: number) {
    const a: number[] = [];
    const b: number[] = [];

    for (let i = 0; i < data.length - lag; i++) {
        const valA = getValue(data[i], keyA);
        const valB = getValue(data[i + lag], keyB);

        if (valA !== null && valB !== null) {
            a.push(valA);
            b.push(valB);
        }
    }
    return { a, b };
}

function getValue(record: InsightMetric, key: string): number | null {
    // Check direct property (with type narrowing)
    if (record[key] !== undefined && typeof record[key] === 'number') { // Redundant !isNaN removed
        return record[key] as number;
    }
    // Check custom_metrics
    if (record.custom_metrics && record.custom_metrics[key] !== undefined && typeof record.custom_metrics[key] === 'number') { // Redundant !isNaN removed
        return record.custom_metrics[key];
    }
    return null;
}


function calculateMedian(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];
}



function average(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
}

function calculatePercentageChange(
    data: InsightMetric[],
    metricA: string,
    metricB: string,
    medianA: number,
    lag: number
): { percentChange: number; typicalValue: number; improvedValue: number } {
    // Split data into high and low groups based on medianA
    const pairs: { a: number; b: number }[] = [];

    for (let i = 0; i < data.length - lag; i++) {
        const valA = getValue(data[i], metricA);
        const valB = getValue(data[i + lag], metricB);
        if (valA !== null && valB !== null) {
            pairs.push({ a: valA, b: valB });
        }
    }

    const highA = pairs.filter(p => p.a > medianA).map(p => p.b);
    const lowA = pairs.filter(p => p.a <= medianA).map(p => p.b);

    const avgBWhenHighA = average(highA);
    const avgBWhenLowA = average(lowA);

    // Calculate percentage change
    // Return 0 if baseline is zero to avoid division by zero (edge case for new users with sparse data)
    const percentChange = avgBWhenLowA !== 0
        ? Math.abs(((avgBWhenHighA - avgBWhenLowA) / avgBWhenLowA) * 100)
        : 0;

    return {
        percentChange,
        typicalValue: avgBWhenLowA,
        improvedValue: avgBWhenHighA
    };
}


function isGoodPattern(metricB: string, r: number): boolean {
    const config = getMetricRegistryConfig(metricB);

    if (config.direction === 'lower') {
        // For negative metrics (symptoms), negative correlation is good (high A → low B)
        return r < 0;
    } else {
        // For positive metrics (HRV), positive correlation is good (high A → high B)
        return r > 0;
    }
}

// Removed getDescription function as it is now handled in the UI for i18n

