import { analyzeExperiments, Experiment, MetricDay, tDistributionCDF, normalCDF } from '../lib/statistics/experiment-analysis';

describe('Experiments Logic - Scientific Rigor', () => {
    // 21 days of data (Correctly exceeds the 14-day engine guardrail)
    const history: MetricDay[] = Array.from({ length: 21 }, (_, i) => ({
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        hrv: i < 11 ? 50 : 60 // Small increase at day 11
    }));

    const baselineStats = { hrv: { mean: 55, std: 5 } };

    const expA: Experiment = {
        id: 'exp-a',
        name: 'test',
        dosage: null,
        start_date: '2024-01-11',
        end_date: '2024-01-21',
        category: 'medication'
    };

    describe('Direct Math: normalCDF', () => {
        it('should match Z-Table reference values', () => {
            expect(normalCDF(0.0)).toBeCloseTo(0.5, 6);
            expect(normalCDF(1.645)).toBeCloseTo(0.95, 2);
            expect(normalCDF(1.96)).toBeCloseTo(0.975, 3);
        });

        it('should maintain symmetry Φ(-z) = 1 - Φ(z)', () => {
            const z = 1.0;
            expect(normalCDF(-z)).toBeCloseTo(1 - normalCDF(z), 10);
        });

        it('should clamp values to [0, 1] for extreme magnitudes', () => {
            expect(normalCDF(50)).toBe(1);
            expect(normalCDF(-50)).toBe(0);
        });
    });

    describe('Direct Math: tDistributionCDF', () => {
        it('should correctly calculate P-value for df=1 (Cauchy distribution)', () => {
            // With df=1, t-dist is Cauchy. 
            // For t=1.0, CDF should be 0.5 + Math.atan(1.0)/Math.PI = 0.5 + 0.25 = 0.75
            const cdf = tDistributionCDF(1.0, 1);
            expect(cdf).toBeCloseTo(0.75, 5);

            // For t=0.0, CDF should be 0.5
            expect(tDistributionCDF(0.0, 1)).toBe(0.5);

            // For t=-1.0, CDF should be 0.25
            expect(tDistributionCDF(-1.0, 1)).toBeCloseTo(0.25, 5);
        });

        it('should match T-Table reference values for small-to-medium DF', () => {
            // df=5, t=2.015 -> CDF approx 0.95
            expect(tDistributionCDF(2.015, 5)).toBeCloseTo(0.95, 2);

            // df=10, t=1.812 -> CDF approx 0.95
            expect(tDistributionCDF(1.812, 10)).toBeCloseTo(0.95, 2);

            // df=30, t=2.042 -> CDF approx 0.975
            expect(tDistributionCDF(2.042, 30)).toBeCloseTo(0.975, 3);
        });

        it('should maintain symmetry for any df', () => {
            [2, 5, 10, 30].forEach(df => {
                const t = 1.5;
                expect(tDistributionCDF(-t, df)).toBeCloseTo(1 - tDistributionCDF(t, df), 10);
            });
        });

        it('should clamp extreme t values gracefully', () => {
            expect(tDistributionCDF(1000, 10)).toBe(1);
            expect(tDistributionCDF(-1000, 10)).toBe(0);
        });

        it('should handle df <= 0 gracefully (fallback to 0.5)', () => {
            expect(tDistributionCDF(1.96, 0)).toBe(0.5);
            expect(tDistributionCDF(1.96, -5)).toBe(0.5);
        });

        it('should handle non-integer DF via rounding for the Cauchy branch', () => {
            // df=1.2 should still hit the Cauchy branch if it rounds to 1
            expect(tDistributionCDF(1.0, 1.2)).toBeCloseTo(tDistributionCDF(1.0, 1), 10);
        });

        it('should follow Normal distribution for large DF (Convergence)', () => {
            // For large df (e.g. 200), t-dist is approx Normal
            // Normal CDF at 1.96 is approx 0.975 (two-tailed 0.05)
            const cdf = tDistributionCDF(1.96, 200);
            expect(cdf).toBeCloseTo(0.975, 2);
        });
    });

    describe('Engine Integration Tasks', () => {
        it('should calculate more conservative P-values with small N (T-Distribution)', () => {
            const reports = analyzeExperiments([expA], history, baselineStats);
            const report = reports.find(r => r.experimentId === 'exp-a');
            const impact = report?.impacts.find(i => i.metric === 'hrv');

            expect(impact).toBeDefined();
            expect(impact?.df).toBe(19); // 21 days - 2 coefficients (intercept + exp)

            // With small N, significance is harder to reach than Z-test
            expect(impact?.pValue).toBeGreaterThan(0);
            expect(impact?.pValue).toBeLessThan(0.01); // Still significant because +2 sigma is massive
        });

        it('should correctly classify Effect Sizes (Cohen d equivalent)', () => {
            const reports = analyzeExperiments([expA], history, baselineStats);
            const report = reports.find(r => r.experimentId === 'exp-a');
            const impact = report?.impacts.find(i => i.metric === 'hrv');

            // (60-55)/5 = 1.0 (Z-shift)
            // Magnitude 1.0 is > 0.8, so it should be 'large'
            expect(impact?.effectSize).toBe('large');
        });

        it('should classify a smaller shift as "small" or "medium"', () => {
            const smallHistory: MetricDay[] = Array.from({ length: 21 }, (_, i) => ({
                date: `2024-01-${String(i + 1).padStart(2, '0')}`,
                hrv: i < 11 ? 55 : 57 // Very small increase (2 units, std 5 = 0.4 sigma)
            }));

            const reports = analyzeExperiments([expA], smallHistory, { hrv: { mean: 55, std: 5 } });
            const report = reports.find(r => r.experimentId === 'exp-a');
            const impact = report?.impacts.find(i => i.metric === 'hrv');

            // Shift is roughly 2/5 = 0.4.
            // 0.4 is between 0.2 and 0.5, so 'small'
            expect(impact?.effectSize).toBe('small');
        });

        it('should handle neutral outcomes with enough data but no significant change', () => {
            const neutralExp: Experiment = { ...expA, start_date: '2024-01-08', end_date: '2024-01-14' };
            const neutralHistory: MetricDay[] = Array.from({ length: 14 }, (_, i) => ({
                date: `2024-01-${String(i + 1).padStart(2, '0')}`,
                hrv: 50 // Constant HRV
            }));
            const reports = analyzeExperiments([neutralExp], neutralHistory, baselineStats);

            const report = reports.find(r => r.experimentId === 'exp-a');
            expect(report).toBeDefined();

            const impact = report?.impacts.find(i => i.metric === 'hrv');
            expect(impact).toBeDefined();
            expect(impact!.significance).toBe('neutral');
            expect(impact!.df).toBeGreaterThan(0);
        });

        it('should handle metrics missing from baselineStats gracefully', () => {
            const reports = analyzeExperiments([expA], history, {}); // Empty baselineStats
            const report = reports.find(r => r.experimentId === 'exp-a');
            const impact = report?.impacts.find(i => i.metric === 'hrv');

            expect(impact).toBeDefined();
            expect(impact?.zScoreShift).toBeDefined(); // Should use default std=1
        });
    });
});
