import { NextRequest, NextResponse } from 'next/server';
import { sendSignupNotification } from '@/lib/notifications/email';

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');

        // Basic security: check for a secret token in the Authorization header
        // In Supabase, you can set this as a header in the webhook configuration:
        // Authorization: Bearer [YOUR_WEBHOOK_SECRET]
        if (authHeader !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await req.json();

        // Supabase Webhook payload structure:
        // { type: 'INSERT', table: 'profiles', record: { ... }, schema: 'public', ... }
        if (payload.type === 'INSERT' && payload.table === 'profiles') {
            const { id, step_provider } = payload.record;

            // We might want to fetch more user details from auth.users, 
            // but the webhook record only contains the profiles table data.
            // The signup process already puts first_name, last_name into raw_user_meta_data
            // which is eventually synced or available, but for now we'll notify with what we have.

            await sendSignupNotification({
                id,
                step_provider,
                // Optional: you could extend this by fetching from supabase-js if needed
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
