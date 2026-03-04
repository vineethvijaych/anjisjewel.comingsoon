import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gbhedrawnqyqmlerisfd.supabase.co";
const supabaseAnonKey = "sb_publishable_GLNJlIK-VHcr0WseD5lPuA_5Lz5MlWp";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);