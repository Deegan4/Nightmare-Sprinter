#!/usr/bin/env bash
# One-shot production deploy. Needs CLOUDFLARE_API_TOKEN in the environment
# (permissions: Workers Scripts Edit, D1 Edit, Workers R2 Storage Edit).
# D1 "van-fix" and R2 "van-fix" already exist; migrations are tracked in d1_migrations.
set -euo pipefail
: "${CLOUDFLARE_API_TOKEN:?Set CLOUDFLARE_API_TOKEN first}"
npm run build
npx wrangler d1 migrations apply van-fix --remote
npx wrangler deploy
