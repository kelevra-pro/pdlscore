# pdlscore

Подсчёт очков для Americano в паделе — https://pdlscore.fun

Стек: SvelteKit (SSR) + SQLite, деплой Docker на VPS.

Спецификация MVP: [docs/PLAN.md](docs/PLAN.md)

## Разработка

Нужен Node.js 22+.

```sh
npm ci
npm run dev                                   # http://localhost:5173
npm run check && npm test && npm run build    # проверки
node build                                    # прод-сервер, порт 3000
```

База SQLite создаётся в `data/app.db` (путь можно поменять через `DATABASE_PATH`).
