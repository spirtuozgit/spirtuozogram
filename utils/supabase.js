import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wvbsnjzmycwoamjartkm.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2YnNuanpteWN3b2FtamFydGttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2MTAzNTAsImV4cCI6MjA3NTE4NjM1MH0.AVQzhtDfpZLBmk0NlR1fVuGhdoLhkhM3l2_IBLaVU5M";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
