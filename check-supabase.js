const { createClient } = require('@supabase/supabase-js');

// Manual config for diagnostic
const supabaseUrl = 'https://wlpkxbaormbmxykiudad.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndscGt4YmFvcm1ibXh5a2l1ZGFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyOTQ0NjEsImV4cCI6MjA4Nzg3MDQ2MX0.zgbNRgrnMNWpbQnFvAyVFK1cQgCordHT24ja_BG__8I';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
    console.log('--- Supabase Diagnostic ---');
    const tables = ['profiles', 'graphical_passwords', 'audio_passwords'];
    
    for (const table of tables) {
        process.stdout.write(`Checking ${table}... `);
        const { error } = await supabase.from(table).select('*').limit(1);
        
        if (error) {
            console.log(`\n  -> ERROR: ${error.message} (Code: ${error.code})`);
        } else {
            console.log('OK');
        }
    }
}

checkTables();
