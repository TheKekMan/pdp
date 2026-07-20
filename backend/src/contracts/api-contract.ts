/**
 * @file api-contract.ts
 * @description Спецификация контракта API (API-First подход) и описание жизненного цикла запроса в Express.
 * 
 * =========================================================================
 * РЕКОМЕНДУЕМЫЕ ИСТОЧНИКИ ДЛЯ ИЗУЧЕНИЯ (API Design & Backend Lifecycle)
 * =========================================================================
 * 1. Проектирование REST API:
 *    - Microsoft API Guidelines: https://github.com/microsoft/api-guidelines (Стандарт разработки API от Microsoft)
 *    - API Design Patterns (Manning): https://www.manning.com/books/api-design-patterns (Книга по паттернам API)
 * 2. Работа бэкенда и жизненный цикл запросов:
 *    - Express Middleware Guide: https://expressjs.com/en/guide/using-middleware.html (Официальный гайд по промежуточному ПО)
 *    - Fastify Lifecycle Hooks: https://fastify.dev/docs/latest/Reference/Lifecycle/ (Диаграмма хуков жизненного цикла Fastify)
 * 
 * =========================================================================
 * ЖИЗНЕННЫЙ ЦИКЛ ЗАПРОСА В EXPRESS (Express Request Lifecycle)
 * =========================================================================
 * При поступлении HTTP-запроса на сервер Express, он проходит следующие стадии:
 * 
 * 1. Получение запроса TCP/HTTP сервером Node.js.
 * 2. Инициализация объектов Request (req) и Response (res).
 * 3. Глобальные промежуточные обработчики (Global Middlewares):
 *    - cors(): настраивает заголовки CORS.
 *    - express.json(): парсит тело запроса JSON в req.body.
 * 4. Маршрутизация (Routing):
 *    - Express сопоставляет URL и HTTP-метод с зарегистрированными путями (routes).
 * 5. Middleware уровня маршрута (Route-level Middlewares):
 *    - Валидация входных данных (например, сверка req.body с Zod/Yup схемой).
 *    - Проверка авторизации / аутентификации.
 * 6. Контроллер (Handler/Controller):
 *    - Обработка бизнес-логики.
 *    - Взаимодействие с БД/сервисами.
 *    - Отправка ответа через res.status().json().
 * 7. Обработка ошибок (Error Handling Middleware):
 *    - Если на любом этапе была вызвана функция next(error), управление передается специальной 
 *      функции-обработчику с 4 аргументами: (err, req, res, next).
 */

// =========================================================================
// КОНТРАКТ API (СХЕМЫ ДАННЫХ И ИНТЕРФЕЙСЫ)
// =========================================================================

// Бизнес-сущность Todo
export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

// Форматы запросов
export interface CreateTodoRequest {
  title: string; // Обязательное поле, 3-100 символов
}

export interface UpdateTodoRequest {
  title?: string;
  completed?: boolean;
}

// Форматы ответов API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Контракт REST эндпоинтов
export const API_ROUTES = {
  TODOS: {
    GET_ALL: '/api/todos',
    CREATE: '/api/todos',
    TOGGLE: '/api/todos/:id/toggle',
    DELETE: '/api/todos/:id',
  },
  REALTIME: {
    SSE: '/api/realtime/sse',
    SOCKET_IO: '/socket.io', // Маршрут для Socket.io клиента
    WEBSOCKET: '/ws',        // Маршрут для чистого WS
  }
} as const;

// Типы событий для Realtime коммуникации
export type RealtimeEvent =
  | { type: 'TODO_CREATED'; payload: Todo }
  | { type: 'TODO_TOGGLED'; payload: Todo }
  | { type: 'TODO_DELETED'; payload: { id: string } }
  | { type: 'SYSTEM_STATUS'; payload: { uptime: number; clientsCount: number; memoryUsage: number } };
