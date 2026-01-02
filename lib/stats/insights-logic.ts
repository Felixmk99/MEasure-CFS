import * as ss from 'simple-statistics';

export interface InsightMetric {
    date: string;
    custom_metrics?: Record<string, number>;
    [key: string]: unknown;
}

export interface CorrelationResult {
    metricA: string;
    metricB: string;
    coefficient: number; // -1 to 1
    description: string;
    lag: number; // Days shift
    impactDirection: 'positive' | 'negative' | 'neutral';
    impactStrength: 'strong' | 'moderate' | 'weak';
}

export interface ThresholdInsight {
    metric: string;
    impactMetric: string;
    safeZoneLimit: number;
    description: string;
}

/**
 * Calculates correlation between all pairs of metrics.
 * Surfaces leading and lagging indicators using a window of 0-2 days.
 */
export function calculateAdvancedCorrelations(data: InsightMetric[]): CorrelationResult[] {
    if (data.length < 5) return [];

    const metrics = extractAvailableMetrics(data);
    const results: CorrelationResult[] = [];

    // Sort data by date for lagged analysis
    const sortedData = [...data].sort((a, b) => a.date.localeCompare(b.date));

    metrics.forEach(metricA => {
        metrics.forEach(metricB => {
            if (metricA === metricB) return;

            // Calculate for Lag 0, 1, 2
            [0, 1, 2].forEach(lag => {
                const pair = getAlignedPairs(sortedData, metricA, metricB, lag);
                if (pair.a.length < 5) return;

                try {
                    const coefficient = ss.sampleCorrelation(pair.a, pair.b);
                    // Always include lag 0 for the matrix, filter others for "Insights"
                    if (lag === 0 || Math.abs(coefficient) > 0.4) {
                        results.push({
                            metricA,
                            metricB,
                            coefficient,
                            lag,
                            description: getDescription(metricA, metricB, coefficient, lag),
                            impactDirection: coefficient > 0.1 ? 'positive' : coefficient < -0.1 ? 'negative' : 'neutral',
                            impactStrength: Math.abs(coefficient) > 0.7 ? 'strong' : Math.abs(coefficient) > 0.5 ? 'moderate' : 'weak'
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
export function detectThresholds(
    data: InsightMetric[],
    impactMetric: string = 'symptom_score',
    triggerMetrics: string[] = ['step_count', 'Physical Exertion', 'Cognitive Exertion', 'Work']
): ThresholdInsight[] {
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
        if (means[2] > means[0] * 1.5 || means[3] > means[0] * 1.5) {
            const thresholdIndex = means[2] > means[0] * 1.5 ? bucketSize * 2 : bucketSize * 3;
            const limit = pairs[thresholdIndex].x;

            insights.push({
                metric: m,
                impactMetric,
                safeZoneLimit: limit,
                description: `Staying below ${limit.toLocaleString()} ${m.replaceAll('_', ' ')} keeps your ${impactMetric.replaceAll('_', ' ')} significantly lower.`
            });
        }
    });

    return insights;
}

/**
 * Calculates typical recovery velocity from exertion spikes.
 * @experimental Currently returning empty array until logic is finalized.
 */
export function calculateRecoveryVelocity(): { metric: string, recoveryDays: number }[] {
    // TODO: Implement recovery velocity calculation
    // Planned approach: Look for spikes in exertion (exertion_score, Physical Exertion, Cognitive Exertion),
    // then measure days until HRV/Symptom returns to baseline (7d mean)
    return [];
}

// Helpers
function extractAvailableMetrics(data: InsightMetric[]): string[] {
    const keys = new Set<string>();
    data.forEach(d => {
        Object.keys(d).forEach(k => {
            // Exclude normalized metrics, date, and custom_metrics container
            if (k !== 'date' &&
                k !== 'custom_metrics' &&
                !k.toLowerCase().includes('normalized') &&
                typeof d[k] === 'number') {
                keys.add(k);
            }
        });
        if (d.custom_metrics) {
            Object.keys(d.custom_metrics).forEach(k => {
                // Exclude normalized custom metrics
                if (!k.toLowerCase().includes('normalized') &&
                    typeof d.custom_metrics?.[k] === 'number') {
                    keys.add(k);
                }
            });
        }
    });
    return Array.from(keys).filter(k => k !== 'symptom_provider' && k !== 'step_provider');
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
    if (record[key] !== undefined && typeof record[key] === 'number' && !isNaN(record[key] as number)) return record[key] as number;
    if (record.custom_metrics && record.custom_metrics[key] !== undefined && !isNaN(Number(record.custom_metrics[key]))) return Number(record.custom_metrics[key]);
    return null;
}

function getDescription(a: string, b: string, r: number, lag: number): string {
    const absCoef = Math.abs(r);
    const percentage = Math.round(absCoef * 100);

    // Determine impact direction with actionable language
    let impactPhrase = '';
    if (r > 0) {
        impactPhrase = `increases your ${b.replaceAll('_', ' ')}`;
    } else {
        impactPhrase = `decreases your ${b.replaceAll('_', ' ')}`;
    }

    // Make lag more readable
    const lagText = lag === 0
        ? 'on the same day'
        : lag === 1
            ? 'the next day'
            : `${lag} days later`;

    // Make it actionable with percentage impact
    return `Your ${a.replaceAll('_', ' ')} ${impactPhrase} by ~${percentage}% ${lagText}.`;
}
