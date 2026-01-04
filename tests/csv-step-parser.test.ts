import { parseGenericStepCsv } from '../lib/data/csv-step-parser'

describe('parseGenericStepCsv', () => {

    test('parses simple daily CSV', async () => {
        const csv = `Date,Steps
2023-01-01,5000
2023-01-02,6000`
        const result = await parseGenericStepCsv(csv)
        expect(result).toHaveLength(2)
        expect(result[0]).toEqual({ date: '2023-01-01', steps: 5000 })
        expect(result[1]).toEqual({ date: '2023-01-02', steps: 6000 })
    })

    test('aggregates high-frequency data', async () => {
        // Simulating the user screenshot: many entries for same day
        const csv = `Date,Count
2023-01-01 10:00:00,10.5
2023-01-01 10:00:01,20.0
2023-01-01 10:00:02,5.2
2023-01-02 10:00:00,100`
        const result = await parseGenericStepCsv(csv)
        expect(result).toHaveLength(2)
        // Day 1: 10.5 + 20 + 5.2 = 35.7 -> Round to 36
        expect(result[0]).toEqual({ date: '2023-01-01', steps: 36 })
        expect(result[1]).toEqual({ date: '2023-01-02', steps: 100 })
    })

    test('handles German headers and formats', async () => {
        // Test German date format (DD.MM.YYYY) and European number format (1.234,56)
        const csvGerman = `Datum,Schritte
01.01.2023,5000
02.01.2023,"6.500,00"
03.01.2023,"1.234"`

        const result = await parseGenericStepCsv(csvGerman)
        expect(result).toHaveLength(3)
        expect(result[0]).toEqual({ date: '2023-01-01', steps: 5000 })
        expect(result[1]).toEqual({ date: '2023-01-02', steps: 6500 })
        expect(result[2]).toEqual({ date: '2023-01-03', steps: 1234 }) // "1.234" should represent 1234, not 1
    })

    test('filters data based on validDates', async () => {
        const csv = `Date,Steps
2023-01-01,5000
2023-01-02,6000
2023-01-03,7000`
        const validDates = new Set(['2023-01-01', '2023-01-03'])

        const result = await parseGenericStepCsv(csv, validDates)
        expect(result).toHaveLength(2)
        expect(result[0]).toEqual({ date: '2023-01-01', steps: 5000 })
        expect(result[1]).toEqual({ date: '2023-01-03', steps: 7000 })
        // 2023-01-02 should be skipped
    })

    test('throws error for missing columns', async () => {
        const csv = `Wrong,Column
2023-01-01,5000`
        // Should throw explicit error listing missing columns
        await expect(parseGenericStepCsv(csv)).rejects.toThrow('missing_columns:Date/Datum, Steps/Schritte')
    })
})
