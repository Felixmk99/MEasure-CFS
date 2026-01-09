/** @jest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExperimentsClient from '../app/experiments/experiments-client';
import { LanguageProvider } from '../components/providers/language-provider';

// -- Mocks --

// Mock Lucide Icons (to prevent rendering issues and snapshot noise)
jest.mock('lucide-react', () => ({
    Plus: () => <div data-testid="icon-plus" />,
    Trash: () => <div data-testid="icon-trash" />,
    Pill: () => <div data-testid="icon-pill" />,
    Activity: () => <div data-testid="icon-activity" />,
    Moon: () => <div data-testid="icon-moon" />,
    ArrowUpRight: () => <div data-testid="icon-arrow-up-right" />,
    ArrowDownRight: () => <div data-testid="icon-arrow-down-right" />,
    Minus: () => <div data-testid="icon-minus" />,
    Pencil: () => <div data-testid="icon-pencil" />,
    Beaker: () => <div data-testid="icon-beaker" />,
    Target: () => <div data-testid="icon-target" />,
    X: () => <div data-testid="icon-x" />,
    Filter: () => <div data-testid="icon-filter" />,
    Info: () => <div data-testid="icon-info" />,
    Heart: () => <div data-testid="icon-heart" />,
    TrendingUp: () => <div data-testid="icon-trending-up" />,
    TrendingDown: () => <div data-testid="icon-trending-down" />,
}));

// Mock Next.js Navigation
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        refresh: jest.fn(),
    }),
}));

// Mock UI Components to avoid Radix/Primitive errors
jest.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick, className }: any) => <button onClick={onClick} className={className}>{children}</button>,
}));
jest.mock('@/components/ui/card', () => ({
    Card: ({ children, className }: any) => <div className={className}>{children}</div>,
    CardContent: ({ children, className }: any) => <div className={className}>{children}</div>,
}));
jest.mock('@/components/ui/badge', () => ({
    Badge: ({ children, className }: any) => <span className={className}>{children}</span>,
}));
jest.mock('@/components/ui/progress', () => ({
    Progress: ({ value, className }: any) => <div role="progressbar" aria-valuenow={value} className={className} />,
}));
jest.mock('@/components/ui/dialog', () => ({
    Dialog: ({ children }: any) => <div>{children}</div>,
    DialogContent: ({ children }: any) => <div>{children}</div>,
    DialogTrigger: ({ children }: any) => <div>{children}</div>,
    DialogHeader: ({ children }: any) => <div>{children}</div>,
    DialogTitle: ({ children }: any) => <div>{children}</div>,
    DialogDescription: ({ children }: any) => <div>{children}</div>,
    DialogFooter: ({ children }: any) => <div>{children}</div>,
}));

// Mock Select with Context to allow interaction
jest.mock('@/components/ui/select', () => {
    const React = require('react');
    const SelectContext = React.createContext({ onValueChange: (v: string) => { } });

    return {
        Select: ({ children, onValueChange, value }: any) => (
            <SelectContext.Provider value={{ onValueChange }}>
                <div data-testid="select-root" data-value={value}>{children}</div>
            </SelectContext.Provider>
        ),
        SelectTrigger: ({ children }: any) => <div data-testid="select-trigger">{children}</div>,
        SelectValue: ({ placeholder }: any) => <span data-testid="select-value">{placeholder}</span>,
        SelectContent: ({ children }: any) => <div data-testid="select-content">{children}</div>,
        SelectItem: ({ children, value }: any) => (
            <SelectContext.Consumer>
                {({ onValueChange }: any) => (
                    <div
                        role="option"
                        data-testid="select-item"
                        onClick={() => onValueChange(value)}
                    >
                        {children}
                    </div>
                )}
            </SelectContext.Consumer>
        ),
    };
});

// Mock Supabase Code
const mockSupabase = {
    auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user' } } }),
    },
    from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: {}, error: null }),
    })),
};

jest.mock('@/lib/supabase/client', () => ({
    createClient: () => mockSupabase,
}));

// Mock User Provider
jest.mock('@/components/providers/user-provider', () => ({
    useUser: () => ({
        profile: { exertion_preference: 'desirable' },
    }),
}));

// Mock Metric Translation Helper to match our recent changes
jest.mock('@/lib/i18n/helpers', () => ({
    useMetricTranslation: () => (key: string) => {
        // Imitate the logic we implemented:
        if (key === 'adjusted_score') return 'MEasure-CFS Score'; // Crucial check
        if (key === 'symptom_score') return 'Symptom Score';
        if (key === 'composite_score') return 'Symptom Score'; // Legacy safe-guard/alias check
        if (key === 'step_count') return 'Steps';
        return key;
    },
}));

// Mock Experiment Analysis Logic
// We mock this to control the "impacts" shown in the cards
jest.mock('@/lib/statistics/experiment-analysis', () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    analyzeExperiments: jest.fn((experiments: any[], history: any[]) => {
        return experiments.map(exp => ({
            experimentId: exp.id,
            impacts: [
                // Mock a significant impact for filter testing
                {
                    metric: 'step_count',
                    percentChange: 10,
                    pValue: 0.01,
                    significance: 'positive',
                    effectSize: 'large',
                    confidence: 0.95,
                    zScoreShift: 1.5,
                    df: 20
                },
                {
                    metric: 'composite_score', // Duplicate Label Test
                    percentChange: -5,
                    pValue: 0.10,
                    significance: 'neutral',
                    effectSize: 'small',
                    confidence: 0.50,
                    zScoreShift: -0.5,
                    df: 20
                },
                {
                    metric: 'symptom_score', // Duplicate Label Test
                    percentChange: -5,
                    pValue: 0.10,
                    significance: 'neutral',
                    effectSize: 'small',
                    confidence: 0.50,
                    zScoreShift: -0.5,
                    df: 20
                }
            ]
        }));
    }),
}));

// Mock Tooltip (it requires provider which might not be set up correctly in raw render)
jest.mock('@/components/ui/tooltip', () => ({
    TooltipProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    TooltipTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip-trigger">{children}</div>,
    TooltipContent: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip-content">{children}</div>,
}));


const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <LanguageProvider initialLocale="en">{children}</LanguageProvider>
);

describe('ExperimentsClient', () => {
    // -- Fixtures --
    const activeExperiment = {
        id: '1',
        name: 'Active Test Experiment',
        category: 'medication',
        start_date: '2026-01-01',
        end_date: null, // Active
        user_id: 'test-user',
        dosage: '10mg'
    };

    const pastExperiment = {
        id: '2',
        name: 'Past Test Experiment',
        category: 'lifestyle',
        start_date: '2025-12-01',
        end_date: '2025-12-31', // Past
        user_id: 'test-user',
        dosage: 'Daily'
    };

    const initialExperiments = [activeExperiment, pastExperiment];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const history: any[] = []; // Empty history is fine as we mocked analyzeExperiments

    it('renders active and past experiments correctly', () => {
        render(
            <ExperimentsClient
                initialExperiments={initialExperiments}
                history={history}
            />,
            { wrapper: Wrapper }
        );

        // Check for Active Experiment
        expect(screen.getByText('Active Test Experiment')).toBeInTheDocument();
        // Check for "Started" text presence (approximate match due to formatting)
        expect(screen.getByText(/Started/i)).toBeInTheDocument();

        // Check for Past Experiment
        expect(screen.getByText('Past Test Experiment')).toBeInTheDocument();
    });

    it('displays correct metric names using the translation hook', async () => {
        render(
            <ExperimentsClient
                initialExperiments={initialExperiments}
                history={history}
            />,
            { wrapper: Wrapper }
        );

        // We expect "Steps" (from ‘step_count’) to be visible in the Impact Card (mocked analysis)
        // because analyzeExperiments returns a step_count impact.
        // And our mock mockMetricTranslation returns "Steps" for "step_count".
        await waitFor(() => {
            const stepsLabels = screen.getAllByText('Steps');
            expect(stepsLabels.length).toBeGreaterThan(0);
        });
    });

    it('correctly formats the "Started at" date', () => {
        render(
            <ExperimentsClient
                initialExperiments={[activeExperiment]}
                history={history}
            />,
            { wrapper: Wrapper }
        );

        // "2026-01-01" should format to "January 1, 2026" (or similar depending on locale, mock en)
        // The helper formats using date-fns format(d, 'MMMM d, yyyy') usually
        // Let's just check for the year and month to be safe
        expect(screen.getByText(/January 1, 2026/)).toBeInTheDocument();
    });

    it('dropdown filter shows correct metric names to avoid duplicates', async () => {
        render(
            <ExperimentsClient
                initialExperiments={initialExperiments}
                history={history}
            />,
            { wrapper: Wrapper }
        );

        // Open the filter dropdown
        // The placeholder text "Select a tracker ..." should be the trigger
        // There might be multiple selects (e.g. in hidden dialogs), so we find the one with the placeholder
        const triggers = screen.getAllByTestId('select-trigger');
        const trigger = triggers.find(t => t.textContent?.includes('Select a tracker')) || triggers[0];

        if (!trigger) throw new Error('Filter trigger not found');
        fireEvent.click(trigger); // Should open content 

        // We need to check if the options are rendered.
        // Ideally we need to feed "availableMetrics" logic.
        // However, ExperimentsClient calculates availableMetrics from `analyzeExperiments` result + history.
        // Our mock `analyzeExperiments` returns 'step_count' and 'fatigue'.

        // Wait for dropdown content
        const selectRoot = trigger.closest('[data-testid="select-root"]');
        if (!selectRoot) throw new Error('Select root not found');

        // Scope search to this specific select's content
        // We know our mock renders content as sibling
        const content = within(selectRoot as HTMLElement).getByTestId('select-content');

        await waitFor(() => {
            expect(within(content).getByText('Steps')).toBeInTheDocument();
            // We expect "Symptom Score" to be present, but uniquely handled.
            // If duplication occurs, getByText throws "Found multiple elements".
            // So getting it once successfully implies no duplicates (or we picked the first one if we filtered).
            expect(within(content).getByText('Symptom Score')).toBeInTheDocument();
        });
    });
});
