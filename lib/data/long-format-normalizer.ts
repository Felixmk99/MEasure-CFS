import { Database } from "@/types/database.types";

/**
 * Normalizes "Long Format" CSV data from Visible.
 * Each row in CSV is one measurement (e.g. HRV, Symptom, etc.) for a specific date.
 * We need to PIVOT this into one object per Day.
 */
export function normalizeLongFormatData(rows: any[]) {
    const dailyRecords: Record<string, any> = {};

    rows.forEach(row => {
        const date = row['observation_date'];
        const name = row['tracker_name'];
        const value = parseFloat(row['observation_value']);

        if (!date || isNaN(value)) return;

        if (!dailyRecords[date]) {
            dailyRecords[date] = {
                date,
                hrv: null,
                resting_heart_rate: null,
                exertion_score: null,
                custom_metrics: {},
                raw_symptoms: [] // Temp array to calculate composite symptom score later
            };
        }

        const record = dailyRecords[date];

        // Map known metrics
        switch (name) {
            case 'HRV':
                record.hrv = value;
                break;
            case 'Resting HR':
                record.resting_heart_rate = Math.round(value);
                break;
            case 'Stability Score':
                record.exertion_score = value;
                break;
            default:
                // Identify Symptoms based on Category
                const category = row['tracker_category'];
                // These categories generally contain 0-3 ordinal symptom severity ratings
                const isSymptomCategory = ['Pain', 'Brain', 'General', 'Gastrointestinal', 'Muscles', 'Heart and Lungs', 'Emotional', 'Physical'].includes(category);

                // Exclude 'Sleep' or 'Cognitive' or 'Social' from Symptom Score if they refer to 'Demands' rather than 'Symptoms'.
                // The provided list says 'Mentally demanding' -> Cognitive. 'Socially demanding' -> Social. These are loads, not symptoms.
                // 'Physical' contains 'Physically active' (load?) or symptoms? Screenshot shows 'Physically active' = 1.
                // Let's exclude 'Physical', 'Social', 'Cognitive' from the *Negative Symptom Score* calculation, as they might be exertion.

                const isSymptom = ['Pain', 'Brain', 'General', 'Gastrointestinal', 'Muscles', 'Heart and Lungs', 'Emotional'].includes(category);

                if (isSymptom) {
                    // Check if it's a numeric value (some might be notes)
                    if (!isNaN(value)) {
                        record.raw_symptoms.push(value);
                    }
                }

                // Store everything in custom_metrics for flexibility
                if (name && value !== undefined && !isNaN(value)) {
                    record.custom_metrics[name] = value;
                }
                break;
        }
    });

    // Final pass: Collapse dailyRecords into array and calc daily aggregates
    return Object.values(dailyRecords).map(record => {
        // Calculate daily symptom score (Average? Sum? Max?)
        // Visible usually computes a "Total Symptom Score". If it's not present in the CSV as a row, we calculate a simple average (0-3 scale).
        // However, if the user had 10 symptoms at level 1, is that worse than 1 symptom at level 3?
        // Let's use MEAN for now to stay within 0-3 scale roughly.
        let calculatedSymptomScore = null;
        if (record.raw_symptoms.length > 0) {
            const sum = record.raw_symptoms.reduce((a: number, b: number) => a + b, 0);
            calculatedSymptomScore = sum / record.raw_symptoms.length;
        }

        // Clean up temp fields
        const { raw_symptoms, ...finalRecord } = record;

        return {
            ...finalRecord,
            symptom_score: calculatedSymptomScore
        };
    });
}
