import { Database } from "@/types/database.types";
import { calculateSymptomScore, calculateExertionScore } from "@/lib/scoring/logic";

/**
 * Normalizes "Long Format" CSV data from Visible.
 * Each row in CSV is one measurement (e.g. HRV, Symptom, etc.) for a specific date.
 * We need to PIVOT this into one object per Day.
 */
export function normalizeLongFormatData(rows: any[]) {
    const dailyRecords: Record<string, any> = {};

    // Helper to find key case-insensitively
    const findKey = (row: any, candidates: string[]) => {
        const keys = Object.keys(row);
        for (const candidate of candidates) {
            const found = keys.find(k => k.toLowerCase().trim() === candidate.toLowerCase());
            if (found) return found;
        }
        return null;
    };

    // Detect keys from first row if possible, or just look per row (slightly slower but safer)
    if (rows.length === 0) return [];

    rows.forEach(row => {
        const dateKey = findKey(row, ['observation_date', 'date', 'day', 'timestamp']);
        const nameKey = findKey(row, ['tracker_name', 'name', 'metric', 'type', 'symptom', 'variable']);
        const valueKey = findKey(row, ['observation_value', 'value', 'score', 'rating', 'level']);
        const categoryKey = findKey(row, ['tracker_category', 'category', 'group']);

        const date = dateKey ? row[dateKey] : null;
        const name = nameKey ? row[nameKey] : null;
        const valueStr = valueKey ? row[valueKey] : null;
        const value = parseFloat(valueStr);
        const category = categoryKey ? row[categoryKey] : 'Other';

        if (!date || isNaN(value)) return;

        if (!dailyRecords[date]) {
            dailyRecords[date] = {
                date,
                custom_metrics: {}
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
            case 'Steps':
            case 'Step Count':
            case 'Step count':
                record.step_count = value;
                break;
            default:
                // Everything else goes into Custom Metrics
                if (name && value !== undefined && !isNaN(value)) {
                    // Filter out Funcap values or 'Infection' from custom_metrics (requested by user)
                    if ((category && category.toLowerCase().startsWith('funcap_')) || name === 'Infection') {
                        // Skip
                    } else {
                        record.custom_metrics[name] = value;
                        record._has_trackers = true;
                    }
                }
                break;
        }
    });

    // Final pass: Collapse dailyRecords into array
    return Object.values(dailyRecords).map(record => {
        // Only calculate/update scores if tracker data was actually found in this CSV for this date.
        // This prevents overwriting existing scores with 0 if processing a partial CSV (e.g. only Wellness data).
        if (record._has_trackers) {
            record.symptom_score = calculateSymptomScore(record.custom_metrics)
            record.exertion_score = calculateExertionScore(record.custom_metrics)
        }
        delete record._has_trackers;

        return record;
    });
}
