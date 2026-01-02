import { parseISO, isWithinInterval } from "date-fns";
import { EXERTION_METRICS } from "@/lib/scoring/logic";
import { getMetricRegistryConfig } from "@/lib/metrics/registry";

export interface Experiment {
    id: string;
    name: string;
    dosage: string | null;
    start_date: string;
    end_date: string | null;
    category: string | null;
}

export interface MetricDay {
    date: string;
    custom_metrics?: Record<string, number>;
    [key: string]: unknown;
}

export interface ExperimentImpact {
    metric: string;
    coefficient: number; // The "Independent Impact" (shift in units, e.g. HRV ms)
    zScoreShift: number; // Shift in Standard Deviations
    percentChange: number; // Shift in Percentage relative to baseline mean
    standardError: number; // Standard error of the coefficient
    pValue: number; // Statistical significance
    significance: 'positive' | 'negative' | 'neutral';
    confidence: number; // Statistical confidence (e.g. 1 - pValue)
}

export interface ExperimentReport {
    experimentId: string;
    impacts: ExperimentImpact[];
}

/**
 * Isolates the impact of multiple medications/experiments using 
 * Ordinary Least Squares (OLS) regression.
 */
export function analyzeExperiments(
    experiments: Experiment[],
    history: MetricDay[],
    baselineStats: Record<string, { mean: number, std: number }>
): ExperimentReport[] {
    // 1. Dynamic Metric Discovery
    const excludedKeys = [
        'date', 'id', 'user_id', 'created_at', 'custom_metrics',
        'normalized_hrv', 'normalized_rhr', 'normalized_steps',
        'normalized_sleep', 'normalized_exertion',
        'Crash', 'Infection', 'exertion_score',
        ...EXERTION_METRICS
    ];

    // Build a set of all unique numeric keys in history
    const allMetrics = new Set<string>();
    history.forEach(day => {
        // 1. Top-level keys
        Object.keys(day).forEach(key => {
            const val = day[key]
            if (!excludedKeys.includes(key) && typeof val === 'number') {
                allMetrics.add(key);
            }
        });

        // 2. Custom Metrics (Flattening)
        const customMetrics = day.custom_metrics as Record<string, unknown> | null | undefined;
        if (customMetrics && typeof customMetrics === 'object') {
            Object.keys(customMetrics).forEach(key => {
                const val = (customMetrics as Record<string, number>)[key];
                if (!excludedKeys.includes(key) && typeof val === 'number') {
                    allMetrics.add(key);
                }
            });
        }
    });

    const metricsToAnalyze = Array.from(allMetrics);
    if (metricsToAnalyze.length === 0) return [];

    // 2. Prepare Data Matrix X and Response Vector y
    const validDays = history.filter(d => d.date);
    if (validDays.length < 14) return [];

    const reports: ExperimentReport[] = experiments.map(e => ({
        experimentId: e.id,
        impacts: []
    }));

    metricsToAnalyze.forEach(metric => {
        const y: number[] = [];
        const X: number[][] = [];

        validDays.forEach(day => {
            // Check top-level, then custom_metrics
            const val = (day[metric] as number ?? (day.custom_metrics as Record<string, number>)?.[metric]);
            if (val === null || val === undefined || typeof val !== 'number') return;

            y.push(val);
            const row = [1];
            experiments.forEach(exp => {
                const dayDate = parseISO(day.date);
                const start = parseISO(exp.start_date);
                const end = exp.end_date ? parseISO(exp.end_date) : new Date();

                const isActive = isWithinInterval(dayDate, { start, end });
                row.push(isActive ? 1 : 0);
            });
            X.push(row);
        });

        if (y.length < 10) return;

        const regression = solveOLS(X, y);
        if (!regression) return;

        const { betas, XTXInv, rss } = regression;
        const n = y.length;
        const k = betas.length;
        const df = n - k; // Degrees of freedom

        if (df <= 0) return;

        // Variance of residuals: sigma^2 = RSS / (n - k)
        const sigmaSq = rss / df;

        experiments.forEach((exp, idx) => {
            const coeff = betas[idx + 1]; // idx+1 because index 0 is intercept

            // Standard Error: sqrt(sigma^2 * XTXInv[j][j])
            const se = Math.sqrt(sigmaSq * XTXInv[idx + 1][idx + 1]);

            // T-Statistic (or Z-score for large n)
            const tStat = coeff / (se || 1e-10);

            // P-Value Approximation (Two-tailed Z-test logic)
            // For health tracking (N > 30 usually), Z is a good proxy.
            const pValue = 2 * (1 - normalCDF(Math.abs(tStat)));

            const stats = baselineStats[metric];
            const std = stats?.std || 1;
            const mean = stats?.mean || 1;

            const zShift = coeff / std;
            const percentChange = (coeff / mean) * 100;

            let significance: 'positive' | 'negative' | 'neutral' = 'neutral';

            // Central Source of Truth for "Good" outcome logic:
            const metricConfig = getMetricRegistryConfig(metric);
            const isGood = metricConfig.direction === 'lower'
                ? coeff < 0 // Decrease is desirable
                : coeff > 0; // Increase is desirable

            // Significance Thresholds: Scientific Rigor
            // Significant: p < 0.05
            // Trend: p < 0.20
            if (pValue < 0.20) {
                significance = isGood ? 'positive' : 'negative';
            }

            const report = reports.find(r => r.experimentId === exp.id);
            if (report) {
                report.impacts.push({
                    metric,
                    coefficient: coeff,
                    zScoreShift: zShift,
                    percentChange,
                    standardError: se,
                    pValue,
                    significance,
                    confidence: 1 - pValue
                });
            }
        });
    });

    return reports;
}

