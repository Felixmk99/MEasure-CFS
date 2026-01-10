import { parseISO, isWithinInterval, subDays, format, isAfter, isBefore } from "date-fns";
import { EXERTION_METRICS } from "@/lib/scoring/logic";
import { getMetricRegistryConfig } from "@/lib/metrics/registry";
import { mean as calcMean, standardDeviation as calcStd } from "simple-statistics";

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
    effectSize?: 'not_significant' | 'small' | 'medium' | 'large';
    tStat?: number;
    df?: number;
}

export interface ExperimentReport {
    experimentId: string;
    impacts: ExperimentImpact[];
    daysWithData?: number;
}

/**
 * Isolates the impact of multiple medications/experiments using 
 * Ordinary Least Squares (OLS) regression.
 */
export function analyzeExperiments(
    experiments: Experiment[],
    history: MetricDay[]
): ExperimentReport[] {
    // 1. Dynamic Metric Discovery
    const excludedKeys = [
        'date', 'id', 'user_id', 'created_at', 'custom_metrics',
        'normalized_hrv', 'normalized_rhr', 'normalized_steps',
        'normalized_sleep', 'normalized_exertion',
        'Crash', 'Infection', 'exertion_score', 'Funcap Score', 'composite_score',
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

    // Sort days by date for proper lag calculation
    const sortedDays = [...validDays].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Build a map of date -> exertion for lag lookup
    const exertionByDate = new Map<string, number>();
    sortedDays.forEach(d => {
        const val = d.exertion_score as number | undefined;
        if (typeof val === 'number' && !isNaN(val)) {
            exertionByDate.set(d.date, val);
        }
    });

    // Compute mean exertion for imputation of missing values
    const exertionValues = Array.from(exertionByDate.values());
    const meanExertion = exertionValues.length > 0
        ? exertionValues.reduce((a, b) => a + b, 0) / exertionValues.length
        : 0;

    const reports: ExperimentReport[] = experiments.map(e => {
        const start = parseISO(e.start_date);
        const end = e.end_date ? parseISO(e.end_date) : new Date();
        const daysWithData = sortedDays.filter(day => {
            const dayDate = parseISO(day.date);
            return isWithinInterval(dayDate, { start, end });
        }).length;

        return {
            experimentId: e.id,
            daysWithData,
            impacts: []
        };
    });

    metricsToAnalyze.forEach(metric => {
        const y: number[] = [];
        const X: number[][] = [];

        // Control Columns to track for variance check
        const lag1Column: number[] = [];
        const lag2Column: number[] = [];
        // Time is strictly increasing [0, 1, 2...], so variance is guaranteed if N > 1

        sortedDays.forEach((day, index) => {
            // Check top-level, then custom_metrics
            const val = (day[metric] as number ?? (day.custom_metrics as Record<string, number>)?.[metric]);
            if (val === null || val === undefined || typeof val !== 'number') return;

            y.push(val);
            const row = [1]; // Intercept
            const dayDate = parseISO(day.date);

            experiments.forEach(exp => {
                const start = parseISO(exp.start_date);
                const end = exp.end_date ? parseISO(exp.end_date) : new Date();

                const isActive = isWithinInterval(dayDate, { start, end });
                row.push(isActive ? 1 : 0);
            });

            // 1. Lagged Exertion (PEM) Control
            // T-1 (Yesterday): Immediate Crash
            const dateT1 = subDays(dayDate, 1);
            const strT1 = format(dateT1, 'yyyy-MM-dd');
            const valT1 = exertionByDate.get(strT1) ?? meanExertion;

            // T-2 (2 Days Ago): Delayed Crash (Peak PEM)
            const dateT2 = subDays(dayDate, 2);
            const strT2 = format(dateT2, 'yyyy-MM-dd');
            const valT2 = exertionByDate.get(strT2) ?? meanExertion;

            row.push(valT1);
            row.push(valT2);
            lag1Column.push(valT1);
            lag2Column.push(valT2);

            // 2. Linear Time Trend (Control for Natural Drift)
            row.push(index);

            X.push(row);
        });

        if (y.length < 10) return;

        // 3. Matrix Cleaning: Remove Constant and Collinear Columns
        const validExperimentIndices: number[] = [];
        const seenVectors = new Set<string>();
        const numExperiments = experiments.length;

        // Check Experiments (Indices 1 .. numExp)
        for (let j = 0; j < numExperiments; j++) {
            const colIndex = j + 1;
            const colVector = X.map(row => row[colIndex]);

            const hasZeros = colVector.includes(0);
            const hasOnes = colVector.includes(1);

            if (!hasZeros || !hasOnes) continue; // Constant

            const vectorKey = colVector.join('');
            if (seenVectors.has(vectorKey)) continue; // Collinear
            seenVectors.add(vectorKey);

            validExperimentIndices.push(j);
        }

        // Check Variance of Controls
        const hasLag1Variance = lag1Column.length > 0 && Math.max(...lag1Column) > Math.min(...lag1Column);
        const hasLag2Variance = lag2Column.length > 0 && Math.max(...lag2Column) > Math.min(...lag2Column);

        // Rebuild XCommon: [Intercept, ValidExperiments..., ValidControls...]
        const XCommon = X.map(row => {
            const newRow = [1, ...validExperimentIndices.map(expIdx => row[expIdx + 1])];

            // Controls (Indices after experiments)
            // Original Indices: Intercept(0), Exp(1..N), Lag1(N+1), Lag2(N+2), Time(N+3)
            if (hasLag1Variance) newRow.push(row[numExperiments + 1]);
            if (hasLag2Variance) newRow.push(row[numExperiments + 2]);

            // Time Trend (Always include, assuming N>1)
            newRow.push(row[numExperiments + 3]);

            return newRow;
        });

        const regression = solveOLS(XCommon, y);
        if (!regression) return;

        const { betas, XTXInv } = regression;
        const n = y.length;
        const k = betas.length;
        const df = n - k; // Degrees of freedom

        if (df <= 0) return;

        // Compute residuals for Newey-West correction
        const residuals: number[] = [];
        for (let i = 0; i < n; i++) {
            let pred = 0;
            for (let j = 0; j < k; j++) {
                pred += XCommon[i][j] * betas[j];
            }
            residuals.push(y[i] - pred);
        }

        // Newey-West HAC (Heteroskedasticity and Autocorrelation Consistent) Standard Errors
        // Bandwidth: Commonly floor(4 * (n/100)^(2/9)) but we use ceil(n^(1/4)) for simplicity
        const bandwidth = Math.ceil(Math.pow(n, 0.25));

        // Compute the "meat" of the sandwich estimator
        // S = sum_t (x_t * u_t * u_t * x_t') + sum_l=1..L sum_t (1 - l/(L+1)) * (x_t * u_t * u_{t-l} * x_{t-l}' + x_{t-l} * u_{t-l} * u_t * x_t')
        const meat: number[][] = Array(k).fill(0).map(() => Array(k).fill(0));

        // Contribution from same-period (heteroskedasticity)
        for (let t = 0; t < n; t++) {
            for (let i = 0; i < k; i++) {
                for (let j = 0; j < k; j++) {
                    meat[i][j] += XCommon[t][i] * XCommon[t][j] * residuals[t] * residuals[t];
                }
            }
        }

        // Contribution from lagged periods (autocorrelation) with Bartlett kernel
        for (let lag = 1; lag <= bandwidth; lag++) {
            const weight = 1 - lag / (bandwidth + 1);
            for (let t = lag; t < n; t++) {
                const ut = residuals[t];
                const utLag = residuals[t - lag];
                for (let i = 0; i < k; i++) {
                    for (let j = 0; j < k; j++) {
                        // Symmetric contribution
                        const contrib = weight * (XCommon[t][i] * ut * utLag * XCommon[t - lag][j] +
                            XCommon[t - lag][i] * utLag * ut * XCommon[t][j]);
                        meat[i][j] += contrib;
                    }
                }
            }
        }

        // Sandwich formula: V = (X'X)^-1 * Meat * (X'X)^-1
        const sandwichLeft = multiply(XTXInv, meat);
        const sandwichV = multiply(sandwichLeft, XTXInv);

        // Small Sample Correction (HC1/HAC1): Scale by n / (n - k)
        // This is crucial for small datasets (N < 50) to avoid underestimating variance (inflation of significance).
        const smallSampleCorrection = n / (n - k);

        // Map results back to ORIGINAL Experiment IDs
        validExperimentIndices.forEach((originalExpIndex, mappedIndex) => {
            const exp = experiments[originalExpIndex];

            // mappedIndex corresponds to betas[mappedIndex + 1] (skipping intercept)
            const betaIndex = mappedIndex + 1;
            const coeff = betas[betaIndex];

            // Newey-West Robust Standard Error with Small Sample Correction
            const robustVariance = Math.max(0, sandwichV[betaIndex][betaIndex]) * smallSampleCorrection;
            const se = Math.sqrt(robustVariance);

            // T-Statistic
            const tStat = coeff / (se || 1e-10);

            // P-Value: Use T-Distribution for more accuracy with small samples
            // Two-tailed test: 2 * (1 - tCDF(|t|, df))
            const pValue = 2 * (1 - tDistributionCDF(Math.abs(tStat), df));

            // Calculate Local Baseline (90 days prior to experiment start)
            // This ensures we compare against the user's "Recent Normal" state, 
            // accounting for health drift (e.g. recovery or worsening over years).
            const expStart = parseISO(exp.start_date);
            const baselineWindowStart = subDays(expStart, 90);

            // Extract values in the [T-90, T) window
            const baselineValues = sortedDays
                .filter(d => {
                    const dDate = parseISO(d.date);
                    // Include dates from baselineWindowStart (inclusive) to expStart (exclusive)
                    return !isBefore(dDate, baselineWindowStart) && isBefore(dDate, expStart);
                })
                .map(d => (d[metric] as number ?? (d.custom_metrics as Record<string, number>)?.[metric]))
                .filter((v): v is number => typeof v === 'number');

            let mean = 0;
            let std = 0; // Default to 0 to signal "Insufficient Data" if fallback fails

            if (baselineValues.length >= 5) {
                mean = calcMean(baselineValues);
                std = calcStd(baselineValues) || 1;
            } else {
                // Fallback: If not enough recent data, use ALL pre-experiment data
                const allPreData = sortedDays
                    .filter(d => isBefore(parseISO(d.date), expStart))
                    .map(d => (d[metric] as number ?? (d.custom_metrics as Record<string, number>)?.[metric]))
                    .filter((v): v is number => typeof v === 'number');

                if (allPreData.length >= 5) {
                    mean = calcMean(allPreData);
                    std = calcStd(allPreData) || 1;
                }
            }

            // Guard against division by zero if std is still 0 (insufficient data)
            const zShift = std > 0 ? (coeff / std) : 0;
            // Guard against division by zero if mean is 0
            const percentChange = mean !== 0 ? ((coeff / mean) * 100) : 0;

            let significance: 'positive' | 'negative' | 'neutral' = 'neutral';

            // Central Source of Truth for "Good" outcome logic:
            const metricConfig = getMetricRegistryConfig(metric);
            const isGood = metricConfig.direction === 'lower'
                ? coeff < 0 // Decrease is desirable
                : coeff > 0; // Increase is desirable

            // Aligned Significance Thresholds:
            // High Confidence: p < 0.05
            // Only show significant results (no weak trends)
            if (pValue < 0.05) {
                significance = isGood ? 'positive' : 'negative';
            }

            // Effect Size classification using standardized coefficient (z-score shift)
            // Thresholds follow Cohen's conventions: 0.2 (small), 0.5 (medium), 0.8 (large)
            let effectSize: 'not_significant' | 'small' | 'medium' | 'large' = 'not_significant';
            if (pValue < 0.05) {
                const absZ = Math.abs(zShift);
                if (absZ >= 0.8) effectSize = 'large';
                else if (absZ >= 0.5) effectSize = 'medium';
                else if (absZ >= 0.2) effectSize = 'small';
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
                    confidence: 1 - pValue,
                    effectSize,
                    tStat,
                    df
                });
            }
        });
    });

    return reports;
}

