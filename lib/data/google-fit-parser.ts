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
            complete: (results) => {
                const data: ParsedStepData[] = []

                results.data.forEach((row: any) => {
                    // Google Fit CSV column names can vary slightly by region, 
                    // but "Date" and "Steps" are the standard.
                    const dateStr = row['Date'] || row['date']
                    const stepsStr = row['Steps'] || row['steps'] || row['Step count']

                    if (dateStr && stepsStr) {
                        const steps = parseInt(stepsStr.replace(/,/g, ''), 10)

                        if (!isNaN(steps)) {
                            // Validate date
                            let parsedDate = new Date(dateStr)

                            // If direct parsing fails, try specific Google Fit format
                            if (!isValid(parsedDate)) {
                                parsedDate = parse(dateStr, 'yyyy-MM-dd', new Date())
                            }

                            if (isValid(parsedDate)) {
                                data.push({
                                    date: format(parsedDate, 'yyyy-MM-dd'),
                                    steps: steps
                                })
                            }
                        }
                    }
                })

                resolve(data)
            },
            error: (error: any) => {
                reject(error)
            }
        })
    })
}
