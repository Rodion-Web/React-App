import React, { useState } from "react";
import "./Calendar.css";

const Calendar = ({ tasks, onDateClick, onDeleteTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Получаем текущий месяц и год
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Получаем первый день месяца
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

  // Получаем день недели первого дня месяца (0 = воскресенье)
  const firstDayWeekday = firstDayOfMonth.getDay();

  // Получаем количество дней в месяце
  const daysInMonth = lastDayOfMonth.getDate();

  // Создаем массив дней для отображения
  const getDaysArray = () => {
    const days = [];

    // Добавляем пустые ячейки для дней предыдущего месяца
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(null);
    }

    // Добавляем дни текущего месяца
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(currentYear, currentMonth, i));
    }

    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getMonthName = (month) => {
    const months = [
      "Январь",
      "Февраль",
      "Март",
      "Апрель",
      "Май",
      "Июнь",
      "Июль",
      "Август",
      "Сентябрь",
      "Октябрь",
      "Ноябрь",
      "Декабрь",
    ];
    return months[month];
  };

  const getWeekdayNames = () => {
    return ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date &&
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getTasksForDate = (date) => {
    if (!date) return [];
    const dateKey = date.toISOString().split("T")[0];
    return tasks[dateKey] || [];
  };

  const getCompletedTasksCount = (date) => {
    const tasksForDate = getTasksForDate(date);
    return tasksForDate.filter((task) => task.completed).length;
  };

  const getActiveTasksCount = (date) => {
    const tasksForDate = getTasksForDate(date);
    return tasksForDate.filter((task) => !task.completed).length;
  };

  const days = getDaysArray();

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button onClick={goToPreviousMonth} className="nav-button">
          &lt;
        </button>
        <h2>
          {getMonthName(currentMonth)} {currentYear}
        </h2>
        <button onClick={goToNextMonth} className="nav-button">
          &gt;
        </button>
      </div>

      <button onClick={goToToday} className="today-button">
        Сегодня
      </button>

      <div className="calendar-grid">
        {/* Заголовки дней недели */}
        {getWeekdayNames().map((day) => (
          <div key={day} className="weekday-header">
            {day}
          </div>
        ))}

        {/* Дни месяца */}
        {days.map((day, index) => (
          <div
            key={index}
            className={`calendar-day ${!day ? "empty" : ""} ${
              isToday(day) ? "today" : ""
            }`}
            onClick={() => day && onDateClick(day)}
          >
            {day && (
              <>
                <span className="day-number">{day.getDate()}</span>
                <div className="tasks-preview">
                  {/* Показываем активные задачи */}
                  {getTasksForDate(day)
                    .filter((task) => !task.completed)
                    .slice(0, 2)
                    .map((task, taskIndex) => (
                      <div key={taskIndex} className="task-preview active">
                        {task.text}
                      </div>
                    ))}

                  {/* Показываем выполненные задачи */}
                  {getTasksForDate(day)
                    .filter((task) => task.completed)
                    .slice(0, 1)
                    .map((task, taskIndex) => (
                      <div
                        key={`completed-${taskIndex}`}
                        className="task-preview completed"
                      >
                        ✓ {task.text}
                      </div>
                    ))}

                  {/* Показываем счетчики */}
                  {getActiveTasksCount(day) > 0 && (
                    <div className="tasks-counter active">
                      {getActiveTasksCount(day)} активных
                    </div>
                  )}

                  {getCompletedTasksCount(day) > 0 && (
                    <div className="tasks-counter completed">
                      {getCompletedTasksCount(day)} выполнено
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
