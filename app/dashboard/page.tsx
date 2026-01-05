import { createClient } from '@/lib/supabase/server'
import DashboardClient from './dashboard-client'
import { redirect } from 'next/navigation'

import { ExertionPreferenceModal } from '@/components/modals/exertion-preference-modal'

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/auth/login')
    }

    // Fetch User Profile for Exertion Preference
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('exertion_preference')
        .eq('id', user.id)
        .single()

    if (profileError) {
        console.error("Error fetching profile:", profileError)
    }

    // 1. Fetch ALL Data (Server-Side)
    const { data: rawData, error } = await supabase
        .from('daily_metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true })

    if (error) {
        console.error("Error fetching data:", error)
    }

    // 2. Pass Raw Data to Client (Client will handle scoring & filtering)
    return (
        <div className="container mx-auto p-4 space-y-8">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <ExertionPreferenceModal currentPreference={(profile as any)?.exertion_preference} />
            <DashboardClient
                data={rawData || []}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                exertionPreference={(profile as any)?.exertion_preference}
            />
        </div>
    )
}
