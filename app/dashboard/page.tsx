import { Database } from '@/types/database.types'
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
    const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('exertion_preference')
        .eq('id', user.id)
        .single()

    if (profileError) {
        console.error("Error fetching profile:", profileError)
    }

    // Default to null if error or missing (triggers modal)
    const profile = profileData as Database['public']['Tables']['profiles']['Row'] | null
    const preference = profileError ? null : profile?.exertion_preference ?? null

    // 1. Fetch ALL Data (Server-Side)
    const { data: rawData, error } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true })

    if (error) {
        console.error("Error fetching data:", error)
    }

    // 2. Pass Raw Data to Client (Client will handle scoring & filtering)
    return (
        <div className="container mx-auto p-4 space-y-8">
            <ExertionPreferenceModal currentPreference={preference} />
            <DashboardClient
                data={rawData || []}
                exertionPreference={preference}
            />
        </div>
    )
}
