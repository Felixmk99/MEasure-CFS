import { calculateZScores, aggregateEpochs, analyzePreCrashPhase, CycleEpoch, HealthEntry } from '../lib/statistics/pem-cycle';
import { getMetricRegistryConfig } from '../lib/metrics/registry';

// Mock registry to ensure deterministic tests
jest.mock('../lib/metrics/registry', () => ({
    getMetricRegistryConfig: (metric: string) => {
        const lower = metric.toLowerCase();
        if (lower === 'hrv') return { direction: 'higher', label: 'HRV' }; // Higher is Better
        if (lower === 'symptoms') return { direction: 'lower', label: 'Symptoms' }; // Lower is Better
        if (lower === 'exertion') return { direction: 'lower', label: 'Exertion' }; // Lower is Better
        return { direction: 'lower', label: metric }; // Default
    }
}));

describe('PEM Logic - Scientific Rigor', () => {

    describe('Zero-Variance Fallback', () => {
        it('should assign negative Z-score when "Higher is Better" metric drops below stable baseline', () => {
            // Scenario: HRV is always 50 (std=0). Suddenly it drops to 40 (Crash).
            // Current Logic Bug: (40 - 50) < 0. Fallback checks (val > mean ? 2 : 0) -> Returns 0.
            // Expected: Should be -2 (Significant Drop).

            const baselineStats = { 'hrv': { mean: 50, std: 0 } };
            const epoch: CycleEpoch = {
                crashDate: '2024-01-01',
                startIndex: 0,
                data: [{
                    dayOffset: 0,
                    date: '2024-01-01',
                    metrics: { 'hrv': 40 }, // Drop
                    zScores: {}
                }]
            };

            const result = calculateZScores([epoch], baselineStats);
            const zScore = result[0].data[0].zScores['hrv'];

            expect(zScore).toBe(-2);
        });

        it('should assign positive Z-score when "Lower is Better" metric rises above stable baseline', () => {
            // Scenario: Symptoms always 0. Rises to 5.
            // Current Logic: (5 - 0) > 0. Fallback checks (val > mean ? 2 : 0) -> Returns 2. (Already working)

            const baselineStats = { 'symptoms': { mean: 0, std: 0 } };
            const epoch: CycleEpoch = {
                crashDate: '2024-01-01',
                startIndex: 0,
                data: [{
                    dayOffset: 0,
                    date: '2024-01-01',
                    metrics: { 'symptoms': 5 }, // Rise
                    zScores: {}
                }]
            };

            const result = calculateZScores([epoch], baselineStats);
            const zScore = result[0].data[0].zScores['symptoms'];

            expect(zScore).toBe(2);
        });
    });

    describe('Combinatorial Signal Alignment', () => {
        it('should detect synergy between opposing polarity signals (High Exertion + Low HRV)', () => {
            // Scenario: Exertion Spike (+3Z) and HRV Drop (-3Z).
            // Current Logic Bug: (+3 + -3) / sqrt(2) = 0.
            // Expected: Both are "Bad". Should sum magnitudes or align signs. 
            // If we treat "Strain" as positive, both should be +3. Joint Z = 3*sqrt(2) approx 4.2.

            const profile = [{
                dayOffset: -1,
                metrics: {
                    'exertion': { mean: 3, std: 1, n: 10 }, // High Exertion (Bad)
                    'hrv': { mean: -3, std: 1, n: 10 }      // Low HRV (Bad)
                }
            }];

            const baselineStats = {
                'exertion': { mean: 0, std: 1 },
                'hrv': { mean: 50, std: 10 }
            };

            const result = analyzePreCrashPhase(profile, baselineStats);

            // Look for a combined discovery "exertion + hrv"
            const synergy = result.discoveries.find(d => d.metric.includes('exertion') && d.metric.includes('hrv'));

            expect(synergy).toBeDefined();
            expect(synergy?.type).toBe('spike'); // Should be a "Spike" in Risk/Strain
            expect(synergy?.magnitude).toBeGreaterThan(3); // Should be stronger than individual parts
        });
    });

});
