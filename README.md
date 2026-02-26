# JS-TS-Playwraght-http-litecart.stqa.ru-
Автотестовый проект для сайта http://litecart.stqa.ru/

Для запуска АТ через консоль команда:
npx playwright test --workers=1 --project=chromium tests/pages/example.spec.ts
где workers: 1, // Запускает тесты последовательно
где --project=chromium, // Запускает тесты в определенном браузере (firefox, chromium, webkit)

С проектом рекомендуется пользоваться через VS Code
