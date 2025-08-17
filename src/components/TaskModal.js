import React, { useState } from "react";
import "./TaskModal.css";

const TaskModal = ({
  date,
  onClose,
  onAddTask,
  existingTasks,
  onDeleteTask,
}) => {
  const [newTask, setNewTask] = useState("");
  const [taskPriority, setTaskPriority] = useState("medium");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newTask.trim()) {
      const task = {
        id: Date.now(),
        text: newTask.trim(),
        priority: taskPriority,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      onAddTask(date, task);
      setNewTask("");
      setTaskPriority("medium");
    }
  };

  const formatDate = (date) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("ru-RU", options);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#ff6b6b";
      case "medium":
        return "#4ecdc4";
      case "low":
        return "#45b7d1";
      default:
        return "#4ecdc4";
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case "high":
        return "Высокий";
      case "medium":
        return "Средний";
      case "low":
        return "Низкий";
      default:
        return "Средний";
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Задачи на {formatDate(date)}</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {/* Форма добавления новой задачи */}
          <form onSubmit={handleSubmit} className="add-task-form">
            <div className="form-group">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Введите новую задачу..."
                className="task-input"
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
                className="priority-select"
              >
                <option value="low">Низкий приоритет</option>
                <option value="medium">Средний приоритет</option>
                <option value="high">Высокий приоритет</option>
              </select>
            </div>

            <button
              type="submit"
              className="add-task-button"
              disabled={!newTask.trim()}
            >
              Добавить задачу
            </button>
          </form>

          {/* Список существующих задач */}
          <div className="tasks-list">
            <h3>Текущие задачи ({existingTasks.length})</h3>
            {existingTasks.length === 0 ? (
              <p className="no-tasks">На этот день задач пока нет</p>
            ) : (
              existingTasks.map((task, index) => (
                <div
                  key={task.id}
                  className="task-item"
                  style={{ borderLeftColor: getPriorityColor(task.priority) }}
                >
                  <div className="task-content">
                    <span className="task-text">{task.text}</span>
                    <span className="task-priority">
                      {getPriorityText(task.priority)}
                    </span>
                  </div>
                  <button
                    className="delete-task-button"
                    onClick={() => onDeleteTask(date, index)}
                    title="Удалить задачу"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
