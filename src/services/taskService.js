import { supabase } from "../config/supabase";

export class TaskService {
  // Получить все задачи пользователя
  static async getUserTasks(userEmail) {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_email", userEmail)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching tasks:", error);
        // Если таблица не существует, возвращаем пустой объект
        if (error.code === "42P01") {
          // Table doesn't exist
          console.log("Tasks table does not exist yet");
          return {};
        }
        throw error;
      }

      // Группируем задачи по дате
      const tasksByDate = {};
      if (data && Array.isArray(data)) {
        data.forEach((task) => {
          const dateKey = task.date;
          if (!tasksByDate[dateKey]) {
            tasksByDate[dateKey] = [];
          }
          tasksByDate[dateKey].push({
            id: task.id,
            text: task.text,
            priority: task.priority,
            completed: task.completed,
            createdAt: task.created_at,
          });
        });
      }

      return tasksByDate;
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      return {};
    }
  }

  // Добавить новую задачу
  static async addTask(userEmail, date, task) {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert([
          {
            user_email: userEmail,
            date: date,
            text: task.text,
            priority: task.priority,
            completed: task.completed,
            created_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) {
        console.error("Error adding task:", error);
        throw error;
      }

      return data[0];
    } catch (error) {
      console.error("Failed to add task:", error);
      throw error;
    }
  }

  // Обновить задачу
  static async updateTask(taskId, updates) {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", taskId)
        .select();

      if (error) {
        console.error("Error updating task:", error);
        throw error;
      }

      return data[0];
    } catch (error) {
      console.error("Failed to update task:", error);
      throw error;
    }
  }

  // Удалить задачу
  static async deleteTask(taskId) {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);

      if (error) {
        console.error("Error deleting task:", error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error("Failed to delete task:", error);
      throw error;
    }
  }

  // Проверить статус синхронизации
  static async checkSyncStatus(userEmail) {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("updated_at")
        .eq("user_email", userEmail)
        .order("updated_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error checking sync status:", error);
        return null;
      }

      return data[0]?.updated_at || null;
    } catch (error) {
      console.error("Failed to check sync status:", error);
      return null;
    }
  }

  // Проверить подключение к базе данных
  static async testConnection() {
    try {
      const { error } = await supabase.from("tasks").select("count").limit(1);

      if (error) {
        console.log("Database connection test failed:", error.message);
        return false;
      }

      console.log("Database connection successful");
      return true;
    } catch (error) {
      console.log("Database connection test failed:", error.message);
      return false;
    }
  }
}