/**
 * Basic Matrix OLS Solver
 * Uses the Normal Equation: (X^T * X)^-1 * X^T * y
 * Returns coefficients and (X'X)^-1 for standard error calculation.
 */
function solveOLS(X: number[][], y: number[]): { betas: number[], XTXInv: number[][] } | null {
    try {
        const XT = transpose(X);
        const XTX = multiply(XT, X);
        const XTXInv = invert(XTX);
        if (!XTXInv) return null;

        const XTy = multiplyVec(XT, y);
        const betas = multiplyVec(XTXInv, XTy);

        return { betas, XTXInv };
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
export function normalCDF(x: number): number {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp(-x * x / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return x > 0 ? 1 - p : p;
}

/**
 * Student's T-Distribution CDF approximation.
 * Used for more accurate P-values when sample size is small (N < 30).
 * Based on the relationship: Z is the limit of T as df -> infinity.
 */
export function tDistributionCDF(t: number, df: number): number {
    if (df <= 0) return 0.5;

    // For large df, T-distribution is identical to Normal distribution
    if (df > 100) return normalCDF(t);

    // Special case: df=1 is Cauchy distribution
    if (Math.round(df) === 1) {
        return 0.5 + Math.atan(t) / Math.PI;
    }

    // Practical approximation for T-distribution CDF
    const x = t;
    const absX = Math.abs(x);
    const a = df / (df + x * x);
    let p = 0;

    if (df % 2 === 0) {
        let term = Math.sqrt(1 - a);
        p = term;
        for (let i = 2; i < df; i += 2) {
            term = term * a * (i - 1) / i;
            p += term;
        }
    } else {
        const theta = Math.atan(absX / Math.sqrt(df));
        let term = Math.sin(theta);
        p = (theta + term * Math.cos(theta));
        for (let i = 3; i < df; i += 2) {
            term = term * a * (i - 1) / i;
            p += term * Math.cos(theta);
        }
        p = 2 * p / Math.PI;
    }

    const cdf = 0.5 + (x > 0 ? 0.5 : -0.5) * p;
    return Math.max(0, Math.min(1, cdf));
}
