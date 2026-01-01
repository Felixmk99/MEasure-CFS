import { calculateSymptomScore, calculateExertionScore } from "@/lib/scoring/logic";

interface BearableRow {
    'date formatted': string;
    category: string;
    'rating/amount'?: string;
    detail?: string;
}

interface DailyRecord {
    date: string;
    custom_metrics: Record<string, number>;
    _has_trackers: boolean;
    step_count?: number;
    symptom_score?: number;
    exertion_score?: number;
}

/**
 * Normalizes Bearable "Long Format" CSV data.
 * Columns: date, date formatted, weekday, time of day, category, rating/amount, detail, notes
 */
export function normalizeBearableData(rows: BearableRow[]) {
    const dailyRecords: Record<string, DailyRecord> = {};

    const levelMap: Record<string, number> = {
        'none': 0,
        'little': 1,
        'moderate': 2,
        'a lot': 3
    };

    rows.forEach((row) => {
        const date = row['date formatted'];
        const category = row['category'];
        const ratingStr = row['rating/amount'] || '';
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

        // 1. Mood & Energy (1-10 and 1-5 scales)
        if (category === 'Mood' || category === 'Energy') {
            const val = parseFloat(ratingStr);
            if (!isNaN(val)) {
                record.custom_metrics[category] = val;
                record._has_trackers = true;
            }
        }

        // 2. Symptoms (0-4 scale, take MAX daily)
        if (category === 'Symptom') {
            const rating = parseFloat(ratingStr);
            if (!isNaN(rating)) {
                // Extract clean symptom name
                const symptomName = detail.includes('(')
                    ? detail.split('(')[0].trim()
                    : detail.trim();

                if (symptomName) {
                    record.custom_metrics[symptomName] = Math.max(record.custom_metrics[symptomName] || 0, rating);
                    record._has_trackers = true;
                }
            }
        }

        // 3. Sleep (Duration conversion H:MM -> decimal hours)
        if (category === 'Sleep') {
            if (ratingStr.includes(':')) {
                const [hours, minutes] = ratingStr.split(':').map(Number);
                if (!isNaN(hours) && !isNaN(minutes)) {
                    record.custom_metrics['Sleep Duration'] = hours + (minutes / 60);
                    record._has_trackers = true;
                }
            }
        }

        // 4. Sleep Quality (1-5 scale)
        if (category === 'Sleep quality') {
            const val = parseFloat(ratingStr);
            if (!isNaN(val)) {
                record.custom_metrics['Sleep Quality'] = val;
                record._has_trackers = true;
            }
        }

        // 5. Steps (Heath measurements)
        if (category === 'Health measurements' && detail.toLowerCase().includes('step count')) {
            const steps = parseInt(ratingStr);
            if (!isNaN(steps)) {
                record.step_count = steps;
                record._has_trackers = true;
            }
        }

        // 6. Multi-Value Categories (Lifestyle, Work, Social, etc.)
        const multiCategories = ['Lifestyle', 'Work', 'Social', 'Weather', 'Active', 'Behavioural patterns'];
        if (multiCategories.includes(category)) {
            // Split by | for multiple entries in one line
            const segments = detail.split('|').map((s: string) => s.trim()).filter(Boolean);

            segments.forEach((segment: string) => {
                // Format usually looks like: "Emoji Name - Level" (e.g. "☕ Caffeine - A lot")
                // Or sometimes just "Emoji Name"
                let name = segment;
                let levelVal = 0;

                if (segment.includes('-')) {
                    const [rawName, levelText] = segment.split('-').map((s: string) => s.trim());
                    name = rawName;
                    levelVal = levelMap[levelText.toLowerCase()] ?? 0;
                } else {
                    // Check if the name itself ends with a level word (failsafe)
                    for (const [key, val] of Object.entries(levelMap)) {
                        if (segment.toLowerCase().endsWith(key)) {
                            name = segment.slice(0, -(key.length)).trim();
                            levelVal = val;
                            break;
                        }
                    }
                }

                // Clean name: remove emoji and leading non-word characters
                // This targets surrogate pairs, BMP emojis, and variation selectors
                const cleanName = name
                    .replace(/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F910}-\u{1F96B}\u{1F980}-\u{1F9E0}\u{200D}\u{FE0F}]+\s*/u, '')
                    .trim();

                if (cleanName) {
                    record.custom_metrics[cleanName] = levelVal;
                    record._has_trackers = true;
                }
            });
        }
    });

    // Final pass: Collapse dailyRecords into array and calculate scores
    return Object.values(dailyRecords).map((record) => {
        if (record._has_trackers) {
            record.symptom_score = calculateSymptomScore(record.custom_metrics);
            record.exertion_score = calculateExertionScore(record.custom_metrics);
        }
        delete record._has_trackers;
        return record;
    });
}
