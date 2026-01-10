import { analyzeExperiments, Experiment, MetricDay } from '../lib/statistics/experiment-analysis';

describe('Experiments Logic - Regression Robustness', () => {
    // 30 days of data
    // Metric 'hrv' increases from 50 to 80 during Exp A
    const history: MetricDay[] = Array.from({ length: 30 }, (_, i) => ({
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        hrv: i < 15 ? 50 : 80 // Jump at day 15
    }));

    const baselineStats = { hrv: { mean: 65, std: 15 } };

    const expA: Experiment = {
        id: 'exp-a',
        name: 'Past Experiment',
        dosage: '10mg',
        start_date: '2024-01-15',
        end_date: '2024-01-30', // Active during the "high" period
        category: 'medication'
    };

    it('should detect positive impact for Exp A normally', () => {
        const reports = analyzeExperiments([expA], history);
        const reportA = reports.find(r => r.experimentId === 'exp-a');
        const scoreImpact = reportA?.impacts.find(i => i.metric === 'hrv');

        expect(scoreImpact).toBeDefined();
        expect(scoreImpact?.coefficient).toBeGreaterThan(20);
    });

    it('should IGNORE a new experiment with NO active days and still calculate Exp A', () => {
        const expNew: Experiment = {
            id: 'exp-new',
            name: 'Brand New',
            dosage: null,
            start_date: '2024-02-01', // Future date
            end_date: null,
            category: 'supplement'
        };

        const reports = analyzeExperiments([expA, expNew], history);

        // Exp A should still work!
        const reportA = reports.find(r => r.experimentId === 'exp-a');
        const scoreImpactA = reportA?.impacts.find(i => i.metric === 'hrv');
        expect(scoreImpactA).toBeDefined();
        expect(scoreImpactA?.coefficient).toBeGreaterThan(20);

        // Exp New should have NO results (excluded)
        const reportNew = reports.find(r => r.experimentId === 'exp-new');
        const scoreImpactNew = reportNew?.impacts.find(i => i.metric === 'hrv');
        expect(scoreImpactNew).toBeUndefined();
    });

    it('should HANDLE collinear experiments by keeping the first one and excluding duplicates', () => {
        // Create a history where Exp New is active for only 1 day
        const historyWithNew = [...history, { date: '2024-02-01', hrv: 80 }];

        const expNew: Experiment = {
            id: 'exp-new',
            name: 'Brand New',
            dosage: null,
            start_date: '2024-02-01',
            end_date: null,
            category: 'supplement'
        };

        const expNew2: Experiment = {
            id: 'exp-new-2',
            name: 'Brand New 2',
            dosage: null,
            start_date: '2024-02-01',
            end_date: null,
            category: 'other'
        };

        // Exp New and Exp New 2 are identical (collinear)
        const reports = analyzeExperiments([expA, expNew, expNew2], historyWithNew);

        // Exp A should still work
        const reportA = reports.find(r => r.experimentId === 'exp-a');
        const scoreImpactA = reportA?.impacts.find(i => i.metric === 'hrv');
        expect(scoreImpactA).toBeDefined();

        // Exp New (First one) should be included (technically has 1 day active)
        const reportNew = reports.find(r => r.experimentId === 'exp-new');
        const scoreImpactNew = reportNew?.impacts.find(i => i.metric === 'hrv');
        expect(scoreImpactNew).toBeDefined();

        // Exp New 2 (Duplicate) should be EXCLUDED
        const reportNew2 = reports.find(r => r.experimentId === 'exp-new-2');
        const scoreImpactNew2 = reportNew2?.impacts.find(i => i.metric === 'hrv');
        expect(scoreImpactNew2).toBeUndefined();
    });
});
