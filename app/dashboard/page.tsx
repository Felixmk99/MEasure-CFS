import { createClient } from '@/lib/supabase/server'
import DashboardClient from './dashboard-client'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch Health Data (Check existence first)
    const { count, error } = await supabase
        .from('health_metrics')
        .select('*', { count: 'exact', head: true }) // efficient count
        .eq('user_id', user.id)

    if (!error && count === 0) {
        redirect('/upload')
    }

    // If data exists, fetch it for the chart
    const { data: healthMetrics } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true })

    return (
        <div className="container mx-auto py-6">
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* We pass data to the client component for interactivity */}
                <DashboardClient data={healthMetrics || []} />
            </div>
        </div>
    )
}
