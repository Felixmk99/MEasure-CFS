import { NextRequest, NextResponse } from 'next/server';
import { sendSignupNotification } from '@/lib/notifications/email';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        // Also check query params as a fallback because Supabase sometimes misconfigures them
        const authParam = req.nextUrl.searchParams.get('Authorization');

        const secret = process.env.WEBHOOK_SECRET;

        if (!authHeader?.includes(secret!) && !authParam?.includes(secret!)) {
            console.error('Unauthorized webhook attempt');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await req.json();
        console.log('Received webhook payload:', JSON.stringify(payload, null, 2));

        if (payload.type === 'INSERT' && payload.table === 'profiles') {
            const { id } = payload.record;

            // Initialize Supabase Admin client to fetch user details
            const supabaseAdmin = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!,
                {
                    auth: {
                        autoRefreshToken: false,
                        persistSession: false
                    }
                }
            );

            const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(id);

            if (userError || !user) {
                console.error('Error fetching user for notification:', userError);
            }

            // Extract metadata
            const metadata = user?.user_metadata || {};

            await sendSignupNotification({
                id,
                email: user?.email,
                first_name: metadata.first_name,
                last_name: metadata.last_name,
                step_provider: payload.record.step_provider || 'Not yet selected'
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
