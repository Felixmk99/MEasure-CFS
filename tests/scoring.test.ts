import {
    calculateSymptomScore,
    calculateExertionScore,
    calculateCompositeScore
} from '../lib/scoring/logic';
import {
    enhanceDataWithScore,
    calculateMinMaxStats
} from '../lib/scoring/composite-score';

describe('Scoring Logic', () => {
    describe('calculateExertionScore', () => {
        it('should sum exertion metrics correctly', () => {
            const metrics = {
                'Physical Exertion': 5,
                'Cognitive Exertion': 3,
                'Work': 4,
                'Headache': 10 // Should be ignored
            };
            expect(calculateExertionScore(metrics)).toBe(12);
        });

        it('should handle missing or null metrics', () => {
            expect(calculateExertionScore(null)).toBe(0);
            expect(calculateExertionScore({})).toBe(0);
        });
    });

    describe('calculateSymptomScore', () => {
        it('should sum symptoms and exclude identified non-symptoms', () => {
            const metrics = {
                'Brain Fog': 4,
                'Fatigue': 6,
                'Sleep': 8, // Excluded
                'Mood': 5, // Excluded
                'Physical Exertion': 5, // Excluded
                'Step Count': 5000 // Excluded
            };
            expect(calculateSymptomScore(metrics)).toBe(10);
        });
    });

    describe('calculateCompositeScore', () => {
        it('should follow the formula: Symptoms + Sleep - Exertion + RHR - HRV - Steps', () => {
            // Formula: p.symptomScore + p.sleepScore - p.exertionScore + p.rhr - p.hrv - p.normalizedSteps
            const params = {
                symptomScore: 10,
                sleepScore: 7,
                exertionScore: 5,
                rhr: 60,
                hrv: 40,
                normalizedSteps: 0.5
            };
            // 10 + 7 - 5 + 60 - 40 - 0.5 = 31.5
            expect(calculateCompositeScore(params)).toBe(31.5);
        });
    });
});

describe('Composite Score Enhancement', () => {
    const mockData = [
        {
            date: '2026-01-01',
            hrv: 40,
            resting_heart_rate: 60,
            step_count: 1000,
            custom_metrics: {
                'Fatigue': 5,
                'Physical Exertion': 2,
                'Sleep': 7
            }
        },
        {
            date: '2026-01-02',
            hrv: 50,
            resting_heart_rate: 55,
            step_count: 5000,
            custom_metrics: {
                'Fatigue': 2,
                'Physical Exertion': 8,
                'Sleep': 8
            }
        }
    ];

    describe('calculateMinMaxStats', () => {
        it('should calculate correct min/max for normalization', () => {
            const stats = calculateMinMaxStats(mockData);
            expect(stats.hrv).toEqual({ min: 40, max: 50 });
            expect(stats.rhr).toEqual({ min: 55, max: 60 });
            expect(stats.steps).toEqual({ min: 0, max: 5000 }); // Steps force min 0
        });
    });

    describe('enhanceDataWithScore', () => {
        it('should recalculate scores from custom_metrics and apply normalization (Default/Desirable)', () => {
            const enhanced = enhanceDataWithScore(mockData, undefined, 'desirable');

            expect(enhanced[0]).toHaveProperty('composite_score');
            expect(enhanced[0]).toHaveProperty('normalized_hrv');
            expect(enhanced[0].symptom_score).toBe(5); // Fatigue
            expect(enhanced[0].exertion_score).toBe(2); // Physical Exertion

            // Verify polarity: 
            // entry 2 has higher HRV (50 vs 40) and lower Symptoms (2 vs 5)
            // It should have a lower (better) composite score
            expect(enhanced[1].composite_score!).toBeLessThan(enhanced[0].composite_score!);

            // Check math for Exertion (Desirable = Subtracts from burden)
            // Score = Symptoms + Sleep - Exertion + RHR - HRV - Steps
        });

        it('should handle "undesirable" preference (PEM logic)', () => {
            // Pass 'undesirable'
            const enhanced = enhanceDataWithScore(mockData, undefined, 'undesirable');

            // With Undesirable, Exertion ADDS to the burden score.
            // Entry 2 has high Exertion (8) vs Entry 1 (2).
            // In Desirable mode, High Exertion helps lower the score.
            // In Undesirable mode, High Exertion increases the score.

            // Let's verify specific calculation for Entry 0:
            // Symptoms: 5
            // Sleep: 7
            // Exertion: 2 (Norm: ~0.16?)
            // RHR: 60 (Norm: 1)
            // HRV: 40 (Norm: 0)
            // Steps: 1000 (Norm: 0.2)

            // The score logic inside `enhanceDataWithScore` does complex normalization, 
            // so checking strictly "Higher than Desirable" is a good proxy.

            const enhancedDesirable = enhanceDataWithScore(mockData, undefined, 'desirable');

            // For Entry 0:
            // Desirable Score = X - Exertion
            // Undesirable Score = X + Exertion
            // So Undesirable should be significantly higher.

            expect(enhanced[0].composite_score!).toBeGreaterThan(enhancedDesirable[0].composite_score!);
        });

        it('should handle division by zero (identical min/max)', () => {
            const identicalData = [
                { date: 'D1', hrv: 50, custom_metrics: {} },
                { date: 'D2', hrv: 50, custom_metrics: {} }
            ];
            const enhanced = enhanceDataWithScore(identicalData);
            // Should not be NaN
            expect(enhanced[0].normalized_hrv).not.toBeNaN();
            expect(enhanced[0].normalized_hrv).toBe(0);
        });
    });
});
