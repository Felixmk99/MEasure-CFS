import { createClient } from '@/lib/supabase/server'
import InsightsClient from './insights-client'
import { redirect } from 'next/navigation'

export default async function InsightsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch All Health Data for Deep Analysis
    const { data: healthMetrics, error } = await supabase
        .from('health_metrics')
        .select('date, hrv, resting_heart_rate, step_count, symptom_score, exertion_score, custom_metrics')
        .eq('user_id', user.id)
        .order('date', { ascending: true })

    if (error) {
        console.error('Failed to fetch health metrics for insights:', error)
        // Fallback to empty array to prevent crash
    }

    // Fetch User Profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('exertion_preference')
        .eq('id', user.id)
        .single()

    if (profileError) {
        console.error('Failed to fetch user profile:', profileError)
    }

    return (
        <div className="container mx-auto py-8">
            <InsightsClient
                data={healthMetrics || []}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                exertionPreference={(profile as any)?.exertion_preference}
            />
        </div>
    )
}
