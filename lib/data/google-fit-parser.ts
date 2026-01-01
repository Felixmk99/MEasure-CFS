import Papa from 'papaparse'
import { format, isValid, parseISO } from 'date-fns'

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
            dynamicTyping: true,
            complete: (results) => {
                const dailyAggregation: Record<string, number> = {}

                results.data.forEach((row: any) => {
                    // Normalize headers (Google Fit headers can have many variations)
                    const normalizedRow: Record<string, unknown> = {}
                    Object.keys(row).forEach(key => {
                        normalizedRow[key.toLowerCase().replace(/[\s_-]/g, '')] = row[key]
                    })

                    // Extract potential fields
                    const dateVal = normalizedRow['date'] || normalizedRow['windowstart'] || normalizedRow['windowend']
                    const stepsVal = normalizedRow['steps'] || normalizedRow['stepcount'] || normalizedRow['value']
                    const type = (normalizedRow['type'] || '').toString().toLowerCase()

                    // Rule out non-step rows if we have a type column
                    if (type && !type.includes('step') && !type.includes('com.google.step_count')) {
                        return
                    }

                    if (dateVal && stepsVal !== undefined && stepsVal !== null) {
                        try {
                            // Try parsing date (ISO or natural)
                            let parsedDate = typeof dateVal === 'string' ? parseISO(dateVal) : new Date(dateVal as any)

                            // If invalid, fallback to plain JS Date
                            if (!isValid(parsedDate)) {
                                parsedDate = new Date(dateVal as any)
                            }

                            if (isValid(parsedDate)) {
                                const dateKey = format(parsedDate, 'yyyy-MM-dd')
                                const steps = typeof stepsVal === 'string'
                                    ? parseInt(stepsVal.replace(/,/g, ''), 10)
                                    : Number(stepsVal)

                                if (!isNaN(steps)) {
                                    dailyAggregation[dateKey] = (dailyAggregation[dateKey] || 0) + steps
                                }
                            }
                        } catch {
                            // Skip malformed rows
                        }
                    }
                })

                const data = Object.entries(dailyAggregation)
                    .map(([date, steps]) => ({ date, steps }))
                    .sort((a, b) => a.date.localeCompare(b.date))

                resolve(data)
            },
            error: (error: Error) => {
                reject(error)
            }
        })
    })
}
