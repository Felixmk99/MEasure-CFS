import { format, parseISO, isWithinInterval, addDays, subDays, differenceInDays } from "date-fns";

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
    [key: string]: any;
}

export interface ExperimentImpact {
    metric: string;
    coefficient: number; // The "Independent Impact" (shift in units, e.g. HRV ms)
    zScoreShift: number; // Shift in Standard Deviations
    percentChange: number; // Shift in Percentage relative to baseline mean
    significance: 'positive' | 'negative' | 'neutral';
    confidence: number; // 0-1
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
    const excludedKeys = ['date', 'id', 'user_id', 'created_at', 'custom_metrics'];

    // Build a set of all unique numeric keys in history
    const allMetrics = new Set<string>();
    history.forEach(day => {
        Object.keys(day).forEach(key => {
            if (!excludedKeys.includes(key) && typeof day[key] === 'number') {
                allMetrics.add(key);
            }
        });
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
            const val = day[metric];
            if (val === null || val === undefined) return;

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

        const betas = solveOLS(X, y);
        if (!betas) return;

        experiments.forEach((exp, idx) => {
            const coeff = betas[idx + 1];
            const stats = baselineStats[metric];
            const std = stats?.std || 1;
            const mean = stats?.mean || 1; // Avoid division by zero

            const zShift = coeff / std;
            const percentChange = (coeff / mean) * 100;

            let significance: 'positive' | 'negative' | 'neutral' = 'neutral';

            // Generic logic: Assume UP is GOOD unless it's a known "inverted" metric
            const invertedMetrics = ['resting_heart_rate', 'symptom_score', 'exertion_score', 'pain_level', 'fatigue_level'];
            const isGood = invertedMetrics.includes(metric)
                ? coeff < 0
                : coeff > 0;

            if (Math.abs(zShift) > 0.15) { // Lowered threshold slightly for more diversity
                significance = isGood ? 'positive' : 'negative';
            }

            const report = reports.find(r => r.experimentId === exp.id);
            if (report) {
                report.impacts.push({
                    metric,
                    coefficient: coeff,
                    zScoreShift: zShift,
                    percentChange,
                    significance,
                    confidence: calculateConfidence(y.length)
                });
            }
        });
    });

    return reports;
}

/**
 * Basic Matrix OLS Solver
 * Uses the Normal Equation: (X^T * X)^-1 * X^T * y
 */
function solveOLS(X: number[][], y: number[]): number[] | null {
    try {
        const XT = transpose(X);
        const XTX = multiply(XT, X);
        const XTXInv = invert(XTX);
        if (!XTXInv) return null;

        const XTy = multiplyVec(XT, y);
        return multiplyVec(XTXInv, XTy);
    } catch (e) {
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

function calculateConfidence(sampleSize: number): number {
    // Heuristic: Confidence grows with days of data
    // 14 days = 0.5, 30 days = 0.8, 60 days = 0.95
    if (sampleSize < 7) return 0.1;
    return Math.min(0.99, 1 - (5 / sampleSize));
}
