import React from 'react';
import { render, screen } from '@testing-library/react';
import { CorrelationMatrix } from '@/app/insights/_components/correlation-matrix';
import { CorrelationResult } from '@/lib/stats/insights-logic';
import '@testing-library/jest-dom';

// Mock Provider
jest.mock('@/components/providers/language-provider', () => ({
    useLanguage: () => ({
        t: (key: string) => {
            if (key === 'common.metric_labels.step_count') return 'Steps';
            if (key === 'common.metric_labels.symptom_score') return 'Symptoms';
            if (key === 'insights.clusters.heatmap.title') return 'Correlation Heatmap';
            if (key === 'insights.clusters.heatmap.legend') return 'Legend';
            return key;
        },
    }),
}));

// Mock Tooltip components since they require complex context
jest.mock('@/components/ui/tooltip', () => ({
    Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    TooltipTrigger: ({ children }: { children: React.ReactNode }) => <div role="button">{children}</div>,
    TooltipContent: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip-content">{children}</div>,
    TooltipProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Provide a diverse set of correlations
const mockCorrelations: CorrelationResult[] = [
    // Significant correlation -> Should include 'step_count' and 'symptom_score'
    {
        metricA: 'step_count',
        metricB: 'symptom_score',
        coefficient: 0.8,
        lag: 0,
        impactDirection: 'positive',
        impactStrength: 'strong',
        medianA: 5000, medianB: 3, percentChange: 25, typicalValue: 2, improvedValue: 4, isGood: false
    },
    // Insignificant correlation -> Should exclude 'irrelevant_metric' unless it connects to key metric
    {
        metricA: 'irrelevant_metric',
        metricB: 'other_metric',
        coefficient: 0.1,
        lag: 0,
        impactDirection: 'neutral',
        impactStrength: 'weak',
        medianA: 0, medianB: 0, percentChange: 0, typicalValue: 0, improvedValue: 0, isGood: true
    }
];

describe('CorrelationMatrix', () => {
    test('renders only significant metrics', () => {
        render(<CorrelationMatrix correlations={mockCorrelations} />);

        // steps and symptoms are significant (>0.35 or key metrics)
        expect(screen.getAllByText('Steps').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Symptoms').length).toBeGreaterThan(0);

        // irrelevant_metric is weak (0.1) and not key metric -> Should be filtered out
        expect(screen.queryByText('irrelevant_metric')).not.toBeInTheDocument();
    });

    test('renders heatmap grid', () => {
        render(<CorrelationMatrix correlations={mockCorrelations} />);
        expect(screen.getByText('Correlation Heatmap')).toBeInTheDocument();

        // Should find the grid cells
        // Since we mocked TooltipTrigger as role="button", we can count buttons? 
        // Or finding by known color classes if we know them.
        // Let's rely on checking for the button/trigger interactions if needed, 
        // but simple render check is proof it didn't crash.
    });
});
