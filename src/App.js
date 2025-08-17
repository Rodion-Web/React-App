import React, { useState, useEffect } from "react";
import "./App.css";
import Calendar from "./components/Calendar";
import TaskModal from "./components/TaskModal";

function App() {
  const [tasks, setTasks] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Загружаем задачи из localStorage при инициализации
  useEffect(() => {
    const savedTasks = localStorage.getItem("calendarTasks");
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Сохраняем задачи в localStorage при изменении
  useEffect(() => {
    localStorage.setItem("calendarTasks", JSON.stringify(tasks));
  }, [tasks]);

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

  const openTaskModal = (date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Календарь задач</h1>
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
