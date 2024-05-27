## Table of Contents

- [Quick run](#quick-run)
- [Comfortable development](#comfortable-development)
- [Links](#links)
- [Automatic update of dependencies](#automatic-update-of-dependencies)
- [Database utils](#database-utils)
- [Tests in Docker](#tests-in-docker)
- [Test benchmarking](#test-benchmarking)

## Quick run

```bash
cd supervisor-api/
cp env-example .env
docker compose up -d
```

For check status run

```bash
docker compose logs
```

## Comfortable development

Run additional container:

```bash
docker compose up -d postgres
```

```bash
yarn install

yarn migration:run

yarn seed:run

yarn start:dev

# Debugging mode
yarn start:debug
```

## Links

- Swagger: <http://localhost:3000/docs>

## Automatic update of dependencies

If you want to automatically update dependencies, you can connect [Renovate](https://github.com/marketplace/renovate) for your project.

## Database utils

Generate migration

```bash
yarn migration:generate -- src/database/migrations/<Table Name>
```

Run migration

```bash
yarn migration:run
```

Revert migration

```bash
yarn migration:revert
```

Drop all tables in database

```bash
yarn schema:drop
```

Run seed

```bash
yarn seed:run
```

## Tests in Docker

```bash
docker compose -f docker-compose.ci.yaml --env-file env-example -p ci up --build --exit-code-from api && docker compose -p ci rm -svf
```

## Test benchmarking

```bash
docker run --rm jordi/ab -n 100 -c 100 -T application/json -H "Authorization: Bearer USER_TOKEN" -v 2 http://<server_ip>:3000/api/v1/users
```
