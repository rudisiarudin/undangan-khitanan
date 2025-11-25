import { createClient } from '@supabase/supabase-js';

// Prioritaskan variabel environment dengan prefix NEXT_PUBLIC_ agar terbaca di browser.
// Fallback menggunakan nilai hardcoded yang Anda berikan.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 
                    process.env.REACT_APP_SUPABASE_URL || 
                    'https://gkiizoxyfxnstrhpfrok.supabase.co';

const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
                    process.env.REACT_APP_SUPABASE_KEY || 
                    'sb_publishable_oRdZ9OqUOQNAX0DAi--9HA_0WxDoq8G';

export const supabase = createClient(supabaseUrl, supabaseKey);