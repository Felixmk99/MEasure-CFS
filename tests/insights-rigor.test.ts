import { calculateAdvancedCorrelations } from '@/lib/stats/insights-logic';

describe('Insights Directional Lag Rigor', () => {
    test('should capture A leading B and B leading A correctly', () => {
        // Data where A leads B with lag 1
        const aLeadsB = [
            { date: '1', metricA: 10, metricB: 2 },
            { date: '2', metricA: 100, metricB: 2 },
            { date: '3', metricA: 10, metricB: 20 }, // B follows A
            { date: '4', metricA: 10, metricB: 2 },
            { date: '5', metricA: 100, metricB: 2 },
            { date: '6', metricA: 10, metricB: 20 },
            { date: '7', metricA: 10, metricB: 2 },
            { date: '8', metricA: 100, metricB: 2 },
            { date: '9', metricA: 10, metricB: 20 },
            { date: '10', metricA: 10, metricB: 2 },
        ];

        const results = calculateAdvancedCorrelations(aLeadsB);

        const aToB = results.find(r => r.metricA === 'metricA' && r.metricB === 'metricB' && r.lag === 1);
        const bToA = results.find(r => r.metricA === 'metricB' && r.metricB === 'metricA' && r.lag === 1);

        expect(aToB).toBeDefined();
        expect(aToB!.coefficient).toBeGreaterThan(0.9);

        // B leading A should be low correlation or not found
        if (bToA) {
            expect(bToA.coefficient).toBeLessThan(0.3);
        }
    });

    test('should handle reciprocal directionality (e.g. Activity <-> Sleep)', () => {
        // Data where A leads B AND B leads A (reciprocal relationship)
        const reciprocal = [
            { date: '1', a: 100, b: 100 },
            { date: '2', a: 10, b: 100 },
            { date: '3', a: 100, b: 10 },
            { date: '4', a: 10, b: 100 },
            { date: '5', a: 100, b: 10 },
            { date: '6', a: 10, b: 100 },
            { date: '7', a: 100, b: 10 },
            { date: '8', a: 10, b: 100 },
            { date: '9', a: 100, b: 10 },
            { date: '10', a: 10, b: 10 },
        ];
        // This data is a bit messy but let's see if we get directional insights
        const results = calculateAdvancedCorrelations(reciprocal);

        // Lag 0 should be symmetric duplicate removed (only one entry)
        const lag0 = results.filter(r => r.lag === 0 && ((r.metricA === 'a' && r.metricB === 'b') || (r.metricA === 'b' && r.metricB === 'a')));
        expect(lag0).toHaveLength(1);

        // Lag 1 should have entries for both directions if significant
        const lag1Directions = results.filter(r => r.lag === 1 && ((r.metricA === 'a' && r.metricB === 'b') || (r.metricA === 'b' && r.metricB === 'a')));

        // Both directions should be allowed for lag > 0
        expect(lag1Directions.length).toBeLessThanOrEqual(2);

        // If present, verify they represent different directional relationships
        if (lag1Directions.length === 2) {
            expect(lag1Directions[0].metricA).not.toBe(lag1Directions[1].metricA);
        }
    });
});
