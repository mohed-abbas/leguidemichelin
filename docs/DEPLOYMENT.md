# Deployment

Single-slot deploy to a shared-infra VPS. **Not** zero-downtime — demo project, short downtime window on redeploy is acceptable.

## Architecture on the VPS

```
/home/murx/
├── shared/                          # existing shared infra (nginx + certbot + its own postgres + redis)
│   ├── docker-compose.infra.yml
│   ├── nginx/
│   │   ├── nginx.conf
│   │   └── conf.d/
│   │       └── foodie.thecodeman.cloud.conf   <- copied from this repo
│   └── certbot/
│       ├── conf/                    # /etc/letsencrypt on the nginx container
│       └── www/                     # ACME webroot
└── apps/
    └── leguidemichelin/             # this repo
        ├── compose.prod.yaml
        ├── .env                     # filled from .env.example
        └── scripts/deploy.sh
```

Networks:

- `proxy-net` (external, created once) — shared between `shared/nginx` and this project's `foodie-web` + `foodie-api`. nginx reaches services by container name.
- `data-net` from the shared stack is **not used**. This project runs its own `foodie-postgres` on its compose-default bridge network for isolation.

## One-time VPS bootstrap

```bash
# 1. Networks
docker network inspect proxy-net >/dev/null 2>&1 || docker network create proxy-net

# 2. Clone
mkdir -p /home/murx/apps && cd /home/murx/apps
git clone https://github.com/mohed-abbas/leguidemichelin.git
cd leguidemichelin

# 3. Env
cp .env.example .env
vim .env
#   - set POSTGRES_PASSWORD to something strong
#   - set DATABASE_URL=postgresql://foodie:<pw>@postgres:5432/foodie?schema=public
#   - set BETTER_AUTH_SECRET=$(openssl rand -base64 32)
#   - set WEB_ORIGIN=https://foodie.thecodeman.cloud
#   - set BETTER_AUTH_URL=https://foodie.thecodeman.cloud
#   - set NEXT_PUBLIC_APP_URL=https://foodie.thecodeman.cloud
#   - set NEXT_PUBLIC_API_URL=https://foodie.thecodeman.cloud
#   - set NEXT_PUBLIC_MAPBOX_TOKEN=pk.<your token>
#   - set NODE_ENV=production

# 4. Images dir on host (bind-mounted by api service)
sudo mkdir -p /srv/foodie/images
sudo chown -R 1000:1000 /srv/foodie/images   # node user in alpine is uid 1000

# 5. DNS — add A record: foodie.thecodeman.cloud -> <VPS IP>
#    Wait for propagation before step 6.

# 6. nginx site + TLS cert
cp deploy/nginx/foodie.thecodeman.cloud.conf /home/murx/shared/nginx/conf.d/
cd /home/murx/shared
docker compose -f docker-compose.infra.yml run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d foodie.thecodeman.cloud \
  --email you@example.com --agree-tos --no-eff-email
docker exec nginx nginx -t
docker exec nginx nginx -s reload

# 7. First deploy
cd /home/murx/apps/leguidemichelin
bash scripts/deploy.sh
```

## Redeploy

```bash
cd /home/murx/apps/leguidemichelin
bash scripts/deploy.sh
```

`deploy.sh` does, in order:

1. Verify `proxy-net` exists + `.env` present
2. `git pull --ff-only origin main`
3. `docker compose build --pull web api` with `NEXT_PUBLIC_BUILD_SHA` pinned to short HEAD
4. `compose run --rm migrate` — applies Prisma migrations
5. `compose up -d --no-deps --force-recreate api web`
6. Poll api healthcheck for up to ~2 min
7. `compose run --rm seed` — idempotent upsert of demo data
8. Print `compose ps`

## Rollback (crude, good enough for demo)

```bash
git log --oneline -n 10                         # find a known-good SHA
git checkout <sha>
bash scripts/deploy.sh
# afterwards, return to main: git checkout main
```

Prisma migrations are not auto-reversed. If a migration broke something, restore from the pre-deploy pg_dump (see below) or manually revert the failing migration in SQL.

## Manual pg_dump before risky changes

```bash
docker exec foodie-postgres pg_dump -U foodie -d foodie --clean > ~/backups/foodie-$(date +%F-%H%M).sql
```

Restore:

```bash
cat ~/backups/foodie-2026-04-25-1430.sql | docker exec -i foodie-postgres psql -U foodie -d foodie
```

## Common checks

```bash
docker ps --filter name=foodie-                                # all project containers
docker logs -f foodie-api                                      # api logs
docker logs -f foodie-web                                      # web logs
curl -sS https://foodie.thecodeman.cloud/api/healthz           # public health
docker exec foodie-api wget -qO- http://127.0.0.1:3001/healthz # inside-container health
```

## Gotchas

- **`NEXT_PUBLIC_*` needs a rebuild.** Changing the Mapbox token, API URL, or app URL in `.env` does nothing until you re-run `scripts/deploy.sh` — the values are baked into the web bundle at build time.
- **iOS camera + PWA install require valid HTTPS.** Don't test the scan flow over plain HTTP — `getUserMedia` will silently refuse.
- **Mapbox token must be URL-restricted** in the Mapbox dashboard to `localhost` + `foodie.thecodeman.cloud` before demo day. Public tokens are harmless in the bundle; unrestricted ones aren't.
- **Image uploads up to 15 MB** (nginx `client_max_body_size`). Raise it in `deploy/nginx/foodie.thecodeman.cloud.conf` + reload nginx if needed.
- **Postgres is project-isolated.** This stack does NOT use the shared postgres from `docker-compose.infra.yml`. Data lives in the `foodie_postgres-data` named volume on the VPS. Back it up before tearing the project down.
