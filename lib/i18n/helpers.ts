import { useLanguage } from '@/components/providers/language-provider';
import { useCallback } from 'react';

/**
 * Custom hook to provide standardized metric name translations across the app.
 * Handles case normalization, snake_case conversion, and fallbacks.
 */
export function useMetricTranslation() {
    const { t } = useLanguage();

    const tMetric = useCallback((key: string) => {
        if (!key) return '';

        const strictKey = key.toLowerCase();
        const dictionaryKey = `common.metric_labels.${strictKey}`;
        const translated = t(dictionaryKey);

        // If direct lookup works, return it
        if (translated !== dictionaryKey && translated) return translated;

        // Try snake_case version (e.g. "Step Count" -> "step_count")
        const snakeKey = strictKey.replace(/ /g, '_');
        const snakeDictKey = `common.metric_labels.${snakeKey}`;
        const snakeTranslated = t(snakeDictKey);

        if (snakeTranslated !== snakeDictKey && snakeTranslated) return snakeTranslated;

        // Fallback: Return key with underscores removed and proper casing
        return strictKey.replaceAll('_', ' ');
    }, [t]);

    return tMetric;
}
