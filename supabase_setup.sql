-- Создание таблицы для задач в Supabase
-- Выполните этот скрипт в SQL Editor вашего проекта Supabase

-- Создание таблицы для задач
CREATE TABLE IF NOT EXISTS tasks (
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
CREATE INDEX IF NOT EXISTS idx_tasks_user_email ON tasks(user_email);
CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(date);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);

-- Включение RLS (Row Level Security)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Удаление существующих политик (если есть)
DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;

-- Создание политик безопасности
-- Политика: пользователи могут видеть только свои задачи
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (true); -- Временно разрешаем всем для тестирования

-- Политика: пользователи могут создавать только свои задачи
CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (true); -- Временно разрешаем всем для тестирования

-- Политика: пользователи могут обновлять только свои задачи
CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (true); -- Временно разрешаем всем для тестирования

-- Политика: пользователи могут удалять только свои задачи
CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (true); -- Временно разрешаем всем для тестирования

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Удаление существующего триггера (если есть)
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_tasks_updated_at 
  BEFORE UPDATE ON tasks 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Проверка создания таблицы
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'tasks'
ORDER BY ordinal_position;

-- Проверка политик
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'tasks';
