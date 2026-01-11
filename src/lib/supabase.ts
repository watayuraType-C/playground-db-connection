import { createClient } from '@supabase/supabase-js';

// .env.localから設定を読み込む
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Supabaseと通信するための「窓口」を作る
export const supabase = createClient(supabaseUrl, supabaseAnonKey);