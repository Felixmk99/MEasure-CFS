/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function checkConnection() {
    console.log('🔍 Checking Supabase Connection...');

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        console.error('❌ Missing URL or Key in .env.local');
        return;
    }

    console.log(`   URL: ${url}`);
    // Obfuscate key for log safety
    console.log(`   Key: ${key.substring(0, 10)}...`);

    const supabase = createClient(url, key);

    try {
        // 1. Check if we can reach the server (Auth check)
        // We try to sign in anonymously or just fetch session (which will be null but shouldn't throw network error)
        const { error: authError } = await supabase.auth.getSession();

        if (authError) {
            console.error('❌ Auth Service Unreachable:', authError.message);
        } else {
            console.log('✅ Auth Service Reachable');
        }

        // 2. Check Database Table access
        // We try to select 0 rows just to see if the table exists and we have permission
        // Note: If RLS is on and we are anon, we might get 0 rows back (success) or an error if table doesn't exist.
        const { error } = await supabase
            .from('health_metrics')
            .select('*', { count: 'exact', head: true });

        if (error) {
            // 404 means table not found (Schema issue)
            if (error.code === '42P01') {
                console.error('❌ Table "health_metrics" NOT FOUND. Did you run the schema.sql script?');
            } else if (error.code === 'PGRST301') {
                console.error('❌ RLS Error or Permission Denied. (This is expected if you are not logged in, but confirms DB is reachable).');
                console.log('   (Database connected, but you need to be logged in to read data - Good!)');
            } else {
                console.error('❌ Database Error:', error.message, error.code);
            }
        } else {
            console.log('✅ Database Reachable & Table Exists.');

            // Fetch recent data for inspection
            const { data: recent, error: dataError } = await supabase
                .from('health_metrics')
                .select('*')
                .order('date', { ascending: false })
                .limit(10);

            if (dataError) {
                console.error('❌ Data fetch error:', dataError.message);
            } else if (recent) {
                console.log('✅ Recent Data Sample (Descending):');
                recent.forEach(r => {
                    console.log(`   [${r.date}] HRV: ${r.hrv}, Steps: ${r.step_count}, Sym: ${r.symptom_score}`);
                });
            }
        }

    } catch (err) {
        console.error('❌ Unexpected System Error:', err);
    }
}

checkConnection();
