import { calculateAdvancedCorrelations, detectThresholds } from '@/lib/stats/insights-logic';

describe('Insights Logic', () => {
    const mockData = [
        { date: '2024-01-01', step_count: 1000, symptom_score: 2, custom_metrics: { 'Headache': 1 } },
        { date: '2024-01-02', step_count: 5000, symptom_score: 2, custom_metrics: { 'Headache': 1 } },
        { date: '2024-01-03', step_count: 1000, symptom_score: 8, custom_metrics: { 'Headache': 4 } }, // Lagged crash from day 2
        { date: '2024-01-04', step_count: 1000, symptom_score: 8, custom_metrics: { 'Headache': 4 } },
        { date: '2024-01-05', step_count: 1000, symptom_score: 2, custom_metrics: { 'Headache': 1 } },
        { date: '2024-01-06', step_count: 1000, symptom_score: 2, custom_metrics: { 'Headache': 1 } },
        { date: '2024-01-07', step_count: 1000, symptom_score: 2, custom_metrics: { 'Headache': 1 } },
        { date: '2024-01-08', step_count: 5000, symptom_score: 2, custom_metrics: { 'Headache': 1 } },
        { date: '2024-01-09', step_count: 1000, symptom_score: 8, custom_metrics: { 'Headache': 4 } }, // Lagged crash from day 8
        { date: '2024-01-10', step_count: 1000, symptom_score: 8, custom_metrics: { 'Headache': 4 } },
    ];

    test('should calculate simultaneous correlation (Lag 0)', () => {
        const results = calculateAdvancedCorrelations(mockData);
        // After symmetric duplicate removal, correlation might be stored as symptom_score vs Headache instead
        const headacheCorr = results.find(r =>
            ((r.metricA === 'Headache' && r.metricB === 'symptom_score') ||
                (r.metricA === 'symptom_score' && r.metricB === 'Headache')) &&
            r.lag === 0
        );
        expect(headacheCorr?.coefficient).toBeGreaterThan(0.9);
    });

    test('should detect negative correlation (Inversely related)', () => {
        const negativeMockData = [
            { date: '1', hrv: 80, exertion_score: 1 },
            { date: '2', hrv: 75, exertion_score: 2 },
            { date: '3', hrv: 60, exertion_score: 5 },
            { date: '4', hrv: 55, exertion_score: 6 },
            { date: '5', hrv: 50, exertion_score: 7 },
            { date: '6', hrv: 45, exertion_score: 8 },
            { date: '7', hrv: 40, exertion_score: 9 },
        ];
        const results = calculateAdvancedCorrelations(negativeMockData);
        const hrvExertion = results.find(r => r.metricA === 'hrv' && r.metricB === 'exertion_score' && r.lag === 0);
        expect(hrvExertion?.coefficient).toBeLessThan(-0.8);
        expect(hrvExertion?.description).toContain('Reduces');
    });

    test('should detect lagged correlation (Lag 1)', () => {
        const results = calculateAdvancedCorrelations(mockData);
        // Step count at T (day 2/8) leads to symptom score at T+1 (day 3/9)
        const lagCorr = results.find(r => r.metricA === 'step_count' && r.metricB === 'symptom_score' && r.lag === 1);
        expect(lagCorr?.coefficient).toBeGreaterThan(0.5);
    });

    test('should return empty for small datasets', () => {
        const results = calculateAdvancedCorrelations(mockData.slice(0, 3));
        expect(results).toHaveLength(0);
    });

    test('should detect thresholds (Safe Zones)', () => {
        // Create data with a clear threshold at 4000 steps
        const thresholdData = [
            { date: '1', step_count: 1000, symptom_score: 1 },
            { date: '2', step_count: 1500, symptom_score: 1 },
            { date: '3', step_count: 2000, symptom_score: 1.2 },
            { date: '4', step_count: 2500, symptom_score: 1.1 },
            { date: '5', step_count: 4000, symptom_score: 5 },
            { date: '6', step_count: 4500, symptom_score: 6 },
            { date: '7', step_count: 5000, symptom_score: 5.5 },
            { date: '8', step_count: 5500, symptom_score: 7 },
            { date: '9', step_count: 6000, symptom_score: 8 },
            { date: '10', step_count: 6500, symptom_score: 9 },
        ];
        const thresholds = detectThresholds(thresholdData);
        expect(thresholds.length).toBeGreaterThan(0);
        // With 10 items, bucketSize=2, threshold detected at index 4 (means[2]) -> step_count=4000
        expect(thresholds[0].safeZoneLimit).toBe(4000);
    });
});
