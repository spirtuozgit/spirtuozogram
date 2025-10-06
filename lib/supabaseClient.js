import { createClient } from "@supabase/supabase-js";

// 🔗 Настройки твоего проекта Supabase
const SUPABASE_URL = "https://wvbsnjzmycwoamjartkm.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2YnNuanpteWN3b2FtamFydGttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2MTAzNTAsImV4cCI6MjA3NTE4NjM1MH0.AVQzhtDfpZLBmk0NlR1fVuGhdoLhkhM3l2_IBLaVU5M";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
