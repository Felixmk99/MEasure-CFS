import { createClient } from '@/lib/supabase/server'
import DashboardPage from '@/app/dashboard/page'

// Mock dependencies
jest.mock('next/navigation', () => ({
    redirect: jest.fn()
}))

jest.mock('@/lib/supabase/server', () => ({
    createClient: jest.fn()
}))

// Mock Sub-Components with Display Names
jest.mock('@/app/dashboard/dashboard-client', () => {
    const MockDashboardClient = () => <div data-testid="dashboard-client" />
    MockDashboardClient.displayName = 'MockDashboardClient'
    return MockDashboardClient
})

jest.mock('@/components/modals/exertion-preference-modal', () => ({
    ExertionPreferenceModal: Object.assign(
        () => <div data-testid="modal" />,
        { displayName: 'ExertionPreferenceModal' }
    )
}))

type MockSupabaseClient = {
    auth: { getUser: jest.Mock }
    from: jest.Mock
    select: jest.Mock
    eq: jest.Mock
    single: jest.Mock
    order: jest.Mock
}

describe('Critical Data Fetching Protections', () => {
    let mockSupabase: MockSupabaseClient

    beforeEach(() => {
        jest.clearAllMocks()

        mockSupabase = {
            auth: {
                getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } } })
            },
            from: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: { exertion_preference: 'desirable' }, error: null }),
            order: jest.fn().mockResolvedValue({ data: [], error: null })
        }

            ; (createClient as jest.Mock).mockResolvedValue(mockSupabase)
    })

    it('should query the correct table (health_metrics) and NOT daily_metrics', async () => {
        await DashboardPage()

        // 1. Verify Profile Fetch
        expect(mockSupabase.from).toHaveBeenCalledWith('profiles')

        // 2. Verify Data Fetch (THE CRITICAL CHECK)
        expect(mockSupabase.from).toHaveBeenCalledWith('health_metrics')
        expect(mockSupabase.from).not.toHaveBeenCalledWith('daily_metrics')
    })
})
