import Papa from 'papaparse'
import { format, isValid, parse } from 'date-fns'

export interface ParsedStepData {
    date: string
    steps: number
}

/**
 * Parses Samsung Health "Step count" CSV.
 * Expected format: com.samsung.health.step_count.XXXXX.csv
 * Significant columns: start_time, count
 * start_time format: "YYYY-MM-DD HH:mm:ss.SSS"
 */
export async function parseSamsungHealthCsv(csvContent: string): Promise<ParsedStepData[]> {
    return new Promise((resolve, reject) => {
        Papa.parse(csvContent, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            complete: (results) => {
                const dailyAggregation: Record<string, number> = {}

                // Samsung Health CSVs often have multiple header rows or weird stuff at the top.
                // However, PapaParse with header:true handles standard CSVs.
                // If there's garbage rows before the actual data, we might need to skip them.
                // Usually Samsung CSVs start with a row of metadata (device info) or just headers.

                results.data.forEach((row: any) => {
                    // Extract fields
                    const startTime = row['start_time']
                    const count = row['count']

                    if (startTime && count !== undefined && count !== null) {
                        try {
                            // Samsung format: "2023-10-25 00:00:00.000"
                            // parseISO doesn't always love the space instead of T.
                            // We can replace space with T or use parse()
                            const sanitizedTime = startTime.toString().replace(' ', 'T')
                            let parsedDate = new Date(sanitizedTime)

                            if (!isValid(parsedDate)) {
                                // Fallback for various formats
                                parsedDate = new Date(startTime)
                            }

                            if (isValid(parsedDate)) {
                                const dateKey = format(parsedDate, 'yyyy-MM-dd')
                                const steps = Number(count)

                                if (!isNaN(steps)) {
                                    dailyAggregation[dateKey] = (dailyAggregation[dateKey] || 0) + steps
                                }
                            }
                        } catch (e) {
                            // Skip malformed rows
                        }
                    }
                })

                const data = Object.entries(dailyAggregation)
                    .map(([date, steps]) => ({ date, steps }))
                    .sort((a, b) => a.date.localeCompare(b.date))

                resolve(data)
            },
            error: (error: any) => {
                reject(error)
            }
        })
    })
}
