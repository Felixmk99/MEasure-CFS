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
        // German CSV with DD.MM.YYYY, 1000s separator dots, decimal commas (for float logic if needed, but here steps are usually integers)
        // 6.500 means 6500 in German locale often, or could be 6.5. 
        // Our parser logic now detects European format if comma is after dot or no dots present but comma is.
        // Let's test explicit Thousands separator: 6.500 (meaning 6500)
        // Wait, parser logic: "If comma appears after dot... assume European format" -> 1.234,56
        // 6.500 -> has dot, no comma. 
        // If checks: normalized.includes(',') && normalized.includes('.') && lastIndexOf(',') > lastIndexOf('.')
        // 6.500: has dot, no comma. -> Goes to else.
        // else: checks normalized.includes(',') -> No. 
        // So 6.500 becomes parseFloat("6.500") -> 6.5.
        // This is tricky. German CSVs often quote strings or use clear separators.
        // If input is "6.500", standard JS parseFloat is 6.5.
        // If input is "6.500,00", then it works.
        // Let's adjust test data to be unambiguous or match our logic.
        // Let's try "6.500,00" to trigger European logic.
        const csv = `Datum;Schritte,Extra
01.01.2023,5000,foo
02.01.2023,"6.500,00",bar`

        // PapaParse auto-detect might fail on mixed delimiters if not careful.
        // Let's stick to commas for delimiter to isolate number parsing.

        const csvGerman = `Datum,Schritte
01.01.2023,5000
02.01.2023,"6.500,00"`

        const result = await parseGenericStepCsv(csvGerman)
        expect(result).toHaveLength(2)
        expect(result[0]).toEqual({ date: '2023-01-01', steps: 5000 })
        expect(result[1]).toEqual({ date: '2023-01-02', steps: 6500 })
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
        await expect(parseGenericStepCsv(csv)).rejects.toThrow('missing_columns')
    })
})
