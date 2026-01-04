import Papa from 'papaparse'
import { format, isValid, parseISO, parse } from 'date-fns'

export interface ParsedStepData {
    date: string
    steps: number
}

// Possible headers for Date column (lowercase)
const DATE_HEADERS = ['date', 'datum', 'time', 'zeit', 'timestamp', 'day', 'tag']
// Possible headers for Steps column (lowercase)
const STEP_HEADERS = ['steps', 'step', 'schritte', 'count', 'amount', 'anzahl', 'lauf', 'walk']

/**
 * Parses a generic CSV for step data.
 * - Identifies "Date" and "Steps" columns via fuzzy matching.
 * - Aggregates multiple entries per day (sum).
 * - Filters out dates not present in validDates (if provided).
 */
export async function parseGenericStepCsv(
    fileOrContent: File | string,
    validDates?: Set<string>
): Promise<ParsedStepData[]> {
    return new Promise((resolve, reject) => {
        Papa.parse(fileOrContent, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: false,
            complete: (results) => {
                const dailyAggregation: Record<string, number> = {}
                const headers = results.meta.fields || []

                // Identify columns
                const matchesHeader = (header: string, candidates: string[]) => {
                    const lower = header.toLowerCase()
                    return candidates.some(c => lower === c || lower.startsWith(c + '_') || lower.endsWith('_' + c))
                }
                const dateCol = headers.find(h => matchesHeader(h, DATE_HEADERS))
                const stepsCol = headers.find(h => matchesHeader(h, STEP_HEADERS))

                if (!dateCol || !stepsCol) {
                    reject(new Error('missing_columns'))
                    return
                }

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                results.data.forEach((row: any) => {
                    const dateRaw = row[dateCol]
                    const stepsRaw = row[stepsCol]

                    if (!dateRaw || stepsRaw === undefined || stepsRaw === null) return

                    let parsedDate: Date | null = null

                    // Try parsing date
                    if (typeof dateRaw === 'string') {
                        // Try ISO first
                        parsedDate = parseISO(dateRaw)
                        if (!isValid(parsedDate)) {
                            // Try German format DD.MM.YYYY
                            parsedDate = parse(dateRaw, 'dd.MM.yyyy', new Date())
                        }
                        if (!isValid(parsedDate)) {
                            // Try US format MM/DD/YYYY
                            parsedDate = parse(dateRaw, 'MM/dd/yyyy', new Date())
                        }
                    } else if (dateRaw instanceof Date) {
                        parsedDate = dateRaw
                    }

                    if (!parsedDate || !isValid(parsedDate)) return

                    const dateKey = format(parsedDate, 'yyyy-MM-dd')

                    // OPTIMIZATION: Skip if not a valid date
                    if (validDates && !validDates.has(dateKey)) return

                    // Parse steps
                    let steps = 0
                    if (typeof stepsRaw === 'number') {
                        steps = stepsRaw
                    } else if (typeof stepsRaw === 'string') {
                        // Handle European (1.234,56) and US (1,234.56) formats
                        let normalized = stepsRaw.trim()
                        // If comma appears after dot, assume European format (e.g. 1.234,56)
                        if (normalized.includes('.') && normalized.includes(',') && normalized.lastIndexOf(',') > normalized.lastIndexOf('.')) {
                            normalized = normalized.replace(/\./g, '').replace(',', '.')
                        } else if (/^\d{1,3}(\.\d{3})+$/.test(normalized)) {
                            // European integer with dot as thousand separator (e.g., "1.234" or "12.345.678")
                            normalized = normalized.replace(/\./g, '')
                        } else {
                            // US format or simple decimal, or German without dots (1234,56)
                            // If it has only comma and no dots, treat comma as decimal if it looks like a decimal separator
                            // But actually standard parse float stops at comma.
                            // Safest generic approach for mixed:
                            // If comma is present but no dot, replace comma with dot (German simple)
                            if (normalized.includes(',') && !normalized.includes('.')) {
                                normalized = normalized.replace(',', '.')
                            } else {
                                // Remove commas (thousands separator in US)
                                normalized = normalized.replace(/,/g, '')
                            }
                        }
                        steps = parseFloat(normalized)
                    }

                    if (isNaN(steps)) return

                    dailyAggregation[dateKey] = (dailyAggregation[dateKey] || 0) + steps
                })

                const data = Object.entries(dailyAggregation)
                    .map(([date, steps]) => ({ date, steps: Math.round(steps) })) // Round to integer
                    .sort((a, b) => a.date.localeCompare(b.date))

                resolve(data)
            },
            error: (error: Error) => {
                reject(error)
            }
        })
    })
}
