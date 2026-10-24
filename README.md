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

## База данных

Всё хранится в одном файле SQLite (`data/app.db`, в Docker — том `/app/data`). Таблицы:

- `tournament` — `id` (тот самый код из ссылки `/t/<id>`), `players` (JSON-массив имён), `points_per_game`, `created_at`;
- `game` — `tournament_id`, `idx` (номер игры в расписании), `score1`, `score2` (`NULL` — не сыграна).

Пары и корты в базе не хранятся: они вычисляются из числа игроков функцией `generateSchedule` (`src/lib/domain/schedule.ts`).

Посмотреть турнир:

```sql
SELECT * FROM tournament WHERE id = 'hrrtkgg9';
SELECT * FROM game WHERE tournament_id = 'hrrtkgg9' ORDER BY idx;
```

SQLite — это файл, а не сервер, поэтому GUI (DataGrip и т.п.) подключается к локальной копии. Снимок с сервера
(база в режиме WAL, поэтому копируем через `backup`, а не просто файл):

```sh
# на сервере; <container> — имя контейнера приложения
docker exec <container> node -e "require('better-sqlite3')('data/app.db').backup('data/snapshot.db').then(() => console.log('ok'))"
docker cp <container>:/app/data/snapshot.db ./snapshot.db
docker exec <container> rm data/snapshot.db
# локально
scp <server>:snapshot.db ./snapshot.db
```

В DataGrip: New → Data Source → SQLite, файл `snapshot.db`. Это копия: правки в ней на сайт не попадают.
