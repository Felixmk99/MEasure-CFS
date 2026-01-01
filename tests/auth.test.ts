/* eslint-disable @typescript-eslint/no-explicit-any */
import { middleware } from '../middleware';
import { GET as authCallback } from '../app/auth/callback/route';
import { NextResponse, NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Mock Next.js Server components
jest.mock('next/server', () => ({
    NextResponse: {
        next: jest.fn().mockReturnValue({ cookies: { set: jest.fn() } }),
        redirect: jest.fn().mockImplementation((url) => ({ url, cookies: { set: jest.fn() } })),
    },
}));

jest.mock('@supabase/ssr', () => ({
    createServerClient: jest.fn(),
}));

jest.mock('next/headers', () => ({
    cookies: jest.fn().mockImplementation(() => ({
        getAll: jest.fn().mockReturnValue([]),
        set: jest.fn(),
    })),
}));

describe('Auth & Routing Logic', () => {
    let mockSupabase: any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockSupabase = {
            auth: {
                getUser: jest.fn(),
                exchangeCodeForSession: jest.fn(),
            },
            from: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn(),
        };
        (createServerClient as jest.Mock).mockReturnValue(mockSupabase);

        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
    });

    describe('Middleware Guarding', () => {
        const createRequest = (path: string, searchParams: string = '') => {
            const url = `https://measure-cfs.com${path}${searchParams}`;
            return {
                nextUrl: new URL(url),
                url,
                cookies: { getAll: () => [] },
                headers: new Headers(),
            } as unknown as NextRequest;
        };

        it('should redirect root with code to /auth/callback', async () => {
            const req = createRequest('/', '?code=123');
            await middleware(req);
            expect(NextResponse.redirect).toHaveBeenCalledWith(
                expect.objectContaining({ pathname: '/auth/callback' })
            );
        });

        it('should redirect /dashboard to /login if no user session', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
            const req = createRequest('/dashboard');
            await middleware(req);
            expect(NextResponse.redirect).toHaveBeenCalledWith(
                expect.objectContaining({ pathname: '/login' })
            );
        });

        it('CRITICAL: should NOT call getUser on /auth/callback path', async () => {
            const req = createRequest('/auth/callback', '?code=123');
            await middleware(req);
            // This is the key fix for the otp_expired bug
            expect(mockSupabase.auth.getUser).not.toHaveBeenCalled();
        });

        it('should redirect /login to /dashboard if user is already logged in', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: '123' } } });
            const req = createRequest('/login');
            await middleware(req);
            expect(NextResponse.redirect).toHaveBeenCalledWith(
                expect.objectContaining({ pathname: '/dashboard' })
            );
        });
    });

    describe('Auth Callback Route', () => {
        const createCallbackRequest = (params: string = '?code=123') => {
            return new Request(`https://measure-cfs.com/auth/callback${params}`);
        };

        it('should redirect to /onboarding if profile is missing step/symptom providers', async () => {
            mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
                data: { user: { id: 'user_123' } },
                error: null
            });
            mockSupabase.single.mockResolvedValue({
                data: { symptom_provider: null, step_provider: 'apple' }
            });

            const req = createCallbackRequest();
            const res: any = await authCallback(req);

            expect(res.url).toContain('/onboarding');
        });

        it('should redirect to /dashboard if profile is complete', async () => {
            mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
                data: { user: { id: 'user_123' } },
                error: null
            });
            mockSupabase.single.mockResolvedValue({
                data: { symptom_provider: 'visible', step_provider: 'apple' }
            });

            const req = createCallbackRequest();
            const res: any = await authCallback(req);

            expect(res.url).toContain('/dashboard');
        });

        it('should redirect to auth-code-error on session exchange failure', async () => {
            mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
                data: { user: null },
                error: { code: 'otp_expired', message: 'Expired' }
            });

            const req = createCallbackRequest();
            const res: any = await authCallback(req);

            expect(res.url).toContain('/auth/auth-code-error');
        });
    });
});
