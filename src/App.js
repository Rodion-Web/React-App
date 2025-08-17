import React, { useState, useEffect } from "react";
import "./App.css";
import Calendar from "./components/Calendar";
import TaskModal from "./components/TaskModal";
import Auth from "./components/Auth";

function App() {
  const [tasks, setTasks] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  // Загружаем задачи пользователя
  const loadUserTasks = (userEmail) => {
    const savedTasks = localStorage.getItem(`tasks_${userEmail}`);
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      setTasks({});
    }
  };

  // Сохраняем задачи пользователя
  const saveUserTasks = (userEmail, tasksData) => {
    localStorage.setItem(`tasks_${userEmail}`, JSON.stringify(tasksData));
  };

  // Сохраняем задачи в localStorage при изменении
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

  // Если пользователь не авторизован, показываем форму входа
  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1>Календарь задач</h1>
          <div className="user-section">
            <span className="welcome-text">
              Добро пожаловать, {currentUser.email}
            </span>
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
    </div>
  );
}

export default App;
