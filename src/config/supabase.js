import { createClient } from "@supabase/supabase-js";

// Замените эти значения на ваши реальные данные от Supabase
const supabaseUrl = "https://tembzvrateawciwzukra.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlbWJ6dnJhdGVhd2Npd3p1a3JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzOTUzMDMsImV4cCI6MjA3MDk3MTMwM30.TeN2tHF6I-JdIt7UytFY6z6PNCICczeHtphCWltwW-M";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Функция для проверки подключения
export const testConnection = async () => {
  try {
    const { error } = await supabase.from("tasks").select("count").limit(1);
    if (error) {
      console.error("Supabase connection error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Supabase connection test failed:", err);
    return false;
  }
};
