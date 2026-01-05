import React from 'react';
import { render, screen } from '@testing-library/react';
import InsightsClient from '@/app/insights/insights-client';
import '@testing-library/jest-dom';

// Mock Providers
jest.mock('@/components/providers/language-provider', () => ({
    useLanguage: () => ({
        t: (key: string, params?: any) => {
            if (key === 'insights.gathering.progress') return `Progress: ${params?.count}`;
            return key;
        },
    }),
}));

jest.mock('@/components/providers/user-provider', () => ({
    useUser: () => ({
        profile: { exertion_preference: 'desirable' },
    }),
}));

// Mock Child Components to avoid Recharts/Complex rendering issues in JSDOM
jest.mock('@/app/insights/_components/correlation-matrix', () => ({
    CorrelationMatrix: () => <div data-testid="correlation-matrix">Correlation Matrix</div>
}));

jest.mock('@/app/insights/_components/insights-cards', () => ({
    InsightsCards: () => <div data-testid="insights-cards">Insights Cards</div>
}));

// Mock Logic if needed, but we want to test integration with logic mostly
// We rely on actual logic from insights-logic.ts which is pure JS.

describe('InsightsClient', () => {
    test('renders empty state when no data provided', () => {
        render(<InsightsClient data={[]} />);
        expect(screen.getByText('insights.empty.title')).toBeInTheDocument();
        expect(screen.getByText('insights.empty.button')).toBeInTheDocument();
    });

    test('renders gathering state when insufficient data (< 7 days)', () => {
        const smallData = Array(3).fill({ date: '2024-01-01' });
        render(<InsightsClient data={smallData} />);
        expect(screen.getByText('insights.gathering.title')).toBeInTheDocument();
        expect(screen.getByText('Progress: 3')).toBeInTheDocument();
    });

    test('renders content when sufficient data is provided', () => {
        // Create 10 days of dummy data
        const sufficientData = Array.from({ length: 10 }, (_, i) => ({
            date: `2024-01-${String(i + 1).padStart(2, '0')}`,
            step_count: 1000 + (i * 100),
            symptom_score: 5,
            hrv: 50,
            resting_heart_rate: 60,
            custom_metrics: {}
        }));

        render(<InsightsClient data={sufficientData} />);

        // Headers should be present
        expect(screen.getByText('insights.hero.title')).toBeInTheDocument();
        // Child components should be rendered
        expect(screen.getByTestId('correlation-matrix')).toBeInTheDocument();
        expect(screen.getByTestId('insights-cards')).toBeInTheDocument();
    });
});
