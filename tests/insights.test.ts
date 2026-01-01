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
        // Headache and symptom_score move together perfectly in mockData at Lag 0
        const headacheCorr = results.find(r => r.metricA === 'Headache' && r.metricB === 'symptom_score' && r.lag === 0);
        expect(headacheCorr?.coefficient).toBeGreaterThan(0.9);
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
        // Create data with a clear threshold at 3000 steps
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
        expect(thresholds[0].safeZoneLimit).toBeGreaterThan(2500);
        expect(thresholds[0].safeZoneLimit).toBeLessThan(5000);
    });
});
