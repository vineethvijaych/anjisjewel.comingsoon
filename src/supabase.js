import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://dykwmbvftulelqfnvvgt.supabase.co";
const supabaseAnonKey = "sb_publishable_TfxAEWA5Ut17OEtu5gfxvw_vMZwX9aC";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
