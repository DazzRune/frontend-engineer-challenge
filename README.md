# Advanced Frontend Engineer Challenge

Клиентская реализация сервиса авторизации и аутентификации для интеграции с [backend](https://github.com/azarenkov/engineer-challenge).

Альтернативная реализация с полной эмуляцией backend с помощью
[MSW.js](https://mswjs.io/), размещен на [Github Pages](https://dazzrune.github.io/frontend-engineer-challenge).

## Как запустить проект на локальном сервере

Системные требования:

- Node.js ^20.19.0 или >=22.12.0 (поставляется вместе с npm)
- Git

Запуск на локальном сервере:

0. запустить [backend](https://github.com/azarenkov/engineer-challenge)
1. `git clone https://github.com/DazzRune/frontend-engineer-challenge.git`
2. `cd frontend-engineer-challenge`
3. `npm i`
4. `npm run build`
5. `npm run preview`
6. перейти http://localhost:4173/.

В devtools можно отслеживать статус запросов, например, успешная авторизация:

![Лог успешной авторизации](https://raw.githubusercontent.com/DazzRune/media-hosting/refs/heads/main/frontend-engineer-challenge_login_logs.jpg)

| инструмент | версия | назначение | преимущества перед аналогами |
|---|---|---|---|
| vue | ^3.5.31 | Прогрессивный UI-фреймворк | В отличие от React.js: разделенный код - sfc (в реакте шаблоны и остальное смешано в js); нюансы реактивности (react ререндерит всегда и везде, при каждом изменении зависимостей. vue делает это пакетно, можно привязаться к nextTick); composables (vue реализует это интуитивнее); слоты (а в реакте все передается через пропсы); двухсторонее связывание |
| vue-router | ^5.0.4 | Клиентский роутинг SPA | Легче React Router в связке с Vue |
| vueuse | ^14.2.1 | Коллекция Vue composition утилит | Готовые решения в экосистеме |
| vite | ^8.0.3 | Сборщик и dev-сервер | HMR быстрее webpack за счёт нативных ES-модулей; нативная поддержка Vue SFC и TypeScript; минимальная конфигурация |
| unplugin-auto-import | ^21.0.0 | Автоматический импорт Vue/VueRouter/VueUse API без явных import-строк | Убирает шаблонный код импортов; генерирует .d.ts |
| unplugin-vue-components | ^32.0.0 | Автоматическая регистрация Vue-компонентов без явного импорта | Убирает шаблонный код импортов; генерирует .d.ts |
| universal-cookie | ^7.2.2 | Чтение и запись cookie | Проще браузерного API |
| typescript | ~6.0.0 | Статическая типизация JavaScript |  |
| valibot | ^1.3.1 | Схемы валидации | bundle size в разы меньше чем zod |
| tailwindcss | ^4.2.2 | Utility-first CSS фреймворк для стилизации компонентов | v4 использует CSS-native переменные и `@theme` без конфиг-файла; меньше бойлерплейта |
| prettier | 3.8.1 | Автоформатирование кода | Подходящие правила из коробки |
| node | ^20.19.0 \|\| >=22 | Среда выполнения JavaScript для запуска dev-сервера и сборки |  |
| msw | ^2.12.14 | Перехват HTTP-запросов через Service Worker для мокирования API | Работает на сетевом уровне, не загрязняя целевой код |

## 1. Качество архитектуры frontend и управляемость кода

- Архитектурно проект разделен на слои: `pages/`, `components/`, `composables/`, `layouts/`, `mocks/`, `router/`, `assets/`, `constants/`
- Composables клиентской и серверной валидации (`useBrowserValidation`, `useServerValidation`) выносят логику из компонентов
- `constants.ts` централизует все константы, маппинги страниц, статусов, сообщений
- `schema.ts` отделяет валидационные схемы от компонентов

trade-offs:
- Выбран REST протокол. К сожалению, пока нет знакомства с gRPC или graphQL
- Возможно, стоило разгрузить логику серверного взаимодействия (`useServerValidation`) - отдельно http-запросы и обработка ошибок. С другой стороны они логически связаны, а интуитивный интерфейс обеспечивает легкий доступ извне.
- С микрофронтами и FSD не было опыта

```
📁 frontend-engineer-challenge/
├── 📁 public/
│   └── 📄 mockServiceWorker.js <-- только для git ветки "msw" с подменой backend'a для демонстрации на gh-pages
└── 📁 src/
    ├── 📁 assets/
    │   ├── 📁 fonts/
    │   ├── 📁 img/
    │   ├── 📁 scripts/
    │   │   └── 🟦 constants.ts <-- константы, маппинги страниц, статусов, сообщений
    │   ├── 📁 svg/
    │   └── 🎨 main.css
    ├── 📁 components/
    │   ├── 📄 BaseForm.vue <-- компонент формы для страниц  /login, /register, /request-password-reset, /reset-password
    │   ├── 📄 BaseInput.vue
    │   └── 📄 TheHeader.vue
    ├── 📁 composables/
    │   ├── 🟦 useBrowserValidation.ts <-- логика клиентской валидации и сообщений по результатам
    │   └── 🟦 useServerValidation.ts <-- логика серверной валидации, обработки ошибок и сообщений по результатам
    ├── 📁 layouts/
    │   ├── 📄 LayoutAccent.vue <-- сетка с  центровщиком
    │   └── 📄 LayoutSplit.vue <-- сетка с двухколоночным дизайном
    ├── 📁 mocks <-- логика MSW
    │   ├── 🟦 browser.ts
    │   └── 🟦 handlers.ts
    ├── 📁 pages/
    │   ├── 📄 PageComplete.vue <-- страница /complete c результатом сброса пароля
    │   ├── 📄 PageForm.vue  <-- страницы c формой /login, /register, /request-password-reset, /reset-password
    │   ├── 📄 PageNotify.vue  <-- /notify с результатом запроса ссылки для сброса пароля
    │   ├── 📄 PageWelcome.vue  <-- /welcome с подтверждением успешной регистрации
    │   └── 📄 PageWelcomeback.vue  <-- /welcomeback c подтверждением успешного входа
    ├── 📁 router/
    ├── 📄 App.vue
    ├── 🟦 main.ts
    └── 📄 schema.ts <-- валидационные схемы и их типы
```

## 2. Корректность auth-флоу и интеграции с backend

- Реализованы все 4 эндпоинта: POST `/login`, `/register`, `/request-password-reset`, `/reset-password`
- Обрабатываются все статус-коды: 200, 201, 400, 401, 404, 409, 429, 500, 503
- Клиентская валидация (`schema.ts`) корректно отражает в том числе правила серверной валидации: email format, password minLength 4 / maxLength 30

trade-offs:
- эндпоинт `/reset-password` должен принимать объект `{ token, password, newPassword }`, но в моей реализации ожидается `{ password, newPassword }` без поля `token`. Вместо этого токен добавляется хардкодом:` { ...state, token: 'mK9pL2xQvR7nJ4wY8hF3tA6uC1eB5dG0' }`, а не из параметров URL письма или cookie. Это заглушка по причине того, что для успешного восстановления нужны заполненные реальные значения `MAILER_*` в `.env` backend'a, и он всегда отправляет статус 500. Зато подобный сценарий замокан в варианте с MSW.

[![](https://mermaid.ink/img/pako:eNqtVW9r00AY_yrH-UYhq03TNm0QZXbdKOtW6QqiRiRLLl1ZmquXlDnXgdsL3zgUfOMrUb9BNx1W57qvcPlGPndJauY2UbBQerk8vz_P7_50B9vUIdjArke37A2LhajZNn0En7XOfLtz_ZGJEf8U7fNx9CLaRyZ-fAPNzd0eoRFqtpYaq6YfV8sHKL7p0W7PhzJZFQxtmwTBCN2vN2utlfrd-dqyKNoink37ZN2yN6E0wyBRJubv-JgfRq_4CZ8gfibE-ZSfRAd3TDxC7fpavZMF3RIo_pEf8898Eu1F-1A-jl7C-I2oXmqsdeptoctItxeEhEnRmOGK15faz1if2U5epcbfgulvENdEGE0SypSJAP5UmnqCBmNDT4ckCOcGVhBsUebMMRKQ8IK91VansfhAAHwa9tztmbn4RSr4HkL9Ct8viB8h-D0C8SlENRGzMq7XF6ykDDlJAdnuyVX5zsdI4MTiiMQP-A8-Nk2fn_JjBJTHQH8iiaf8CManfCqoa63VxUZ7JSVPHuNOobFZnxc6hOzuNeud-pPW8jlo0loQWuEwQKV8PlZJihfnG81fWjMGoQdrOPBISMCzABMDhWxIUt1_DuucgpC9XMO1vOA_iqQ0HyDlM3lEDuO84QQcIMl8KiemmWMT89geRL1AXORS1kduz_OMa5pq5d28YlOPMuOa67pKEDK6SQyf-uQ3WLIyKdLSnWLx75ADRtc9kmo6Ba2qVa9EZrBxCkp6XhXZjpLuA9FGtjhz3pRkrMR7WcnshLSNLPJ8wolb08cK7rKegw25hgruE9a3xDPeEWgThxtEXAsGDB2Lwb1m-rsAGlj-Q0r72BD7S8GMDrsbM5LhwIF9sdCzuszqz2YZ8R3CanToh9jQCgVVsmBjBz_DhprT82W1lC-qeknVdb2s4G2Y1Su5SlmvlIt6VStoZbWwq-DnUlfN5asQclVXy5quF0oVTcHE6YWUrcRXv_wH2P0JiU9Jqg?type=png)](https://mermaid.ai/live/edit#pako:eNqtVW9r00AY_yrH-UYhq03TNm0QZXbdKOtW6QqiRiRLLl1ZmquXlDnXgdsL3zgUfOMrUb9BNx1W57qvcPlGPndJauY2UbBQerk8vz_P7_50B9vUIdjArke37A2LhajZNn0En7XOfLtz_ZGJEf8U7fNx9CLaRyZ-fAPNzd0eoRFqtpYaq6YfV8sHKL7p0W7PhzJZFQxtmwTBCN2vN2utlfrd-dqyKNoink37ZN2yN6E0wyBRJubv-JgfRq_4CZ8gfibE-ZSfRAd3TDxC7fpavZMF3RIo_pEf8898Eu1F-1A-jl7C-I2oXmqsdeptoctItxeEhEnRmOGK15faz1if2U5epcbfgulvENdEGE0SypSJAP5UmnqCBmNDT4ckCOcGVhBsUebMMRKQ8IK91VansfhAAHwa9tztmbn4RSr4HkL9Ct8viB8h-D0C8SlENRGzMq7XF6ykDDlJAdnuyVX5zsdI4MTiiMQP-A8-Nk2fn_JjBJTHQH8iiaf8CManfCqoa63VxUZ7JSVPHuNOobFZnxc6hOzuNeud-pPW8jlo0loQWuEwQKV8PlZJihfnG81fWjMGoQdrOPBISMCzABMDhWxIUt1_DuucgpC9XMO1vOA_iqQ0HyDlM3lEDuO84QQcIMl8KiemmWMT89geRL1AXORS1kduz_OMa5pq5d28YlOPMuOa67pKEDK6SQyf-uQ3WLIyKdLSnWLx75ADRtc9kmo6Ba2qVa9EZrBxCkp6XhXZjpLuA9FGtjhz3pRkrMR7WcnshLSNLPJ8wolb08cK7rKegw25hgruE9a3xDPeEWgThxtEXAsGDB2Lwb1m-rsAGlj-Q0r72BD7S8GMDrsbM5LhwIF9sdCzuszqz2YZ8R3CanToh9jQCgVVsmBjBz_DhprT82W1lC-qeknVdb2s4G2Y1Su5SlmvlIt6VStoZbWwq-DnUlfN5asQclVXy5quF0oVTcHE6YWUrcRXv_wH2P0JiU9Jqg)

## 3. Качество UX-состояний, обработки ошибок и адаптивности

- Реализованы все экраны флоу: `login → welcomeback`, `register → welcome`, `reset → notify`, `confirm → complete` (`success`/`failed`)
- Ошибки валидации отображаются под инпутами (`browserMessage`, `serverValidationMessage`) и общие серверные ошибки - под формой (`serverSensitiveMessage`)
- Эффекты floating label, динамический бордер с цветами состояния инпута, показ/скрытие пароля
- Компонент-сплиттер (`LayoutSplit`) скрывает правую колонку на mobile, компонент-центровщик (`LayoutAccent`) использует `clamp()` для ширины контейнера
- Состояние `complete` страницы различает `success`/`failed`, получаемые через History API, с разными текстами и кнопкой "Попробовать заново"
- Дизайн-система на основе css-токенов цветов и размеров, подготовленные утилитарные классы, например, `btn`, `details`, `message`
- Кнопка отправки блокируется во время запроса (состояние `loading`), есть визуальный индикатор — пользователь знает, что запрос выполняется
- Race condition обрабатывается на уровне fetch через `abort`

trade-offs:
- Страница формы создания пароля `/confirm` доступна напрямую без токена — нет guard'а роута. Причина отсутствия токена указана в пункте 2, но доступ оставлен специально для оценки
- Страницы результатов запросов `/welcomeback`, `/welcome`, `/notify`, `/complete` доступны напрямую в через URL без предшествующего успешного запроса. Доступ оставлен для оценки

## 4. Тестируемость и надежность ключевых сценариев

- MSW (Mock Service Worker) настроен и покрывает все сценарии включая edge-cases
- Защита от race conditions: `useFetch` с `canAbort`/`abort` в `useServerValidation` — новый запрос отменяет предыдущий
- Защита от rate limit смоделирована в моках (`ATTEMPTS_LIMIT`)
- Клиентская валидация предотвращает лишние запросы к серверу

trade-offs:
- Нет unit/integration/e2e тестов. К сожалению, пока нет навыка
- Со стратегией типизации контрактов не был знаком (codegen/typed clients). Нет навыка
- Нет error tracking, telemetry. Ни разу не применял

## Что сделано сверх задачи

- Полная эмуляция серверного состояния через MSW.js
- 2 дополнительных экрана `/welcomeback` и `/welcome` с подтверждением запросов для страниц `/login` и `/register`
