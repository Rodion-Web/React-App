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
        throw error;
      }

      // Группируем задачи по дате
      const tasksByDate = {};
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

  // Синхронизировать локальные задачи с сервером
  static async syncTasks(userEmail, localTasks) {
    try {
      // Получаем задачи с сервера
      const serverTasks = await this.getUserTasks(userEmail);

      // Сравниваем и синхронизируем
      const mergedTasks = { ...serverTasks };

      Object.keys(localTasks).forEach((dateKey) => {
        if (!mergedTasks[dateKey]) {
          mergedTasks[dateKey] = [];
        }

        localTasks[dateKey].forEach((localTask) => {
          const existingTask = mergedTasks[dateKey].find(
            (task) =>
              task.text === localTask.text &&
              task.createdAt === localTask.createdAt
          );

          if (!existingTask) {
            mergedTasks[dateKey].push(localTask);
          }
        });
      });

      return mergedTasks;
    } catch (error) {
      console.error("Failed to sync tasks:", error);
      return localTasks;
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
}
