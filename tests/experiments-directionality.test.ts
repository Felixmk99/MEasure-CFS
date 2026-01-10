import { analyzeExperiments, Experiment, MetricDay } from '../lib/statistics/experiment-analysis';


describe('Experiments Logic - Metric Directionality', () => {
    // 30 days of data
    const history: MetricDay[] = Array.from({ length: 30 }, (_, i) => ({
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        Fatigue: i < 15 ? 3 : 8, // Fatigue INCREASES (Bad)
        Energy: i < 15 ? 3 : 8   // Energy INCREASES (Good)
    }));



    const expA: Experiment = {
        id: 'exp-a',
        name: 'test',
        dosage: null,
        start_date: '2024-01-15',
        end_date: '2024-01-30', // Active during the "high" period
        category: 'medication'
    };

    it('should correctly identify FATIGUE increase as NEGATIVE impact (Default behavior)', () => {
        const reports = analyzeExperiments([expA], history);
        const report = reports.find(r => r.experimentId === 'exp-a');
        const impact = report?.impacts.find(i => i.metric === 'Fatigue');

        expect(impact).toBeDefined();
        expect(impact?.coefficient).toBeGreaterThan(0); // It went up
        expect(impact?.significance).toBe('negative'); // Increasing Fatigue is BAD
    });

    it('should correctly identify ENERGY increase as POSITIVE impact (Requires Heuristic/Config)', () => {
        const reports = analyzeExperiments([expA], history);
        const report = reports.find(r => r.experimentId === 'exp-a');
        const impact = report?.impacts.find(i => i.metric === 'Energy');

        expect(impact).toBeDefined();
        expect(impact?.coefficient).toBeGreaterThan(0); // It went up

        // Energy is classified as "higher is better" via the registry heuristic
        expect(impact?.significance).toBe('positive'); // Increasing Energy is GOOD
    });
});
