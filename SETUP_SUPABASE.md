# Настройка Supabase для синхронизации задач

## 🚀 Что такое Supabase?

Supabase - это бесплатный open-source аналог Firebase с базой данных PostgreSQL. Он позволяет:
- Хранить данные в облаке
- Синхронизировать данные между устройствами
- Работать с любого IP-адреса и устройства
- Получать бесплатный план с 500MB базы данных

## 📋 Пошаговая настройка

### 1. Создание аккаунта
1. Перейдите на [supabase.com](https://supabase.com)
2. Нажмите "Start your project"
3. Войдите через GitHub или создайте аккаунт
4. Создайте новый проект

### 2. Получение ключей
1. В проекте перейдите в Settings → API
2. Скопируйте:
   - **Project URL** (например: `https://abcdefghijklmnop.supabase.co`)
   - **anon public** ключ

### 3. Обновление конфигурации
Откройте файл `src/config/supabase.js` и замените:

```javascript
const supabaseUrl = 'YOUR_SUPABASE_URL';        // Ваш Project URL
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'; // Ваш anon public ключ
```

### 4. Создание таблицы в базе данных
В Supabase Dashboard перейдите в SQL Editor и выполните:

```sql
-- Создание таблицы для задач
CREATE TABLE tasks (
  id BIGSERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  date TEXT NOT NULL,
  text TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для быстрого поиска
CREATE INDEX idx_tasks_user_email ON tasks(user_email);
CREATE INDEX idx_tasks_date ON tasks(date);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);

-- Создание RLS (Row Level Security) политик
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Политика: пользователи могут видеть только свои задачи
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (auth.email() = user_email);

-- Политика: пользователи могут создавать только свои задачи
CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.email() = user_email);

-- Политика: пользователи могут обновлять только свои задачи
CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.email() = user_email);

-- Политика: пользователи могут удалять только свои задачи
CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (auth.email() = user_email);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_tasks_updated_at 
  BEFORE UPDATE ON tasks 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

### 5. Настройка аутентификации (опционально)
Для более безопасной аутентификации можно настроить Supabase Auth:

1. В Dashboard перейдите в Authentication → Settings
2. Включите Email auth
3. Настройте SMTP для отправки писем подтверждения

## 🔧 Тестирование

После настройки:

1. Запустите приложение: `npm start`
2. Войдите с любым email
3. Создайте несколько задач
4. Откройте приложение в другом браузере/устройстве
5. Войдите с тем же email - задачи должны синхронизироваться!

## 📱 Синхронизация между устройствами

Теперь ваши задачи будут:
- ✅ Сохраняться в облаке
- ✅ Синхронизироваться между всеми устройствами
- ✅ Работать с любого IP-адреса
- ✅ Автоматически обновляться при изменениях

## 🆘 Решение проблем

### Ошибка подключения
- Проверьте правильность URL и ключа
- Убедитесь, что проект активен в Supabase

### Задачи не синхронизируются
- Проверьте консоль браузера на ошибки
- Убедитесь, что таблица создана правильно
- Проверьте RLS политики

### Медленная синхронизация
- Это нормально для бесплатного плана
- Можно добавить индикатор загрузки

## 💰 Стоимость

- **Бесплатный план**: 500MB базы данных, 50,000 запросов/месяц
- **Pro план**: $25/месяц для больших проектов

Для личного использования бесплатного плана более чем достаточно!
