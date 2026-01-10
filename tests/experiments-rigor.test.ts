import { analyzeExperiments, Experiment, MetricDay, tDistributionCDF, normalCDF } from '../lib/statistics/experiment-analysis';


describe('Experiments Logic - Scientific Rigor', () => {
    // 21 days of data (Correctly exceeds the 14-day engine guardrail)
    const history: MetricDay[] = Array.from({ length: 21 }, (_, i) => ({
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        hrv: i < 11 ? 50 : 60 // Increase starts at Day 12 (index 11 = 2024-01-12)
    }));



    const expA: Experiment = {
        id: 'exp-a',
        name: 'test',
        dosage: null,
        start_date: '2024-01-12', // Aligned with index 11
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
            const reports = analyzeExperiments([expA], history);
            const report = reports.find(r => r.experimentId === 'exp-a');
            const impact = report?.impacts.find(i => i.metric === 'hrv');

            expect(impact).toBeDefined();
            // df = 18 because: 21 days - 3 params (Intercept, Exp, Time Trend).
            // Lag columns (Exertion) are excluded because test data has 0 variance (constant meanExertion).
            expect(impact?.df).toBe(18);

            // With large shift and df=19, expect high significance (p < 0.001)
            expect(impact?.pValue).toBeGreaterThanOrEqual(0);
            expect(impact?.pValue).toBeLessThan(0.001);
        });

        it('should correctly classify Effect Sizes (Cohen d equivalent)', () => {
            const reports = analyzeExperiments([expA], history);
            const report = reports.find(r => r.experimentId === 'exp-a');
            const impact = report?.impacts.find(i => i.metric === 'hrv');

            // Shift: 10 points (50→60), std: 5 → Z-shift = 10/5 = 2.0
            // Magnitude 2.0 > 0.8, so it should be 'large'
            expect(impact?.effectSize).toBe('large');
        });

        it('should classify a smaller shift as "small" or "medium"', () => {
            // N = 200, Shift = 0.4 sigma (Small effect)
            // Use UTC dates to avoid timezone issues
            const N = 200;
            const history: MetricDay[] = [];

            // Base date (UTC)
            const baseTime = new Date('2024-06-01T00:00:00Z').getTime();
            const msPerDay = 24 * 60 * 60 * 1000;

            for (let i = 0; i < N + 20; i++) {
                // Generate date string manually or via safe format
                const t = baseTime - ((N + 20 - 1 - i) * msPerDay);
                const d = new Date(t);
                const dateStr = d.toISOString().split('T')[0];

                // Add noise for realism
                const noise = (i % 2 === 0 ? 1 : -1) * 2;
                history.push({
                    date: dateStr,
                    hrv: 50 + noise,
                    exertion_score: 10
                });
            }

            // Experiment covers the last 100 days
            const expStart = new Date(baseTime - (100 * msPerDay)).toISOString().split('T')[0];
            const expEnd = new Date(baseTime).toISOString().split('T')[0];

            // Add the shift (0.4 sigma = 0.8 units since std=2)
            history.forEach(d => {
                if (d.date >= expStart && d.date <= expEnd) {
                    (d as { hrv: number }).hrv += 0.8;
                }
            });

            // Adjust experiment definition
            const smallExp: Experiment = {
                id: 'small-exp',
                name: 'Small Exp',
                start_date: expStart,
                end_date: expEnd,
                dosage: 'Low',
                category: 'Test'
            };

            const reports = analyzeExperiments([smallExp], history);
            const report = reports.find(r => r.experimentId === 'small-exp');
            const impact = report?.impacts.find(i => i.metric === 'hrv');

            expect(impact).toBeDefined();
            expect(impact?.pValue).toBeLessThan(0.05); // Should be significant with N=200
            expect(impact?.effectSize).toBe('small'); // Shift of 2 with std ~5 is 0.4 sigma
        });

        it('should handle neutral outcomes with enough data but no significant change', () => {
            const neutralExp: Experiment = { ...expA, start_date: '2024-01-08', end_date: '2024-01-14' };
            const neutralHistory: MetricDay[] = Array.from({ length: 14 }, (_, i) => ({
                date: `2024-01-${String(i + 1).padStart(2, '0')}`,
                hrv: 50 // Constant HRV
            }));
            const reports = analyzeExperiments([neutralExp], neutralHistory);

            const report = reports.find(r => r.experimentId === 'exp-a');
            expect(report).toBeDefined();

            const impact = report?.impacts.find(i => i.metric === 'hrv');
            expect(impact).toBeDefined();
            expect(impact!.significance).toBe('neutral');
            expect(impact!.df).toBeGreaterThan(0);
        });

        it('should compute baseline with fallback when pre-experiment data is limited', () => {
            // Create a very short history: Experiment starts on Day 5.
            // Only 4 days of pre-data (2024-01-01 to 2024-01-04).
            // This triggers the fallback because 4 < 5 required for "local window".
            const shortFallbackHistory: MetricDay[] = Array.from({ length: 15 }, (_, i) => ({
                date: `2024-01-${String(i + 1).padStart(2, '0')}`,
                hrv: 50 + i * 0.5, // Slight trend
                exertion_score: 10 + i
            }));

            // Experiment starts 2024-01-05
            const expStart5: Experiment = { ...expA, start_date: '2024-01-05', end_date: '2024-01-10' };

            const reports = analyzeExperiments([expStart5], shortFallbackHistory);
            const report = reports.find(r => r.experimentId === 'exp-a');
            const impact = report?.impacts.find(i => i.metric === 'hrv');

            expect(impact).toBeDefined();
            expect(impact?.zScoreShift).toBeDefined(); // Should use default std=1
        });

        it('should handle multiple overlapping experiments correctly', () => {
            const expB: Experiment = {
                id: 'exp-b',
                name: 'test-b',
                dosage: null,
                start_date: '2024-01-15',
                end_date: '2024-01-21',
                category: 'supplement'
            };

            const reports = analyzeExperiments([expA, expB], history);
            expect(reports).toHaveLength(2);
            expect(reports[0].experimentId).toBe('exp-a');
            expect(reports[1].experimentId).toBe('exp-b');
        });

        it('should handle custom metrics nested structure', () => {
            const customHistory: MetricDay[] = Array.from({ length: 21 }, (_, i) => ({
                date: `2024-01-${String(i + 1).padStart(2, '0')}`,
                hrv: 50,
                custom_metrics: {
                    "Fatigue": i < 11 ? 8 : 4 // Improving fatigue in second half
                }
            }));

            const reports = analyzeExperiments([expA], customHistory);
            const impact = reports[0].impacts.find(i => i.metric === 'Fatigue');

            expect(impact).toBeDefined();
            expect(impact?.percentChange).toBeLessThan(0); // Lowering is improvement for symptoms
        });

        it('should classify as not_significant when pValue >= 0.05', () => {
            const tinyHistory: MetricDay[] = Array.from({ length: 21 }, (_, i) => ({
                date: `2024-01-${String(i + 1).padStart(2, '0')}`,
                // Add significant noise but small mean difference
                hrv: (i < 11 ? 55 : 55.2) + (Math.sin(i) * 2)
            }));

            const reports = analyzeExperiments([expA], tinyHistory);
            const impact = reports[0].impacts.find(i => i.metric === 'hrv');

            expect(impact?.effectSize).toBe('not_significant');
            expect(impact?.pValue).toBeGreaterThanOrEqual(0.05);
        });

        it('should early return an empty array if history.length < 14', () => {
            const shortHistory = history.slice(0, 10);
            const reports = analyzeExperiments([expA], shortHistory);
            expect(reports).toHaveLength(0);
        });

        it('should handle collinear experiments via matrix cleaning', () => {
            const expDuplicate: Experiment = { ...expA, id: 'exp-duplicate' };
            // analyzeExperiments usually filters or cleans duplicate patterns to prevent SINGULAR matrix errors
            const reports = analyzeExperiments([expA, expDuplicate], history);

            // It should still return reports but likely one of them is ignored or marked neutral/error in older logic, 
            // but the engine is designed to not crash.
            expect(reports).toBeDefined();
            expect(reports.length).toBeLessThanOrEqual(2);
        });

        it('should control for exertion_score and isolate medication effect', () => {
            // Scenario: Symptoms correlate with PREVIOUS day's exertion (t-1 lag model).
            // Medication starts day 12, but exertion varies throughout.
            // The regression should attribute symptom variance to lagged exertion, not medication.

            // Create realistic data: exertion varies, symptoms follow exertion with 1-day lag
            const exertionPattern = [3, 2, 5, 3, 4, 2, 8, 4, 3, 5, // Pre-medication: some high days
                10, 12, 14, 11, 13, 10, 12, 11, 13, 10, 14]; // High during med

            const confoundingHistory: MetricDay[] = Array.from({ length: 21 }, (_, i) => {
                // Symptoms follow previous day's exertion (index i uses exertion from i-1)
                const prevExertion = i > 0 ? exertionPattern[i - 1] : 3;
                const fatigue = 5 + prevExertion * 0.5; // Linear relationship with lagged exertion

                return {
                    date: `2024-01-${String(i + 1).padStart(2, '0')}`,
                    custom_metrics: { Fatigue: fatigue },
                    exertion_score: exertionPattern[i]
                };
            });

            const reports = analyzeExperiments(
                [expA], // Medication starts day 12 (index 11)
                confoundingHistory
            );

            const impact = reports[0]?.impacts.find(i => i.metric === 'Fatigue');

            // With proper exertion control:
            // The medication coefficient should be near-zero because symptoms are entirely
            // explained by the t-1 lagged exertion relationship.
            expect(impact).toBeDefined();

            // Medication effect should be essentially neutral (< 2 point impact)
            expect(impact!.coefficient).toBeGreaterThan(-2);
            expect(impact!.coefficient).toBeLessThan(2);
        });
    });
});
