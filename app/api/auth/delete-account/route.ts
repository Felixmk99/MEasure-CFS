
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
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

        // Delete the user from Auth
        const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id)

        if (error) {
            console.error('Error deleting user:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Unexpected error in delete-account:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
