import { normalizeLongFormatData } from '../lib/data/long-format-normalizer';

describe('Funcap Calculation Logic', () => {
    it('should calculate the simple average of all Funcap items on a single day', () => {
        const rows = [
            { 'date': '2026-01-01', 'name': 'Concentration', 'value': '6', 'category': 'Funcap_concentration' },
            { 'date': '2026-01-01', 'name': 'Upright', 'value': '4', 'category': 'Funcap_upright' },
            { 'date': '2026-01-01', 'name': 'Hygiene', 'value': '6', 'category': 'Funcap_hygiene' },
            { 'date': '2026-01-01', 'name': 'Outside', 'value': '0', 'category': 'Funcap_outside' },
            { 'date': '2026-01-01', 'name': 'Walking', 'value': '2', 'category': 'Funcap_walking' },
        ];

        // Sum = 6+4+6+0+2 = 18
        // Count = 5
        // Average = 3.6

        const result = normalizeLongFormatData(rows);

        expect(result).toHaveLength(1);
        const day = result[0];

        // Validate Aggregation
        expect(day.custom_metrics['Funcap Score']).toBe(3.6);

        // Validate Individual Exclusion
        expect(day.custom_metrics['Concentration']).toBeUndefined();
        expect(day.custom_metrics['Upright']).toBeUndefined();
    });

    it('should handle disjointed data (multiple days)', () => {
        const rows = [
            // Day 1
            { 'date': '2026-01-01', 'name': 'Item1', 'value': '10', 'category': 'Funcap_A' },
            { 'date': '2026-01-01', 'name': 'Item2', 'value': '20', 'category': 'Funcap_B' },
            // Day 2
            { 'date': '2026-01-02', 'name': 'Item3', 'value': '5', 'category': 'Funcap_A' },
        ];

        const result = normalizeLongFormatData(rows);
        expect(result).toHaveLength(2);

        // Day 1: Avg(10, 20) = 15
        const day1 = result.find(d => d.date === '2026-01-01');
        expect(day1?.custom_metrics['Funcap Score']).toBe(15);

        // Day 2: Avg(5) = 5
        const day2 = result.find(d => d.date === '2026-01-02');
        expect(day2?.custom_metrics['Funcap Score']).toBe(5);
    });

    it('should ignore non-funcap items in the calculation', () => {
        const rows = [
            { 'date': '2026-01-01', 'name': 'Item1', 'value': '10', 'category': 'Funcap_A' },
            { 'date': '2026-01-01', 'name': 'Steps', 'value': '5000', 'category': 'Activity' }, // Should be ignored
            { 'date': '2026-01-01', 'name': 'Item2', 'value': '20', 'category': 'Funcap_B' },
        ];

        const result = normalizeLongFormatData(rows);

        // Avg(10, 20) = 15. Steps (5000) should NOT affect average.
        expect(result[0].custom_metrics['Funcap Score']).toBe(15);
        expect(result[0].step_count).toBe(5000);
    });

    it('should handle different casing for Funcap prefix', () => {
        const rows = [
            { 'date': '2026-01-01', 'name': 'Item1', 'value': '10', 'category': 'funcap_lower' },
            { 'date': '2026-01-01', 'name': 'Item2', 'value': '20', 'category': 'Funcap_Upper' },
        ];

        const result = normalizeLongFormatData(rows);
        expect(result[0].custom_metrics['Funcap Score']).toBe(15);
    });
    it('should calculate the simple average and round to 1 decimal place', () => {
        const rows = [
            { 'date': '2026-01-01', 'name': 'Item1', 'value': '1', 'category': 'Funcap_A' },
            { 'date': '2026-01-01', 'name': 'Item2', 'value': '0', 'category': 'Funcap_B' },
            { 'date': '2026-01-01', 'name': 'Item3', 'value': '0', 'category': 'Funcap_C' },
        ];

        // Sum = 1
        // Count = 3
        // Avg = 0.33333... -> Rounded to 0.3

        const result = normalizeLongFormatData(rows);
        expect(result[0].custom_metrics['Funcap Score']).toBe(0.3);
    });

    // Edge Cases

    it('should NOT create Funcap Score if no funcap items exist', () => {
        const rows = [
            { 'date': '2026-01-01', 'name': 'Steps', 'value': '5000', 'category': 'Activity' }
        ];

        const result = normalizeLongFormatData(rows);
        expect(result[0].custom_metrics['Funcap Score']).toBeUndefined();
    });

    it('should handle all zero values correctly', () => {
        const rows = [
            { 'date': '2026-01-01', 'name': 'Item1', 'value': '0', 'category': 'Funcap_A' },
            { 'date': '2026-01-01', 'name': 'Item2', 'value': '0', 'category': 'Funcap_B' },
        ];

        const result = normalizeLongFormatData(rows);
        expect(result[0].custom_metrics['Funcap Score']).toBe(0);
    });

    it('should ignore invalid (non-numeric) values', () => {
        const rows = [
            { 'date': '2026-01-01', 'name': 'Item1', 'value': '10', 'category': 'Funcap_A' },
            { 'date': '2026-01-01', 'name': 'Item2', 'value': 'NaN', 'category': 'Funcap_B' }, // Should be ignored or treated as 0 depending on parser?
            // Current parser uses parseFloat. 'NaN' becomes NaN.
            // normalizer.ts: const val = parseFloat(...) -> if !isNaN(val) -> push
        ];

        const result = normalizeLongFormatData(rows);
        // If 'NaN' is parsed as NaN, the check in normalizer (if !isNaN) should skip it.
        // So Average should be 10 / 1 = 10.
        expect(result[0].custom_metrics['Funcap Score']).toBe(10);
    });
});
