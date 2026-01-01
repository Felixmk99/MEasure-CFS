
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function DELETE(_request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check for Service Role Key
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (!serviceRoleKey) {
            console.error('SUPABASE_SERVICE_ROLE_KEY is not defined')
            return NextResponse.json({
                error: 'Server misconfiguration: Missing Service Role Key. Account data cleared but account remains active.'
            }, { status: 500 })
        }

        // Create Admin Client
        const supabaseAdmin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceRoleKey,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        // 1. Secure Data Wipe (Bypass RLS)
        // We manually delete related data to ensure no orphans remain, 
        // even if CASCADE is not configured in the DB.
        const { error: metricsError } = await supabaseAdmin
            .from('health_metrics')
            .delete()
            .eq('user_id', user.id)

        if (metricsError) {
            console.error('Error deleting health_metrics:', metricsError)
            // We continue to try to delete the account even if data wipe fails partially? 
            // Ideally we want to be clean. Let's log and proceed or fail?
            // "Account deletion actually works" -> blocking on data might prevent deletion.
            // But "Secure deletion" implies data IS gone.
            // Let's return error to be safe.
            return NextResponse.json({ error: 'Failed to wipe health data. Account not deleted.' }, { status: 500 })
        }

        const { error: expError } = await supabaseAdmin
            .from('experiments')
            .delete()
            .eq('user_id', user.id)

        if (expError) {
            console.error('Error deleting experiments:', expError)
            return NextResponse.json({ error: 'Failed to wipe experiments. Account not deleted.' }, { status: 500 })
        }

        // 2. Delete the user from Auth
        const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id)

        if (error) {
            console.error('Error deleting user:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error: unknown) {
        console.error('Unexpected error in delete-account:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