/**
 * Basic Matrix OLS Solver
 * Uses the Normal Equation: (X^T * X)^-1 * X^T * y
 * Returns coefficients, (X'X)^-1 (for SE), and RSS (for Variance).
 */
function solveOLS(X: number[][], y: number[]): { betas: number[], XTXInv: number[][], rss: number } | null {
    try {
        const XT = transpose(X);
        const XTX = multiply(XT, X);
        const XTXInv = invert(XTX);
        if (!XTXInv) return null;

        const XTy = multiplyVec(XT, y);
        const betas = multiplyVec(XTXInv, XTy);

        // Calculate RSS: sum of (y - X*beta)^2
        let rss = 0;
        for (let i = 0; i < y.length; i++) {
            let pred = 0;
            for (let j = 0; j < betas.length; j++) {
                pred += X[i][j] * betas[j];
            }
            rss += Math.pow(y[i] - pred, 2);
        }

        return { betas, XTXInv, rss };
    } catch {
        return null;
    }
}

// Matrix Helpers
function transpose(A: number[][]): number[][] {
    return A[0].map((_, c) => A.map(r => r[c]));
}

function multiply(A: number[][], B: number[][]): number[][] {
    const result = Array(A.length).fill(0).map(() => Array(B[0].length).fill(0));
    for (let i = 0; i < A.length; i++) {
        for (let j = 0; j < B[0].length; j++) {
            for (let k = 0; k < B.length; k++) {
                result[i][j] += A[i][k] * B[k][j];
            }
        }
    }
    return result;
}

function multiplyVec(A: number[][], v: number[]): number[] {
    return A.map(row => row.reduce((acc, val, i) => acc + val * v[i], 0));
}

/**
 * Simple 2x2 or 3x3 Inverse solver using Gauss-Jordan or similar
 * For typical experiment counts (< 5), this is fast.
 */
function invert(M: number[][]): number[][] | null {
    const n = M.length;
    const I = Array(n).fill(0).map((_, i) => Array(n).fill(0).map((_, j) => (i === j ? 1 : 0)));
    const C = M.map(row => [...row]); // Copy

    for (let i = 0; i < n; i++) {
        let pivot = C[i][i];
        if (Math.abs(pivot) < 1e-10) {
            // Find non-zero pivot
            let found = false;
            for (let j = i + 1; j < n; j++) {
                if (Math.abs(C[j][i]) > 1e-10) {
                    [C[i], C[j]] = [C[j], C[i]];
                    [I[i], I[j]] = [I[j], I[i]];
                    pivot = C[i][i];
                    found = true;
                    break;
                }
            }
            if (!found) return null;
        }

        for (let j = 0; j < n; j++) {
            C[i][j] /= pivot;
            I[i][j] /= pivot;
        }

        for (let k = 0; k < n; k++) {
            if (k === i) continue;
            const factor = C[k][i];
            for (let j = 0; j < n; j++) {
                C[k][j] -= factor * C[i][j];
                I[k][j] -= factor * I[i][j];
            }
        }
    }
    return I;
}

/**
 * Normal Cumulative Distribution Function (CDF) approximation.
 * Used for P-Value calculation from Z-scores.
 */
function normalCDF(x: number): number {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp(-x * x / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return x > 0 ? 1 - p : p;
}
