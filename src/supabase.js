import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://dykwmbvftulelqfnvvgt.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5a3dtYnZmdHVsZWxxZm52dmd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MzA0NTgsImV4cCI6MjA5NTEwNjQ1OH0.eUBdN3MrBqZwu4zXBnvALHm1u0KBfxp5hzZzokVeE0s";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
