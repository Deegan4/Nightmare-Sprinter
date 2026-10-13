#!/usr/bin/env bash
# Wipe the local wrangler D1/R2 state and re-apply migrations (for e2e runs).
set -euo pipefail
rm -rf .wrangler/state
npx wrangler d1 migrations apply van-fix --local
