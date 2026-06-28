# Task Manager — guidance for Claude

Локальный планировщик задач: список задач по категориям + перетаскивание на дни календаря (неделя/месяц). Без бэкенда и авторизации — всё хранится в браузере (localStorage) с экспортом/импортом JSON. UI на русском.

## Стек
- React 19 + TypeScript (strict), Vite, Tailwind v4.
- Состояние: Zustand + `persist` (localStorage, ключ `task-manager`).
- Drag-and-drop: dnd-kit (`core`, `sortable`, `utilities`).

## Архитектура — Feature-Sliced Design
Слои: `app → pages → widgets → features → entities → shared`. Импорты только вниз. Алиас `@/*` → `src/*`.
Бизнес-логика — в сторе/кастомных хуках; компоненты — функциональные, мелкие, презентационные UI в `shared/ui`.

## Доменная модель
- `Category { id, name, color, collapsed }` — порядок = порядок в массиве.
- `Task { id, title, categoryId|null, color|null, emoji|null, description|null, important, completed, completedAt, scheduledDate|null, createdAt }`.
- `categoryId: null` → «Без категории». `color: null` → наследует цвет категории.
- `scheduledDate` ('YYYY-MM-DD' | null) — одна задача на один день.

## Ключевые правила поведения
- Важность = булев флаг `important` (огонёк); фильтр «только важные» в правой панели. Уровней приоритета нет.
- Выполненная задача (`completed`) скрыта из панели и календаря, видна только в попапе «Выполненные»; оттуда — удалить навсегда или вернуть.
- Непустую категорию удалить нельзя.
- Снятие с дня → `scheduledDate = null`.
- Экспорт — JSON всего состояния (`version`, `categories`, `tasks`, `ui`); импорт валидирует и заменяет состояние.

## Команды
- `npm run dev` — дев-сервер.
- `npm run build` — типчек + прод-сборка.
- `npm run preview` — предпросмотр сборки.
- `npm test` — тесты (Jest + React Testing Library).

## Конвенции
- Самодокументируемый код, SOLID/DRY/KISS, без преждевременного усложнения.
- Минимизировать ререндеры: точечные селекторы Zustand, `useMemo`/`useCallback` для тяжёлых вычислений.
- Тексты UI — на русском.
