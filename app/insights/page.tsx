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
    const { data: healthMetrics } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true })

    return (
        <div className="container mx-auto py-8">
            <InsightsClient data={healthMetrics || []} />
        </div>
    )
}
