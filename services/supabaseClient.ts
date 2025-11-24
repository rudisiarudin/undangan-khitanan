import { createClient } from '@supabase/supabase-js';

// Mengambil konfigurasi dari Environment Variables (Vercel)
// Kami menyertakan fallback ke nilai hardcoded agar aplikasi tetap berjalan di preview saat ini.
// Di Vercel: Masukkan Key 'SUPABASE_URL' dan 'SUPABASE_KEY' di menu Settings > Environment Variables.

const supabaseUrl = process.env.SUPABASE_URL || 
                    process.env.REACT_APP_SUPABASE_URL || 
                    process.env.VITE_SUPABASE_URL || 
                    'https://gkiizoxyfxnstrhpfrok.supabase.co';

const supabaseKey = process.env.SUPABASE_KEY || 
                    process.env.REACT_APP_SUPABASE_KEY || 
                    process.env.VITE_SUPABASE_KEY || 
                    'sb_publishable_oRdZ9OqUOQNAX0DAi--9HA_0WxDoq8G';

export const supabase = createClient(supabaseUrl, supabaseKey);
