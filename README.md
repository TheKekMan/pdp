# Практическая платформа изучения PDP

Этот проект — структурированное практическое руководство по ключевым темам фронтенд-разработки (Personal Development Plan). Вся теория объединена с рабочими примерами кода и интерактивными инструментами.

## Структура проекта по пунктам PDP

| Пункт PDP | Тема | Где реализовано (Файлы и папки) | Как изучать |
| :--- | :--- | :--- | :--- |
| **1** | Websocket vs Socket.IO vs SSE | [RealtimePage.tsx](file:///d:/practice/pdp/frontend/src/pages/realtime/RealtimePage.tsx)<br>[server.ts](file:///d:/practice/pdp/backend/src/server.ts) | Интерактивное сравнение логов и статусов в реальном времени при отправке данных. |
| **2** | 7 паттернов проектирования в React | [PatternsPage.tsx](file:///d:/practice/pdp/frontend/src/pages/patterns/PatternsPage.tsx) | Интерактивные интерактивные интерактивные демосцены для каждого паттерна с описанием "Какую проблему решает" и "Когда приносит вред". |
| **3** | Монолит vs Микросервисы, Монорепа vs Мультирепа | [03-monolith-microservices.md](file:///d:/practice/pdp/docs/03-monolith-microservices.md) | Теоретический разбор скрытых затрат, критериев выбора и сигналов к распилу кодовой базы. |
| **4** | SOLID в React | [SolidPage.tsx](file:///d:/practice/pdp/frontend/src/pages/solid/SolidPage.tsx)<br>[SolidPage.test.tsx](file:///d:/practice/pdp/frontend/src/pages/solid/SolidPage.test.tsx) | Сравнение спагетти-кода и SOLID-рефакторинга с описанием влияния каждого принципа на юнит-тестируемость. |
| **5** | Проектирование API + Express | [api-contract.ts](file:///d:/practice/pdp/backend/src/contracts/api-contract.ts)<br>[server.ts](file:///d:/practice/pdp/backend/src/server.ts) | API-First подход: проектирование контракта типов запросов/ответов до разработки и описание жизненного цикла запроса. |
| **6** | React-hook-form vs Formik, Zod vs Yup | [FormsPage.tsx](file:///d:/practice/pdp/frontend/src/pages/forms/FormsPage.tsx) | Форма-бенчмарк: ввод текста показывает разницу в количестве рендеров (controlled vs uncontrolled) и особенности Zod/Yup. |
| **7** | Стратегия тестирования фронтенда | [07-testing-strategy.md](file:///d:/practice/pdp/docs/07-testing-strategy.md)<br>[SolidPage.test.tsx](file:///d:/practice/pdp/frontend/src/pages/solid/SolidPage.test.tsx) | Описание тест-пирамиды, разницы Vitest vs Jest vs Playwright + реальный юнит-тест компонента на Vitest + Testing Library. |
| **8** | FSD (Feature-Sliced Design) и аналоги | [08-fsd-architecture.md](file:///d:/practice/pdp/docs/08-fsd-architecture.md)<br>[Frontend Структура папок](file:///d:/practice/pdp/frontend/src/) | Разбор концепций слоев FSD, правил импортов, альтернатив и адаптации под размер проекта. |

---

## Как запустить проект локально

### 1. Установка всех зависимостей
Установите все зависимости в корне проекта (npm автоматически установит зависимости рабочих областей):
```bash
npm run install:all
```

### 2. Запуск в режиме разработки (Dev Server)
Запустите одновременно бэкенд и фронтенд серверы одной командой:
```bash
npm run dev
```
* Фронтенд запустится на: http://localhost:3000
* Бэкенд запустится на: http://localhost:3001

### 3. Запуск тестов (Vitest)
Для запуска юнит-тестов и проверки SOLID компонентов в изолированной среде:
```bash
npm run test --workspace=frontend
```
Команда выполнит тесты и покажет результат в консоли.
