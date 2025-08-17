import { createClient } from "@supabase/supabase-js";

// Замените эти значения на ваши реальные данные от Supabase
const supabaseUrl = "YOUR_SUPABASE_URL";
const supabaseAnonKey = "YOUR_SUPABASE_ANON_KEY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Функция для проверки подключения
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("count")
      .limit(1);
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
