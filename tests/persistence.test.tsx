/** @jest-environment jsdom */
import React from 'react';
import { render, renderHook, act, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useUpload } from '../components/providers/upload-provider';
import OnboardingPage from '../app/onboarding/page';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '../components/providers/user-provider';

// Mock dependencies
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    usePathname: jest.fn(),
}));

jest.mock('../components/providers/user-provider', () => ({
    useUser: jest.fn(),
}));

jest.mock('../components/providers/upload-provider', () => ({
    ...jest.requireActual('../components/providers/upload-provider'),
    useUpload: jest.fn(),
}));

jest.mock('../lib/supabase/client', () => ({
    createClient: jest.fn().mockReturnValue({
        auth: {
            getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
            onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
        }
    }),
}));

// Mock localStorage
const localStorageMock = (function () {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value.toString(); },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; }
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock FileReader
class MockFileReader {
    onload: ((event: { target: { result: string | null } }) => void) | null = null;
    result: string = '';
    readAsText() {
        this.result = 'test content';
        setTimeout(() => {
            if (this.onload) this.onload({ target: { result: this.result } });
        }, 0);
    }
}
Object.defineProperty(window, 'FileReader', { value: MockFileReader });

describe('Persistence & Onboarding Logic', () => {
    let mockRouter: { push: jest.Mock; replace: jest.Mock; refresh: jest.Mock };
    let mockUser: { profile: null; updateSymptomProvider: jest.Mock; updateStepProvider: jest.Mock };

    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        (usePathname as jest.Mock).mockReturnValue('/onboarding');

        mockRouter = {
            push: jest.fn(),
            replace: jest.fn(),
            refresh: jest.fn(),
        };
        (useRouter as jest.Mock).mockReturnValue(mockRouter);

        mockUser = {
            profile: null,
            updateSymptomProvider: jest.fn().mockResolvedValue({}),
            updateStepProvider: jest.fn().mockResolvedValue({}),
        };
        (useUser as jest.Mock).mockReturnValue(mockUser);

        // Default useUpload mock
        (useUpload as jest.Mock).mockReturnValue({
            pendingUpload: null,
            setPendingUpload: jest.fn(),
            clearPendingUpload: jest.fn(),
        });
    });

    describe('UploadProvider Persistence', () => {
        it('should store file content in localStorage when setPendingUpload is called', async () => {
            // For this test we need the REAL provider logic, so we unmock useUpload specifically
            const { UploadProvider: RealUploadProvider, useUpload: RealUseUpload } = jest.requireActual('../components/providers/upload-provider');

            const wrapper = ({ children }: { children: React.ReactNode }) => (
                <RealUploadProvider>{children} </RealUploadProvider>
            );
            const { result } = renderHook(() => RealUseUpload(), { wrapper });

            const file = new File(['test content'], 'test.csv', { type: 'text/csv' });

            await act(async () => {
                result.current.setPendingUpload({ file, type: 'visible' });
            });

            // Wait for FileReader async simulation
            await waitFor(() => {
                expect(localStorage.getItem('pending_upload')).not.toBeNull();
            });

            const stored = JSON.parse(localStorage.getItem('pending_upload') || '{}');
            expect(stored.name).toBe('test.csv');
            expect(stored.type).toBe('visible');
            expect(stored.content).toBe('test content');
        });

        it('should restore pending upload from localStorage on mount', async () => {
            localStorage.setItem('pending_upload', JSON.stringify({
                name: 'restored.csv',
                type: 'bearable',
                content: 'restored content'
            }));

            const { UploadProvider: RealUploadProvider, useUpload: RealUseUpload } = jest.requireActual('../components/providers/upload-provider');

            const wrapper = ({ children }: { children: React.ReactNode }) => (
                <RealUploadProvider>{children} </RealUploadProvider>
            );
            const { result } = renderHook(() => RealUseUpload(), { wrapper });

            await waitFor(() => {
                expect(result.current.pendingUpload).not.toBeNull();
                expect(result.current.pendingUpload?.file.name).toBe('restored.csv');
                expect(result.current.pendingUpload?.type).toBe('bearable');
            });
        });
    });

    describe('Onboarding Skip Logic', () => {
        it('should auto-configure and redirect to /upload if pendingUpload is Bearable', async () => {
            (useUpload as jest.Mock).mockReturnValue({
                pendingUpload: { file: new File([], 'b.csv'), type: 'bearable' }
            });

            render(<OnboardingPage />);

            await waitFor(() => {
                expect(mockUser.updateSymptomProvider).toHaveBeenCalledWith('bearable');
                expect(mockUser.updateStepProvider).toHaveBeenCalledWith('apple');
                expect(mockRouter.replace).toHaveBeenCalledWith('/upload');
            });
        });

        it('should jump to Step 2 if pendingUpload is Visible', async () => {
            (useUpload as jest.Mock).mockReturnValue({
                pendingUpload: { file: new File([], 'v.csv'), type: 'visible' }
            });

            render(<OnboardingPage />);

            // Step 2 features "Choose your Step Provider"
            await waitFor(() => {
                expect(screen.getByText(/Step Provider/i)).toBeInTheDocument();
                // Check that its not step 1
                expect(screen.queryByText(/Symptom Tracking?/i)).not.toBeInTheDocument();
            });
        });
    });
});
