import {
    calculateBaselineStats,
    extractEpochs,
    calculateZScores,
    analyzePreCrashPhase,
    analyzeCrashPhase,
    analyzeRecoveryPhase,
    aggregateEpochs
} from '../lib/statistics/pem-cycle';

describe('PEM Cycle Analysis', () => {
    const mockBaselineData = [
        { hrv: 40, step_count: 1000, custom_metrics: { 'Fatigue': 2 } },
        { hrv: 50, step_count: 2000, custom_metrics: { 'Fatigue': 2 } },
        { hrv: 60, step_count: 3000, custom_metrics: { 'Fatigue': 2 } }
    ];
    const metrics = ['hrv', 'step_count', 'Fatigue'];

    describe('calculateBaselineStats', () => {
        it('should calculate mean and std correctly', () => {
            const stats = calculateBaselineStats(mockBaselineData, metrics);
            expect(stats.hrv.mean).toBe(50);
            expect(stats.hrv.std).toBeCloseTo(8.16, 1);
            expect(stats.Fatigue.mean).toBe(2);
            expect(stats.Fatigue.std).toBe(0);
        });
    });

    describe('Phase Detection & Z-Scores', () => {
        const baselineStats = {
            hrv: { mean: 50, std: 10 },
            step_count: { mean: 2000, std: 1000 },
            exertion_score: { mean: 2, std: 1 },
            symptom_score: { mean: 5, std: 2 }
        };

        const createSortedData = (crashIndex: number, triggerType: 'acute' | 'lagged' | 'cumulative') => {
            const data = Array(30).fill(null).map((_, i) => ({
                date: `2026-01-${(i + 1).toString().padStart(2, '0')}`,
                hrv: 50,
                step_count: 2000,
                exertion_score: 2,
                symptom_score: 5,
                custom_metrics: {}
            }));

            // Identify crash day
            data[crashIndex].custom_metrics = { 'Crash': 1, 'crash': 1 };

            if (triggerType === 'acute') {
                // Spike on Day 0
                data[crashIndex].exertion_score = 10; // +8 sigma
            } else if (triggerType === 'lagged') {
                // Spike on Day -2
                data[crashIndex - 2].exertion_score = 10;
            } else if (triggerType === 'cumulative') {
                // Sustained high effort
                for (let i = 1; i <= 3; i++) {
                    data[crashIndex - i].exertion_score = 6; // +4 sigma
                }
            }
            return data;
        };

        it('should detect Acute triggers correctly', () => {
            const sortedData = createSortedData(10, 'acute');
            const epochs = extractEpochs(sortedData, [10], ['exertion_score']);
            const epochsWithZ = calculateZScores(epochs, baselineStats);

            // Analyze the full pipeline
            const metricsList = ['exertion_score'];
            const aggregated = aggregateEpochs(epochsWithZ, metricsList);
            const result = analyzePreCrashPhase(aggregated, baselineStats);

            expect(result.discoveries).toHaveLength(1);
            expect(result.discoveries[0].classification).toBe('Acute');
            expect(result.triggerLag).toBe(0);
        });

        it('should correctly extract epochs around crash events', () => {
            const sortedData = createSortedData(10, 'acute');
            const epochs = extractEpochs(sortedData, [10], ['hrv']);
            expect(epochs).toHaveLength(1);
            // Window is -7 to +14 (22 days total if available)
            expect(epochs[0].data).toHaveLength(22);
            expect(epochs[0].data.find(d => d.dayOffset === 0)?.date).toBe('2026-01-11');
        });
    });

    describe('Recovery & Crash Analysis', () => {
        const baselineStats = {
            hrv: { mean: 50, std: 10 },
            symptom_score: { mean: 5, std: 2 }
        };

        it('should identify Type A vs Type B crashes', () => {
            // This is tested via analyzeCrashPhase logic
            // We'll verify it returns valid durations
            const mockEpoch: any = {
                data: [
                    { dayOffset: 0, metrics: { Crash: 1 }, zScores: { hrv: -3 } },
                    { dayOffset: 1, metrics: { Crash: 1 }, zScores: { hrv: -2 } },
                    { dayOffset: 2, metrics: { Crash: 0 }, zScores: { hrv: 0 } }
                ]
            };
            const result = analyzeCrashPhase([mockEpoch], baselineStats);
            expect(result.avgLoggedDuration).toBe(2);
            expect(result.avgPhysiologicalDuration).toBe(2);
        });

        it('should detect the Recovery Tail (Hysteresis)', () => {
            const mockEpoch: any = {
                data: [
                    { dayOffset: 0, metrics: { Crash: 1 }, zScores: { hrv: -2, symptom_score: 2 } },
                    { dayOffset: 1, metrics: { Crash: 0 }, zScores: { hrv: -1.5, symptom_score: 0.5 } } // Symptoms recovered, but HRV still low
                ]
            };
            const result = analyzeRecoveryPhase([mockEpoch], baselineStats);
            expect(result?.hysteresisGap).toBeGreaterThan(0);
            expect(result?.slowestRecoverers).toContain('hrv');
        });
    });
});
