import React, { useState, useEffect } from "react";
import "./App.css";
import Calendar from "./components/Calendar";
import TaskModal from "./components/TaskModal";
import Auth from "./components/Auth";
import { TaskService } from "./services/taskService";

function App() {
  const [tasks, setTasks] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncStatus, setSyncStatus] = useState("local"); // local, cloud, error

  // Проверяем авторизацию при загрузке
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setIsAuthenticated(true);
      loadUserTasks(user.email);
    }
  }, []);

  // Загружаем задачи пользователя с синхронизацией
  const loadUserTasks = async (userEmail) => {
    try {
      setIsSyncing(true);

      // Сначала загружаем из localStorage для быстрого отображения
      const savedTasks = localStorage.getItem(`tasks_${userEmail}`);
      const localTasks = savedTasks ? JSON.parse(savedTasks) : {};

      if (Object.keys(localTasks).length > 0) {
        setTasks(localTasks);
      }

      // Затем пытаемся синхронизировать с сервером
      try {
        const serverTasks = await TaskService.getUserTasks(userEmail);

        if (serverTasks && Object.keys(serverTasks).length > 0) {
          setTasks(serverTasks);
          // Сохраняем синхронизированные задачи локально
          localStorage.setItem(
            `tasks_${userEmail}`,
            JSON.stringify(serverTasks)
          );
          setSyncStatus("cloud");
        } else if (Object.keys(localTasks).length > 0) {
          // Если на сервере нет задач, но есть локально - загружаем локальные
          setTasks(localTasks);
          setSyncStatus("local");
        }

        // Обновляем время последней синхронизации
        const syncStatusTime = await TaskService.checkSyncStatus(userEmail);
        setLastSyncTime(syncStatusTime);
      } catch (serverError) {
        console.log("Server sync failed, using local tasks:", serverError);
        // В случае ошибки сервера используем локальные задачи
        if (Object.keys(localTasks).length > 0) {
          setTasks(localTasks);
        }
        setSyncStatus("error");
      }
    } catch (error) {
      console.error("Failed to load tasks:", error);
      setSyncStatus("error");
    } finally {
      setIsSyncing(false);
    }
  };

  // Сохраняем задачи локально и на сервере
  const saveUserTasks = async (userEmail, tasksData) => {
    try {
      // Сохраняем локально для быстрого доступа
      localStorage.setItem(`tasks_${userEmail}`, JSON.stringify(tasksData));

      // Синхронизируем с сервером в фоне (без блокировки)
      syncTasksWithServer(userEmail, tasksData).catch((error) => {
        console.log("Background sync failed:", error);
        setSyncStatus("error");
      });
    } catch (error) {
      console.error("Failed to save tasks locally:", error);
    }
  };

  // Синхронизация с сервером
  const syncTasksWithServer = async (userEmail, tasksData) => {
    try {
      // Получаем текущие задачи с сервера
      const serverTasks = await TaskService.getUserTasks(userEmail);

      // Сравниваем и обновляем
      Object.keys(tasksData).forEach((dateKey) => {
        const localTasksForDate = tasksData[dateKey] || [];
        const serverTasksForDate = serverTasks[dateKey] || [];

        localTasksForDate.forEach((localTask) => {
          const serverTask = serverTasksForDate.find(
            (task) =>
              task.text === localTask.text &&
              task.createdAt === localTask.createdAt
          );

          if (!serverTask) {
            // Добавляем новую задачу на сервер
            TaskService.addTask(userEmail, dateKey, localTask).catch(
              (error) => {
                console.log("Failed to add task to server:", error);
              }
            );
          } else if (serverTask.completed !== localTask.completed) {
            // Обновляем статус выполнения
            TaskService.updateTask(serverTask.id, {
              completed: localTask.completed,
            }).catch((error) => {
              console.log("Failed to update task on server:", error);
            });
          }
        });
      });

      // Обновляем время синхронизации
      const syncStatusTime = await TaskService.checkSyncStatus(userEmail);
      setLastSyncTime(syncStatusTime);
      setSyncStatus("cloud");
    } catch (error) {
      console.error("Failed to sync with server:", error);
      setSyncStatus("error");
    }
  };

  // Сохраняем задачи в localStorage и на сервере при изменении
  useEffect(() => {
    if (currentUser && Object.keys(tasks).length > 0) {
      saveUserTasks(currentUser.email, tasks);
    }
  }, [tasks, currentUser]);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    loadUserTasks(user.email);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setTasks({});
    setSelectedDate(null);
    setIsModalOpen(false);
    setLastSyncTime(null);
    setSyncStatus("local");
  };

  const addTask = (date, task) => {
    const dateKey = date.toISOString().split("T")[0];
    setTasks((prev) => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), task],
    }));
  };

  const deleteTask = (date, taskIndex) => {
    const dateKey = date.toISOString().split("T")[0];
    setTasks((prev) => ({
      ...prev,
      [dateKey]: prev[dateKey].filter((_, index) => index !== taskIndex),
    }));
  };

  const toggleTask = (date, taskIndex) => {
    const dateKey = date.toISOString().split("T")[0];
    setTasks((prev) => ({
      ...prev,
      [dateKey]: prev[dateKey].map((task, index) =>
        index === taskIndex ? { ...task, completed: !task.completed } : task
      ),
    }));
  };

  const openTaskModal = (date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
  };

  const handleManualSync = async () => {
    if (currentUser) {
      await loadUserTasks(currentUser.email);
    }
  };

  // Если пользователь не авторизован, показываем форму входа
  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  // Получаем статус синхронизации для отображения
  const getSyncStatusText = () => {
    switch (syncStatus) {
      case "cloud":
        return "☁️ Облачная синхронизация";
      case "local":
        return "💾 Локальное сохранение";
      case "error":
        return "⚠️ Ошибка синхронизации";
      default:
        return "🔄 Проверка статуса";
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1>Календарь задач</h1>
          <div className="user-section">
            <div className="user-info">
              <span className="welcome-text">
                Добро пожаловать, {currentUser.email}
              </span>
              <div className="sync-info">
                {isSyncing ? (
                  <span className="sync-status syncing">Синхронизация...</span>
                ) : (
                  <span className="sync-status">
                    {lastSyncTime
                      ? `Обновлено: ${new Date(lastSyncTime).toLocaleString(
                          "ru-RU"
                        )}`
                      : getSyncStatusText()}
                  </span>
                )}
                <button
                  onClick={handleManualSync}
                  className="sync-button"
                  disabled={isSyncing}
                  title="Обновить синхронизацию"
                >
                  🔄
                </button>
              </div>
            </div>
            <button onClick={handleLogout} className="header-logout-button">
              Выйти
            </button>
          </div>
        </div>
      </header>
      <main>
        <Calendar
          tasks={tasks}
          onDateClick={openTaskModal}
          onDeleteTask={deleteTask}
        />
        {isModalOpen && (
          <TaskModal
            date={selectedDate}
            onClose={closeTaskModal}
            onAddTask={addTask}
            onDeleteTask={deleteTask}
            onToggleTask={toggleTask}
            existingTasks={
              selectedDate
                ? tasks[selectedDate.toISOString().split("T")[0]] || []
                : []
            }
          />
        )}
      </main>

      {/* Информация о режиме работы */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          background:
            syncStatus === "cloud"
              ? "rgba(76, 175, 80, 0.9)"
              : syncStatus === "error"
              ? "rgba(244, 67, 54, 0.9)"
              : "rgba(0,0,0,0.7)",
          color: "white",
          padding: "10px 15px",
          borderRadius: "20px",
          fontSize: "12px",
          zIndex: 1000,
        }}
      >
        {getSyncStatusText()}
      </div>
    </div>
  );
}

export default App;
