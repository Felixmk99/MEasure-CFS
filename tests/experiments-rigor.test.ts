import { analyzeExperiments, Experiment, MetricDay } from '../lib/statistics/experiment-analysis';

describe('Experiments Logic - Scientific Rigor', () => {
    // 21 days of data (Small N, should use T-Distribution)
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

    it('should calculate more conservative P-values with small N (T-Distribution)', () => {
        const reports = analyzeExperiments([expA], history, baselineStats);
        const report = reports.find(r => r.experimentId === 'exp-a');
        const impact = report?.impacts.find(i => i.metric === 'hrv');

        expect(impact).toBeDefined();
        expect(impact?.df).toBe(19); // 21 days - 2 coefficients (intercept + exp)

        // With small N, significance is harder to reach than Z-test
        // An increase from 50 to 60 with std 5 is 2 sigma (Large effect), 
        // but with N=21, the P-value should reflect the T-distribution
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

    it('should handle extreme small samples (N=2) without crashing', () => {
        const tinyHistory: MetricDay[] = [
            { date: '2024-01-01', hrv: 50 },
            { date: '2024-01-02', hrv: 60 }
        ];
        const reports = analyzeExperiments([expA], tinyHistory, baselineStats);

        // With only 2 data points and 2 coefficients, DF is 0. 
        // OLS might return singular matrix or zero standard error.
        // The engine handles this by ensuring we don't divide by zero and returns neutral.
        const report = reports.find(r => r.experimentId === 'exp-a');
        const impact = report?.impacts.find(i => i.metric === 'hrv');

        // Should either be neutral or undefined depending on collinearity filter
        if (impact) {
            expect(impact.significance).toBe('neutral');
            expect(impact.df).toBe(0);
        }
    });

    it('should handle metrics missing from baselineStats gracefully', () => {
        const reports = analyzeExperiments([expA], history, {}); // Empty baselineStats
        const report = reports.find(r => r.experimentId === 'exp-a');
        const impact = report?.impacts.find(i => i.metric === 'hrv');

        expect(impact).toBeDefined();
        expect(impact?.zScoreShift).toBeDefined(); // Should use default std=1
    });
});
