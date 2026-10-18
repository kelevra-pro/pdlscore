# pdlscore — Padel Americano Scorer (https://pdlscore.fun)

Веб-приложение для подсчёта очков в Americano (падел). Спецификация MVP: docs/PLAN.md. Читай её перед работой.

## Стек
- SvelteKit (Svelte 5, runes) + TypeScript, SSR, @sveltejs/adapter-node
- SQLite через better-sqlite3 (файл data/app.db), без ORM
- Vitest для доменной логики
- Docker на VPS за общим обратным прокси, деплой через GitHub Actions

## Команды
- Установка: `npm ci`
- Проверки: `npm run check && npm test && npm run build`
- Локально: `npm run dev`

## Правила
- MVP-скоуп строго по docs/PLAN.md. Не добавляй авторизацию, историю турниров и прочее вне скоупа.
- Доменная логика (src/lib/domain) — чистые функции без импортов SvelteKit и БД, с тестами.
- Мутации только через form actions, чтобы страницы работали и без JS.
- Mobile-first, без UI-библиотек.
- Перед завершением все команды из «Проверки» должны быть зелёными.
- Коммиты короткие, на английском.
- Репозиторий ПУБЛИЧНЫЙ: никаких секретов, IP, имён пользователей, хостов VPS и .env в коде, конфигах и логах. Только GitHub Secrets или .env на сервере.
- Секреты используются только в workflow на push в main. Не используй pull_request_target.
- Не добавляй Claude в авторы и соавторы: никаких Co-Authored-By, ссылок на сессию и подписей «Generated with Claude Code» в коммитах и PR.
