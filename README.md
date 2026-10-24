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

## Деплой

Push в `main` → CI → образ `ghcr.io/<owner>/pdlscore:latest` (workflow Image) →
workflow Deploy заходит на VPS по SSH и выполняет в `DEPLOY_PATH`
`docker compose pull && docker compose up -d`. Compose-файл и прокси живут на сервере.

Нужные GitHub Secrets:

| Секрет | Что это |
|---|---|
| `VPS_HOST` | адрес сервера |
| `VPS_USER` | пользователь для деплоя (в группе `docker`) |
| `VPS_PORT` | порт SSH, необязательно (по умолчанию 22) |
| `VPS_SSH_KEY` | приватный ключ деплоя, без пароля |
| `VPS_KNOWN_HOSTS` | вывод `ssh-keyscan -H <host>` — ключ хоста |
| `DEPLOY_PATH` | каталог на сервере с `compose.yaml` |
