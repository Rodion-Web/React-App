import React, { useState } from "react";
import "./Auth.css";

const Auth = ({ onLogin, onLogout, isAuthenticated, currentUser }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Введите email");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Введите корректный email");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Имитация задержки для лучшего UX
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Генерируем уникальный токен для пользователя
      const token = generateToken(email);
      const user = {
        email: email.trim().toLowerCase(),
        token,
        createdAt: new Date().toISOString(),
      };

      // Сохраняем пользователя в localStorage
      localStorage.setItem("currentUser", JSON.stringify(user));

      onLogin(user);
    } catch (err) {
      setError("Ошибка входа. Попробуйте еще раз.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    onLogout();
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const generateToken = (email) => {
    // Простая генерация токена на основе email и времени
    const timestamp = Date.now().toString();
    const emailHash = btoa(email).replace(/[^a-zA-Z0-9]/g, "");
    return `${emailHash}_${timestamp}`;
  };

  if (isAuthenticated) {
    return (
      <div className="auth-container">
        <div className="user-info">
          <span className="user-email">{currentUser.email}</span>
          <button onClick={handleLogout} className="logout-button">
            Выйти
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Вход в календарь задач</h2>
        <p className="auth-description">
          Введите ваш email для входа. Задачи будут сохранены для вашего
          аккаунта.
        </p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="email-input"
              disabled={isLoading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="login-button"
            disabled={isLoading || !email.trim()}
          >
            {isLoading ? "Вход..." : "Войти"}
          </button>
        </form>

        <div className="auth-features">
          <div className="feature">
            <span className="feature-icon">🔒</span>
            <span>Безопасный вход</span>
          </div>
          <div className="feature">
            <span className="feature-icon">☁️</span>
            <span>Синхронизация между устройствами</span>
          </div>
          <div className="feature">
            <span className="feature-icon">💾</span>
            <span>Автосохранение задач</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
