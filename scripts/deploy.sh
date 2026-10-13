#!/usr/bin/env bash
# One-shot production deploy. Needs CLOUDFLARE_API_TOKEN in the environment
# (permissions: Workers Scripts Edit, D1 Edit, Workers R2 Storage Edit).
# D1 "van-fix" and R2 "van-fix" already exist; migrations are tracked in d1_migrations.
set -euo pipefail
: "${CLOUDFLARE_API_TOKEN:?Set CLOUDFLARE_API_TOKEN first}"
npm run build
npx wrangler d1 migrations apply van-fix --remote
npx wrangler deploy
if ! npx wrangler secret list 2>/dev/null | grep -q OWNER_KEY; then
  KEY=$(node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))")
  printf '%s' "$KEY" | npx wrangler secret put OWNER_KEY
  echo "OWNER_KEY created. It is saved ONLY in ./owner-key.txt (git-ignored): open /#/setup and enter it."
  printf '%s\n' "$KEY" > owner-key.txt
fi
