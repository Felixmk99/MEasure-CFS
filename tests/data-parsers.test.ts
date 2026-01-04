import { parseGoogleFitCsv } from '../lib/data/google-fit-parser';
import { parseSamsungHealthCsv } from '../lib/data/samsung-health-parser';

describe('Data Parsers', () => {
    describe('Google Fit Parser', () => {
        it('should parse standard Google Fit activity CSV', async () => {
            const csv = `Date,Steps\n2026-01-01,5000\n2026-01-02,7500`;
            const result = await parseGoogleFitCsv(csv);
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({ date: '2026-01-01', steps: 5000 });
            expect(result[1]).toEqual({ date: '2026-01-02', steps: 7500 });
        });

        it('should handle different header variants', async () => {
            const csv = `Window start,Step count\n2026-01-01,1000`;
            const result = await parseGoogleFitCsv(csv);
            expect(result[0]).toEqual({ date: '2026-01-01', steps: 1000 });
        });

        it('should aggregate multiple rows for the same date', async () => {
            const csv = `Date,Steps\n2026-01-01 08:00:00,1000\n2026-01-01 12:00:00,2000`;
            const result = await parseGoogleFitCsv(csv);
            expect(result).toHaveLength(1);
            expect(result[0].steps).toBe(3000);
        });

        it('should filter by type if present', async () => {
            const csv = `Date,Steps,Type\n2026-01-01,1000,com.google.step_count\n2026-01-01,500,heart_rate`;
            const result = await parseGoogleFitCsv(csv);
            expect(result[0].steps).toBe(1000); // heart_rate row ignored
        });
    });

    describe('Samsung Health Parser', () => {
        it('should parse Samsung Health step count CSV', async () => {
            const csv = `start_time,count\n2026-01-01 12:00:00.000,5000\n2026-01-02 12:00:00.000,7500`;
            const result = await parseSamsungHealthCsv(csv);
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({ date: '2026-01-01', steps: 5000 });
        });

        it('should aggregate Samsung Health sessions to daily totals', async () => {
            const csv = `start_time,count\n2026-01-01 08:00:00.000,1000\n2026-01-01 14:00:00.000,2000`;
            const result = await parseSamsungHealthCsv(csv);
            expect(result).toHaveLength(1);
            expect(result[0].steps).toBe(3000);
        });
    });
});
