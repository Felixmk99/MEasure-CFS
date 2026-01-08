import React from 'react';
import { render, screen } from '@testing-library/react';
import { InsightsCards } from '@/app/insights/_components/insights-cards';
import { CorrelationResult, ThresholdInsight } from '@/lib/stats/insights-logic';
import '@testing-library/jest-dom';

// Mock Provider
jest.mock('@/components/providers/language-provider', () => ({
    useLanguage: () => ({
        t: (key: string, params?: { metric?: string; value?: string | number; limit?: string | number; impact?: string }) => {
            if (key === 'common.metric_labels.step_count') return 'Steps';
            if (key === 'common.metric_labels.symptom_score') return 'Symptoms';
            if (key === 'insights.logic.reduces') return 'Reduces';
            if (key === 'insights.logic.increases') return 'Increases';
            if (key === 'insights.logic.recommendation_pattern') return `Keep ${params?.metric} around ${params?.value}`;
            if (key === 'insights.logic.by') return 'by';
            if (key === 'insights.logic.from') return 'from';
            if (key === 'insights.logic.to') return 'to';
            if (key === 'insights.logic.threshold_desc') return `Keep ${params?.metric} below ${params?.limit} to avoid ${params?.impact}`;
            return key;
        },
    }),
}));

const mockCorrelations: CorrelationResult[] = [
    {
        metricA: 'step_count',
        metricB: 'symptom_score',
        coefficient: 0.9,
        lag: 0,
        impactDirection: 'positive',
        impactStrength: 'strong',
        medianA: 5000,
        medianB: 5,
        percentChange: 50,
        typicalValue: 2,
        improvedValue: 8,
        isGood: false,
        pValue: 0.01,
        sampleSize: 20
    },
    {
        metricA: 'step_count',
        metricB: 'symptom_score',
        coefficient: 0.6,
        lag: 1, // Delayed
        impactDirection: 'positive',
        impactStrength: 'moderate',
        medianA: 4000,
        medianB: 5,
        percentChange: 30,
        typicalValue: 3,
        improvedValue: 6,
        isGood: false,
        pValue: 0.06,
        sampleSize: 15
    }
];

const mockThresholds: ThresholdInsight[] = [
    {
        metric: 'step_count',
        impactMetric: 'symptom_score',
        safeZoneLimit: 3000
    }
];

describe('InsightsCards', () => {
    test('renders correlations grouped by time', () => {
        render(<InsightsCards correlations={mockCorrelations} thresholds={mockThresholds} />);

        // Lag 0
        expect(screen.getByText('insights.patterns.same_day')).toBeInTheDocument();

        // Let's rely on finding 'Steps' and 'Symptoms' which we mocked

        // Let's rely on finding 'Steps' and 'Symptoms' which we mocked
        expect(screen.getAllByText(/Steps/i)).toHaveLength(3); // One in Lag0, One in Lag1, One in Safe Zone
        expect(screen.getAllByText(/Symptoms/i)).toHaveLength(3);
    });

    test('renders threshold advice', () => {
        render(<InsightsCards correlations={[]} thresholds={mockThresholds} />);
        // Should see text matching our mocked threshold_desc
        expect(screen.getByText('Keep Steps below 3,000 to avoid Symptoms')).toBeInTheDocument();
    });

    test('renders formatted description for correlations', () => {
        render(<InsightsCards correlations={[mockCorrelations[0]]} thresholds={[]} />);

        // "⚠️ Keep Steps around 5,000 → Increases Symptoms by 50% (from 2 to 8)"
        // Note: isGood=false -> ⚠️
        // coefficient > 0 -> Increases

        // Check parts
        expect(screen.getByText(/Keep Steps around 5,000/i)).toBeInTheDocument();
        expect(screen.getByText(/Increases Symptoms by 50%/i)).toBeInTheDocument();
    });
});
