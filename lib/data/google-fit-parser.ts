import Papa from 'papaparse'
import { parse, format, isValid } from 'date-fns'

export interface ParsedStepData {
    date: string
    steps: number
}

/**
 * Parses Google Fit "Daily activity metrics" CSV.
 * Expected format: Date, ... Steps
 * Date format is usually YYYY-MM-DD
 */
export async function parseGoogleFitCsv(csvContent: string): Promise<ParsedStepData[]> {
    return new Promise((resolve, reject) => {
        Papa.parse(csvContent, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true, // Automatically parse numbers
            complete: (results) => {
                const dailyAggregation: Record<string, number> = {}

                results.data.forEach((row: any) => {
                    // 1. Detect Standard Daily Format (Date, Steps)
                    const dateStr = row['Date'] || row['date']
                    const stepsVal = row['Steps'] || row['steps'] || row['Step count']

                    // 2. Detect Raw Activity Format (Type, WindowStart, Value)
                    const type = row['Type'] || row['type']
                    const windowStart = row['WindowStart'] || row['window_start']
                    const rawValue = row['Value'] || row['value']

                    // Logic: If it has daily format, use that.
                    if (dateStr && stepsVal !== undefined && stepsVal !== null) {
                        const date = format(new Date(dateStr), 'yyyy-MM-dd')
                        const steps = typeof stepsVal === 'string' ? parseInt(stepsVal.replace(/,/g, ''), 10) : Number(stepsVal)

                        if (isValid(new Date(date)) && !isNaN(steps)) {
                            dailyAggregation[date] = (dailyAggregation[date] || 0) + steps
                        }
                    }
                    // Logic: If it has activity format, filter for StepCount
                    else if (windowStart && type && rawValue !== undefined && rawValue !== null) {
                        const isStepEntry = type.toString().toLowerCase().includes('step')

                        if (isStepEntry) {
                            const date = format(new Date(windowStart), 'yyyy-MM-dd')
                            const steps = typeof rawValue === 'string' ? parseInt(rawValue.replace(/,/g, ''), 10) : Number(rawValue)

                            if (isValid(new Date(date)) && !isNaN(steps)) {
                                dailyAggregation[date] = (dailyAggregation[date] || 0) + steps
                            }
                        }
                    }
                })

                // Convert aggregation object back to array
                const data = Object.entries(dailyAggregation).map(([date, steps]) => ({
                    date,
                    steps
                }))

                resolve(data)
            },
            error: (error: any) => {
                reject(error)
            }
        })
    })
}
