import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DataManagementClient from "./data-client";

export default async function DataPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // 1. Fetch Summary & Count
    // Fetch Count
    const { count } = await supabase
        .from('health_metrics')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

    const hasData = (count || 0) > 0

    // 2. Fetch Recent Logs (for the table)
    // Only if hasData to save resources
    let recentLogs: any[] = []
    if (hasData) {
        const { data } = await supabase
            .from('health_metrics')
            .select('id, date, hrv, resting_heart_rate, step_count, custom_metrics, exertion_score, symptom_score, created_at')
            .eq('user_id', user.id)
            .order('date', { ascending: false })
            .limit(500)

        recentLogs = data || []
    }

    // 3. Check for steps specifically
    const hasSteps = recentLogs.some(log => log.step_count !== null && log.step_count !== undefined)

    return (
        <div className="container mx-auto py-6">
            <DataManagementClient initialData={recentLogs} hasData={hasData} hasSteps={hasSteps} />
        </div>
    )
}

