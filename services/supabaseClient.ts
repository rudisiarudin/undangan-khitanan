import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gkiizoxyfxnstrhpfrok.supabase.co';
const supabaseKey = 'sb_secret_MKfeU_b0jT2zCLKkNhLffw_CNE2t-IY';

export const supabase = createClient(supabaseUrl, supabaseKey);