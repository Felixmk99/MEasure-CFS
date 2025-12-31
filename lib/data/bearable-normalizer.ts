import { calculateSymptomScore, calculateExertionScore } from "@/lib/scoring/logic";

/**
 * Normalizes Bearable "Long Format" CSV data.
 * Columns: date, date formatted, weekday, time of day, category, rating/amount, detail, notes
 */
export function normalizeBearableData(rows: any[]) {
    const dailyRecords: Record<string, any> = {};

    rows.forEach(row => {
        const date = row['date formatted'];
        const category = row['category'];
        const ratingStr = row['rating/amount'];
        const detail = row['detail'] || '';

        if (!date) return;

        if (!dailyRecords[date]) {
            dailyRecords[date] = {
                date,
                custom_metrics: {},
                _has_trackers: false
            };
        }

        const record = dailyRecords[date];

        // 1. Health measurements -> Step count (steps)
        if (category === 'Health measurements' && detail.toLowerCase().includes('step count')) {
            const steps = parseInt(ratingStr);
            if (!isNaN(steps)) {
                record.step_count = steps;
                record._has_trackers = true;
            }
        }

        // 2. Symptom -> Extract score
        if (category === 'Symptom') {
            const rating = parseFloat(ratingStr);
            if (!isNaN(rating)) {
                // Extract symptom name (e.g., "Brain fog" from "Brain fog (Mild)")
                const symptomName = detail.includes('(')
                    ? detail.split('(')[0].trim()
                    : detail.trim();

                if (symptomName) {
                    // Bearable might have multiple entries per symptom per day (e.g. am, mid, pm)
                    // We take the MAX for that day to represent the worst point, or should we average?
                    // User said: "ignoring time of day". 
                    // Usually for symptoms, "Worst in day" is a good proxy.
                    record.custom_metrics[symptomName] = Math.max(record.custom_metrics[symptomName] || 0, rating);
                    record._has_trackers = true;
                }
            }
        }

        // 3. Mood / Energy -> Custom Metrics
        if (category === 'Mood' || category === 'Energy') {
            const rating = parseFloat(ratingStr);
            if (!isNaN(rating)) {
                record.custom_metrics[category] = rating;
                record._has_trackers = true;
            }
        }

        // 4. Work -> Map to Exertion Scale
        // detail example: "💼 Work - Moderate"
        if (category === 'Work') {
            const scaleMap: Record<string, number> = {
                'none': 0,
                'little': 1,
                'moderate': 3,
                'a lot': 5
            };

            const lowercaseDetail = detail.toLowerCase();
            let score = 0;

            for (const [key, val] of Object.entries(scaleMap)) {
                if (lowercaseDetail.includes(key)) {
                    score = val;
                    break;
                }
            }

            if (score > 0) {
                // We add "Work Exertion" to custom_metrics so calculateExertionScore can find it
                // Note: I'll need to add "Work Exertion" to EXERTION_METRICS in logic.ts
                record.custom_metrics['Work Exertion'] = score;
                record._has_trackers = true;
            }
        }
    });

    // Final pass: Collapse dailyRecords into array and calculate scores
    return Object.values(dailyRecords).map(record => {
        if (record._has_trackers) {
            record.symptom_score = calculateSymptomScore(record.custom_metrics);
            record.exertion_score = calculateExertionScore(record.custom_metrics);
        }
        delete record._has_trackers;
        return record;
    });
}
