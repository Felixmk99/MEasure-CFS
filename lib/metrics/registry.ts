/**
 * Central Metric Source of Truth
 * 
 * Defines the behavior and "desirability" of every tracker in the app.
 * This ensures consistency between Dashboard trends (Green/Red) 
 * and Experiment outcomes (Positive/Negative Impact).
 */

export type MetricDirection = 'higher' | 'lower';

export interface MetricConfig {
    key: string;
    label?: string; // Display name override
    direction: MetricDirection;
    unit?: string;
    color?: string; // Default chart color
}

const REGISTRY: Record<string, Omit<MetricConfig, 'key'>> = {
    // Biometrics: Higher is Better
    'hrv': { direction: 'higher', unit: 'ms', color: '#3B82F6', label: 'HRV' },
    'steps': { direction: 'higher', unit: '', color: '#06B6D4', label: 'Steps' },
    'step_count': { direction: 'higher', unit: '', color: '#06B6D4', label: 'Steps' },
    'normalized_steps': { direction: 'higher', unit: '', color: '#06B6D4', label: 'Steps' },

    // Biometrics: Lower is Better
    'resting_heart_rate': { direction: 'lower', unit: 'bpm', color: '#F59E0B', label: 'Resting HR' },
    'rhr': { direction: 'lower', unit: 'bpm', color: '#F59E0B', label: 'Resting HR' },

    // Combined Scores: Lower is Better
    'composite_score': { direction: 'lower', unit: '', color: '#3B82F6', label: 'MEasure-CFS Score' },
    'adjusted_score': { direction: 'lower', unit: '', color: '#3B82F6', label: 'MEasure-CFS Score' },
    'symptom_score': { direction: 'lower', unit: '', color: '#F59E0B', label: 'Symptom Score' },
    'exertion_score': { direction: 'lower', unit: '', color: '#10B981', label: 'Exertion' },

    // Specific Symptoms: Lower is Better
    'sleep': { direction: 'lower', unit: '', color: '#6366F1', label: 'Sleep problems' },
    'crash': { direction: 'lower', unit: '', color: '#EF4444', label: 'Crash' },
};

/**
 * Robustly retrieves config for any metric.
 * Default for custom metrics / symptoms: "Lower is Better" (Desirable to decrease symptoms).
 */
export function getMetricRegistryConfig(metric: string): MetricConfig {
    const key = metric.toLowerCase();
    const config = REGISTRY[metric] || REGISTRY[key];

    if (config) {
        return {
            ...config,
            key: metric,
            label: config.label || metric
        };
    }

    // Default Behavior: 
    // All other custom metrics/symptoms are assumed "Lower is Better" (undesirable to increase).
    return {
        key: metric,
        label: metric,
        direction: 'lower',
        unit: '',
        color: '#8B5CF6' // Default purple for custom metrics
    };
}
