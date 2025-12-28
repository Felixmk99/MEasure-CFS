import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ExperimentsClient from "./experiments-client";

export default async function ExperimentsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // 1. Check if user has uploaded data
    const { count, error } = await supabase
        .from('health_metrics')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

    if (!error && count === 0) {
        redirect('/upload');
    }

    // 2. Fetch Experiments
    const { data: experiments } = await supabase
        .from('experiments')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false });

    // 3. Fetch Health Metrics for Analysis (Last 180 days)
    const { data: history } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

    return (
        <ExperimentsClient
            initialExperiments={experiments || []}
            history={history || []}
        />
    );
}
